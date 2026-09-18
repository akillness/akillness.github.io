#!/usr/bin/env ruby
#
# Derive `last_modified_at` from the file's own commit history.
#
# Posts already did this. Tab pages did not, and `_tabs` is a collection, so
# Jekyll fills `document.date` with `site.time` when the front matter carries no
# date. jekyll-sitemap falls back to that value, so every deploy restamped all
# ten navigation pages with the build clock: the 2026-09-18 live sitemap carried
# ten identical `2026-09-18T13:45:44+09:00` entries for /about/, /privacy/,
# /terms/ and the rest, none of which had changed since 2026-08-22..09-07.
#
# Google honours <lastmod> only while it stays verifiably accurate, so a
# timestamp that moves on every unrelated publish is worse than no timestamp.
# CI checks out with fetch-depth: 0, so the history these commands read is the
# full history, not a shallow tip.

module GitLastmod
  module_function

  def commit_date(path)
    return nil unless path && File.file?(path)

    date = `git log -1 --pretty="%ad" --date=iso -- "#{path}"`.strip
    date.empty? ? nil : date
  end
end

Jekyll::Hooks.register :posts, :post_init do |post|

  commit_num = `git rev-list --count HEAD "#{ post.path }"`

  if commit_num.to_i > 1
    lastmod_date = `git log -1 --pretty="%ad" --date=iso "#{ post.path }"`
    post.data['last_modified_at'] = lastmod_date
  end

end

# Every other collection document, which today means the ten `_tabs` pages.
# A single commit is enough here: without this the fallback is the build clock,
# not the authored date, so there is no "unchanged since publication" case to
# preserve the way there is for posts.
Jekyll::Hooks.register :documents, :post_init do |doc|
  next if doc.collection&.label == 'posts'

  date = GitLastmod.commit_date(doc.path)
  doc.data['last_modified_at'] = date if date
end
