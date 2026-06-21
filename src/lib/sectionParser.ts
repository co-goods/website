import matter from 'gray-matter';

// A section is authored in markdown as a fenced code block whose info
// string is the section name. The fenced content is the section's YAML props.
// Body-rich sections (prose, quote, callout) then consume the readable markdown
// that follows the fence, up to the next opening section, an explicit close
// (```/name), or end of file. Config-only sections (hero, cta, emailsignup)
// take their content entirely from the YAML props and own no body.

export interface SectionSpec {
  /** True when the section consumes the markdown that follows its fence. */
  body: boolean;
}

export type SectionSpecMap = Record<string, SectionSpec>;

export interface ParsedSection {
  name: string;
  props: Record<string, unknown>;
  /** Raw markdown body for body-rich sections; empty for config-only sections. */
  bodyMarkdown: string;
}

const FENCE = /^```+\s*(.*)$/;
const BARE_FENCE = /^```+\s*$/;

function parseYamlProps(yamlText: string): Record<string, unknown> {
  if (!yamlText.trim()) return {};
  // Reuse gray-matter's YAML engine by wrapping the props in a front-matter
  // envelope — avoids pulling in a second YAML dependency.
  const { data } = matter(`---\n${yamlText}\n---\n`);
  return data as Record<string, unknown>;
}

/**
 * Walk markdown and extract the ordered list of sections. Real code
 * blocks (```ts, ```bash, …) are not in the spec map and fall through: they
 * stay part of whatever body-rich section is open, or are skipped when none is.
 */
export function parseSections(markdown: string, specs: SectionSpecMap): ParsedSection[] {
  const lines = markdown.split('\n');
  const sections: ParsedSection[] = [];

  let open: ParsedSection | null = null; // open body-rich section accumulating body
  let bodyLines: string[] = [];

  const flush = () => {
    if (open) {
      open.bodyMarkdown = bodyLines.join('\n').trim();
      sections.push(open);
      open = null;
      bodyLines = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = FENCE.exec(line);

    if (fence) {
      const info = fence[1].trim();

      // Explicit close: ```/name — ends the current body-rich section.
      if (info.startsWith('/')) {
        flush();
        i++;
        while (i < lines.length && !BARE_FENCE.test(lines[i])) i++;
        i++; // step past the closing fence
        continue;
      }

      // Opening fence for a known section.
      if (specs[info]) {
        flush(); // a new section implicitly closes the previous one
        i++;
        const yaml: string[] = [];
        while (i < lines.length && !BARE_FENCE.test(lines[i])) {
          yaml.push(lines[i]);
          i++;
        }
        i++; // step past the closing fence
        const section: ParsedSection = {
          name: info,
          props: parseYamlProps(yaml.join('\n')),
          bodyMarkdown: '',
        };
        if (specs[info].body) {
          open = section;
          bodyLines = [];
        } else {
          sections.push(section);
        }
        continue;
      }

      // A real (non-section) code fence. Keep it verbatim inside the open body;
      // otherwise skip it.
      if (open) {
        bodyLines.push(line);
        i++;
        while (i < lines.length && !BARE_FENCE.test(lines[i])) {
          bodyLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          bodyLines.push(lines[i]); // include the closing fence
          i++;
        }
      } else {
        i++;
        while (i < lines.length && !BARE_FENCE.test(lines[i])) i++;
        i++;
      }
      continue;
    }

    // Ordinary line: part of the open body, or ignored prose otherwise.
    if (open) bodyLines.push(line);
    i++;
  }

  flush();
  return sections;
}
