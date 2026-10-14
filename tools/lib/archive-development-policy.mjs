// Archive development program (owner instruction, 2026-10-14):
// "Do not leave the restored archive posts as they were. For each post,
// survey, research, develop, and publish." This module validates the ledger
// in _data/archive_development.json and tells the site validators which
// approved restored sources have graduated out of the archive exception
// (or been retired) so that the 2026-10-12 restoration contract and the
// editorial-cohort rules never apply to the same file at the same time.
export const ARCHIVE_DEVELOPMENT_PROGRAM_ID = 'archive-development-2026-10-14';
export const ARCHIVE_DEVELOPMENT_START_DATE = '2026-10-14';
export const ARCHIVE_DEVELOPMENT_STATUSES = ['pending', 'in_progress', 'graduated', 'retired', 'merged'];
export const MIN_SURVEY_NOTE_LENGTH = 80;
export const ARCHIVE_DEVELOPED_MARKER_FIELD = 'archive_developed';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const POST_PATH_PATTERN = /^_posts\/[^\s\\]+\.md$/;

const isSafePath = (value) => typeof value === 'string' && POST_PATH_PATTERN.test(value) && !value.includes('..');

export function validateArchiveDevelopment(record, restoredSources) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(`archive development: ${message}`); };
  const graduatedSources = new Set();
  const retiredSources = new Set();
  const mergedSources = new Map();
  const entriesByPath = new Map();

  require(record && typeof record === 'object' && !Array.isArray(record), 'ledger is missing or not an object');
  if (errors.length) return { errors, graduatedSources, retiredSources, mergedSources, entriesByPath };
  require(record.schema_version === 1, 'unsupported schema');
  require(record.program_id === ARCHIVE_DEVELOPMENT_PROGRAM_ID, 'unknown program id');
  require(record.owner_instruction_date === ARCHIVE_DEVELOPMENT_START_DATE, 'owner instruction date drifted');
  require(typeof record.owner_instruction === 'string' && record.owner_instruction.length >= 40, 'owner instruction text is missing');
  require(Array.isArray(record.statuses) && JSON.stringify(record.statuses) === JSON.stringify(ARCHIVE_DEVELOPMENT_STATUSES), 'status vocabulary drifted');

  const posts = Array.isArray(record.posts) ? record.posts : [];
  const restored = restoredSources instanceof Set ? restoredSources : new Set(restoredSources || []);
  require(posts.length === restored.size, `ledger must cover every approved restored source exactly once (${posts.length} vs ${restored.size})`);

  for (const entry of posts) {
    if (!entry || typeof entry !== 'object') { errors.push('archive development: ledger entry is not an object'); continue; }
    const where = entry.path || '(no path)';
    require(isSafePath(entry.path), `${where}: unsafe or missing post path`);
    require(restored.has(entry.path), `${where}: path is not part of the approved 2026-10-12 restoration set`);
    require(!entriesByPath.has(entry.path), `${where}: duplicate ledger entry`);
    entriesByPath.set(entry.path, entry);
    require(ARCHIVE_DEVELOPMENT_STATUSES.includes(entry.status), `${where}: unknown status ${entry.status}`);
    require(typeof entry.original_date === 'string' && DATE_PATTERN.test(entry.original_date), `${where}: original_date must be YYYY-MM-DD`);
    require(Number.isInteger(entry.priority), `${where}: priority must be an integer`);
    if (entry.status === 'graduated' || entry.status === 'retired' || entry.status === 'merged') {
      require(typeof entry.developed_at === 'string' && DATE_PATTERN.test(entry.developed_at) && entry.developed_at >= ARCHIVE_DEVELOPMENT_START_DATE, `${where}: ${entry.status} entries need a developed_at date on or after ${ARCHIVE_DEVELOPMENT_START_DATE}`);
      require(typeof entry.survey_note === 'string' && entry.survey_note.trim().length >= MIN_SURVEY_NOTE_LENGTH, `${where}: ${entry.status} entries need a survey_note of at least ${MIN_SURVEY_NOTE_LENGTH} characters`);
    }
    if (entry.status === 'graduated') graduatedSources.add(entry.path);
    if (entry.status === 'retired') retiredSources.add(entry.path);
    if (entry.status === 'merged') {
      require(isSafePath(entry.merged_into) && entry.merged_into !== entry.path, `${where}: merged entries need a merged_into post path`);
      mergedSources.set(entry.path, entry.merged_into);
    }
  }
  for (const source of restored) require(entriesByPath.has(source), `${source}: approved restored source is missing from the ledger`);

  if (errors.length) return { errors, graduatedSources: new Set(), retiredSources: new Set(), mergedSources: new Map(), entriesByPath };
  return { errors, graduatedSources, retiredSources, mergedSources, entriesByPath };
}

// Front-matter contract for a file whose ledger status is "graduated".
export function graduatedFrontMatterErrors(fields, entry, sourcePath) {
  const errors = [];
  const where = sourcePath || entry?.path || '(unknown)';
  if (fields.restored_archive) errors.push(`${where}: graduated post still carries the restored_archive marker`);
  if (fields[ARCHIVE_DEVELOPED_MARKER_FIELD] !== entry?.developed_at) errors.push(`${where}: ${ARCHIVE_DEVELOPED_MARKER_FIELD} must equal the ledger developed_at (${entry?.developed_at})`);
  if (!fields.last_modified_at || String(fields.last_modified_at).slice(0, 10) < ARCHIVE_DEVELOPMENT_START_DATE) errors.push(`${where}: graduated post needs last_modified_at on or after ${ARCHIVE_DEVELOPMENT_START_DATE}`);
  if (String(fields.date || '').slice(0, 10) !== entry?.original_date) errors.push(`${where}: original publication date must be preserved (${entry?.original_date})`);
  if (/noindex/i.test(String(fields.robots || ''))) errors.push(`${where}: graduated post must be indexable`);
  if (fields.published === 'false') errors.push(`${where}: graduated post must be published`);
  return errors;
}

// Front-matter contract for a file whose ledger status is "retired" or "merged".
export function retiredFrontMatterErrors(fields, sourcePath) {
  const errors = [];
  const where = sourcePath || '(unknown)';
  if (fields.restored_archive) errors.push(`${where}: retired post still carries the restored_archive marker`);
  if (!/^noindex, follow$/i.test(String(fields.robots || ''))) errors.push(`${where}: retired post must be robots: noindex, follow`);
  if (fields.sitemap !== 'false') errors.push(`${where}: retired post must be sitemap: false`);
  if (fields.ads !== 'false') errors.push(`${where}: retired post must be ads: false`);
  return errors;
}
