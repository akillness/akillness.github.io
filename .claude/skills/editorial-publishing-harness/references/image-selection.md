# Source-first image selection

Approved scope: akillness Git blog only. Inspect relevant primary materials first. Use relevant rights-cleared source imagery when available; do not pad the count. Fewer than four source images alone does not block an approved fallback package. Legacy manifests retain the 4–12 rule. Source rights, metadata, size, owner-capture allowlists and exact figure credits remain unchanged. Generated/original illustrations are explanations, never primary/source evidence.

## Package contract

Post front matter: image_policy: source-first-fallback. In internal draft/source-image-manifest.json, retain schema_version: 1, matching run_id, and images: [] (or normal source entries). Add:

- image_policy: source-first-fallback
- source_first_audit.report_path: research/image-source-audit.md
- source_first_audit.sha256: SHA-256 of that exact UTF-8 report
- source_first_audit.candidates: nonempty array of {source_page_url, decision, reason}; URLs must be evidence-pack claim source_url values and appear in the report; reason is at least 20 characters. decision is used, rights-unclear, irrelevant, or no-usable-image. Every used candidate must have a normal images[] entry. The report must document inspected imagery, relevance, rights and rejection reasons, not just assert approval.
- explanatory_images: nonempty array of {local_path, kind, creator, alt, attribution_text, sha256, bytes}. kind is original or generated. Store local raster assets outside references/. Hash and byte count must match the actual file.

Each explanatory asset appears exactly once as a top-level visible HTML figure with class="explanatory-image", one img with matching /local_path and alt, and one figcaption containing the exact attribution_text. Credit contains "AI-generated illustration by <creator>" or "Original illustration by <creator>", plus "not source evidence". Identify the actual tool/creator and the depicted idea without implying measured results or source authorship. No hidden figures or no-image bypass. Existing raster limits also apply to fallback. Tables and transparent SVG remain preferred additional explanations but do not substitute for this narrow raster fallback check.

The report and sidecar stay internal. The shipped tree must retain the front-matter mode and visible credited local original/generated illustration; fresh-clone validation checks its presence and bytes. Source image manifests remain required internally whenever sources are used.
