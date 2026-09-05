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
  next if filtered == original

  File.write(sitemap_path, filtered)
  Jekyll.logger.info 'Sitemap:', 'removed paginated home URLs'
end
