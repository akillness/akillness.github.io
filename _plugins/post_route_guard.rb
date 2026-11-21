# frozen_string_literal: true

# The filename date is not necessarily part of the permalink. Ask Jekyll for
# each post's real output path, including slug and permalink overrides.
Jekyll::Hooks.register :site, :post_read do |site|
  destinations = site.posts.docs.select(&:write?).group_by { |post| post.destination(site.dest) }
  collisions = destinations.values.select { |posts| posts.length > 1 }
  next if collisions.empty?

  details = collisions.map do |posts|
    "#{posts.map(&:url).uniq.sort.join(' / ')}: #{posts.map(&:relative_path).sort.join(', ')}"
  end
  raise Jekyll::Errors::FatalException, "Published post route collision:\n#{details.sort.join("\n")}"
end
