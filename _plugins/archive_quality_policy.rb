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

  # A generated tag or category page whose whole body is one heading and one
  # link is an auto-generated page with no original content. `sitemap: false`
  # only removed those pages from search; it never removed them from the
  # crawlable surface, because /tags/ and /categories/ still link every one of
  # them. Stop building the thin ones and publish the surviving set so that every
  # template which links an archive filters on the same list the pages were
  # built from. Counting mirrors _layouts/tag.html and _layouts/category.html: a
  # post hidden from listings or held back from search is not a visible post.
  module ThinArchivePolicy
    module_function

    DEFAULT_MINIMUM = 2

    # layout:       the jekyll-archives layout name ('tag' or 'category')
    # config_key:   _config.yml key holding the integer floor
    # counts_key:   site.data key that receives { raw name => visible count }
    # linkable_key: site.data key that receives the sorted surviving names
    def prune(site, layout:, config_key:, counts_key:, linkable_key:, label:)
      minimum = Integer(site.config[config_key] || DEFAULT_MINIMUM)
      counts = {}
      thin = []

      site.pages.each do |page|
        next unless page.data['layout'] == layout
        next unless page.respond_to?(:posts) && page.respond_to?(:title)

        title = page.title
        next unless title.is_a?(String)

        # Keyed by the raw name, which is also what `page.tags` / `page.categories`
        # yield, so a chip and its archive agree. Two raw names can still slugify
        # to one URL; if both survive, verify-site-quality compares the hub's link
        # count against the number of pages actually built and fails on the
        # collision.
        count = visible_posts(page).size
        counts[title] = count
        thin << page if count < minimum
      end

      site.pages.reject! { |page| thin.include?(page) }
      archives = site.config['archives']
      archives.reject! { |archive| thin.include?(archive) } if archives.respond_to?(:reject!)

      site.data[counts_key] = counts
      site.data[linkable_key] =
        counts.reject { |_, count| count < minimum }.keys.sort_by(&:downcase)

      Jekyll.logger.info "#{label}:",
                         "kept #{site.data[linkable_key].size}, " \
                         "dropped #{thin.size} below #{minimum} visible post(s)"
    end

    def visible_posts(page)
      Array(page.posts).reject do |post|
        post.data['hidden'] == true || post.data['robots'].to_s.include?('noindex')
      end
    end
  end

  # Runs at :low, after jekyll-archives (:normal) has created the archives and
  # before ArchiveQualityPolicy (:lowest) stamps the survivors.
  class ThinTagArchivePolicy < Generator
    safe true
    priority :low

    def generate(site)
      ThinArchivePolicy.prune(site,
                              layout: 'tag',
                              config_key: 'tag_archive_min_posts',
                              counts_key: 'tag_visible_counts',
                              linkable_key: 'linkable_tags',
                              label: 'Tags')
    end
  end

  # Same floor for category archives. Consumers: _includes/post-categories.html
  # (post tail) and _layouts/categories.html (hub) link a category only when it
  # is in site.data.linkable_categories.
  class ThinCategoryArchivePolicy < Generator
    safe true
    priority :low

    def generate(site)
      ThinArchivePolicy.prune(site,
                              layout: 'category',
                              config_key: 'category_archive_min_posts',
                              counts_key: 'category_visible_counts',
                              linkable_key: 'linkable_categories',
                              label: 'Categories')
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
