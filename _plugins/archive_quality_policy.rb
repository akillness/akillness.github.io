# frozen_string_literal: true

# Generated tag/category details and paginated home pages are useful navigation,
# but are not standalone search landing pages. Keep them crawlable for link
# discovery while excluding them from the sitemap and search index.
module Jekyll
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
