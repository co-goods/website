import matter from 'gray-matter';

// A section block is authored in markdown as a fenced code block whose info
// string is the block name. The fenced content is the block's YAML props.
// Body-rich blocks (prose, quote, callout) then consume the readable markdown
// that follows the fence, up to the next opening block, an explicit close
// (```/name), or end of file. Config-only blocks (hero, cta, emailsignup)
// take their content entirely from the YAML props and own no body.

export interface BlockSpec {
  /** True when the block consumes the markdown that follows its fence. */
  body: boolean;
}

export type BlockSpecMap = Record<string, BlockSpec>;

export interface ParsedBlock {
  name: string;
  props: Record<string, unknown>;
  /** Raw markdown body for body-rich blocks; empty for config-only blocks. */
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
 * Walk markdown and extract the ordered list of section blocks. Real code
 * blocks (```ts, ```bash, …) are not in the spec map and fall through: they
 * stay part of whatever body-rich block is open, or are skipped when none is.
 */
export function parseBlocks(markdown: string, specs: BlockSpecMap): ParsedBlock[] {
  const lines = markdown.split('\n');
  const blocks: ParsedBlock[] = [];

  let open: ParsedBlock | null = null; // open body-rich block accumulating body
  let bodyLines: string[] = [];

  const flush = () => {
    if (open) {
      open.bodyMarkdown = bodyLines.join('\n').trim();
      blocks.push(open);
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

      // Explicit close: ```/name — ends the current body-rich block.
      if (info.startsWith('/')) {
        flush();
        i++;
        while (i < lines.length && !BARE_FENCE.test(lines[i])) i++;
        i++; // step past the closing fence
        continue;
      }

      // Opening fence for a known block.
      if (specs[info]) {
        flush(); // a new block implicitly closes the previous one
        i++;
        const yaml: string[] = [];
        while (i < lines.length && !BARE_FENCE.test(lines[i])) {
          yaml.push(lines[i]);
          i++;
        }
        i++; // step past the closing fence
        const block: ParsedBlock = {
          name: info,
          props: parseYamlProps(yaml.join('\n')),
          bodyMarkdown: '',
        };
        if (specs[info].body) {
          open = block;
          bodyLines = [];
        } else {
          blocks.push(block);
        }
        continue;
      }

      // A real (non-block) code fence. Keep it verbatim inside the open body;
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
  return blocks;
}
