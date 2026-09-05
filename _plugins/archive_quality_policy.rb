# frozen_string_literal: true

# Generated tag/category details and paginated home pages are useful navigation,
# but are not standalone search landing pages. Keep them crawlable for link
# discovery while excluding them from the sitemap and search index.
module Jekyll
  module PaginationSitemapPolicy
    module_function

    PAGINATION_URL = %r{<url>\s*<loc>[^<]*/page\d+/</loc>.*?</url>\s*}m

    def strip(xml)
      xml.gsub(PAGINATION_URL, '')
    end

    # Remove one post URL block. Matching on the path suffix keeps this correct
    # whether or not `site.url` is configured when the sitemap is generated.
    def strip_path(xml, path)
      xml.gsub(%r{<url>\s*<loc>[^<]*#{Regexp.escape(path)}</loc>.*?</url>\s*}m, '')
    end
  end

  # The editorial standard published on /about/ and /start-here/ says a post
  # without enough original analysis is removed from search as well as from
  # advertising. `_layouts/post.html` already stamps the authoritative verdict on
  # every rendered post as `data-monetization-eligible`, so read that verdict back
  # off the built artifact instead of re-deriving a word count here. Re-deriving it
  # is what allowed search and advertising to disagree in the first place.
  module ThinPostSitemapPolicy
    module_function

    INELIGIBLE = 'data-monetization-eligible="false"'

    def ineligible_paths(site)
      site.posts.docs.filter_map do |post|
        built = post.destination(site.dest)
        next unless File.file?(built)
        next unless File.read(built).include?(INELIGIBLE)

        post.url
      end
    end
  end

  # jekyll-paginate already excludes posts with `hidden: true`. Mirror the
  # noindex visibility boundary before its lowest-priority generator runs so it
  # calculates page counts from the same collection the home layout renders.
  # `hidden` is a theme/paginator flag; the post document is still rendered and
  # remains directly accessible at its permalink.
  class NoindexPostVisibilityPolicy < Generator
    safe true
    priority :highest

    def generate(site)
      site.posts.docs.each do |post|
        next unless post.data['robots'].to_s.include?('noindex')

        post.data['hidden'] = true
      end
    end
  end

  class ArchiveQualityPolicy < Generator
    safe true
    priority :lowest

    def generate(site)
      site.pages.each do |page|
        archive_page = %w[tag category].include?(page.data['layout'])
        pagination_page = page.url.match?(%r{\A/page\d+/?\z})
        next unless archive_page || pagination_page

        page.data['robots'] = 'noindex, follow'
        page.data['sitemap'] = false
      end
    end
  end
end

# jekyll-sitemap and jekyll-paginate both run at lowest priority, so generator
# ordering cannot reliably exclude pages created by the paginator. Enforce the
# final invariant on the generated artifact after every writer has finished.
Jekyll::Hooks.register :site, :post_write do |site|
  sitemap_path = File.join(site.dest, 'sitemap.xml')
  next unless File.file?(sitemap_path)

  original = File.read(sitemap_path)
  filtered = Jekyll::PaginationSitemapPolicy.strip(original)
  paginated_removed = filtered != original

  thin_paths = Jekyll::ThinPostSitemapPolicy.ineligible_paths(site)
  thin_paths.each do |path|
    filtered = Jekyll::PaginationSitemapPolicy.strip_path(filtered, path)
  end

  next if filtered == original

  File.write(sitemap_path, filtered)
  Jekyll.logger.info 'Sitemap:', 'removed paginated home URLs' if paginated_removed
  unless thin_paths.empty?
    Jekyll.logger.info 'Sitemap:', "removed #{thin_paths.length} post URL(s) held back from search and advertising"
  end
end
