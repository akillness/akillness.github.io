# frozen_string_literal: true

# Generated tag and category detail pages are useful navigation, but most are
# not standalone search landing pages. Keep them crawlable for link discovery
# while excluding them from the sitemap and search index.
module Jekyll
  class ArchiveQualityPolicy < Generator
    safe true
    priority :lowest

    def generate(site)
      site.pages.each do |page|
        next unless %w[tag category].include?(page.data['layout'])

        page.data['robots'] = 'noindex, follow'
        page.data['sitemap'] = false
      end
    end
  end
end
