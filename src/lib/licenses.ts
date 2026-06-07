// SPDX license rendering. Licenses are stored as SPDX identifiers (in content
// `license:` frontmatter, media props, and the `license` block); this resolves
// an id to a friendly display label + canonical URL. See ADR-035 / ADR-037.

export interface ResolvedLicense {
  /** The SPDX identifier as stored, e.g. "CC-BY-SA-4.0". */
  id: string;
  /** Friendly display label, e.g. "CC BY-SA 4.0". */
  label: string;
  /** Canonical URL for the license text. */
  url: string;
}

// The licenses we actually use. Anything else falls back to the SPDX page.
const KNOWN: Record<string, { label: string; url: string }> = {
  'CC-BY-SA-4.0': { label: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  'CC-BY-4.0': { label: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  'CC0-1.0': { label: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  'MIT': { label: 'MIT', url: 'https://opensource.org/license/mit' },
  'Community-Spec-1.0': { label: 'Community Spec 1.0', url: 'https://spdx.org/licenses/Community-Spec-1.0.html' },
};

/**
 * Resolve an SPDX identifier to a display label + URL. Unknown but plausible
 * ids fall back to their SPDX listing page so nothing renders as a dead string.
 * Returns null for empty/non-string input.
 */
export function resolveLicense(spdx: unknown): ResolvedLicense | null {
  if (typeof spdx !== 'string' || !spdx.trim()) return null;
  const id = spdx.trim();
  const known = KNOWN[id];
  if (known) return { id, ...known };
  // Only treat a plausible SPDX id as such; otherwise it's unresolvable.
  if (!/^[A-Za-z0-9.+-]+$/.test(id)) return null;
  return { id, label: id, url: `https://spdx.org/licenses/${id}.html` };
}

// ---- Inline chip rendering for the markdown pipeline ----
// `remark-html` strips raw HTML, so instead of emitting chip markup into the
// markdown (which would be sanitized away), the link processor and the fence
// plugin emit a SENTINEL — plain text that passes through markdown rendering and
// sanitization untouched. After rendering, `renderLicenseSentinels` swaps each
// sentinel for the chip HTML. That way we inject only our own trusted, escaped
// markup, without relaxing sanitization for any author-supplied HTML.

const SENTINEL = '\uF8FF'; // private-use char; never appears in content

export function licenseSentinel(spdx: string): string {
  return `${SENTINEL}LIC|${spdx}${SENTINEL}`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}

function chipHtml(id: string): string {
  const r = resolveLicense(id);
  if (!r) return escapeHtml(id);
  return (
    `<span class="not-prose inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 align-middle">` +
    `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer license" class="text-gray-700 hover:text-indigo-700 hover:underline">${escapeHtml(r.label)}</a>` +
    `</span>`
  );
}

export function renderLicenseSentinels(html: string): string {
  return html.replace(
    new RegExp(`${SENTINEL}LIC\\|([A-Za-z0-9.+-]+)${SENTINEL}`, 'g'),
    (_m, id) => chipHtml(id),
  );
}
