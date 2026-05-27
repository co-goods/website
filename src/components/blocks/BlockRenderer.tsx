import { Fragment } from 'react';
import { BLOCK_REGISTRY } from './registry';

export interface RenderedBlock {
  name: string;
  props: Record<string, unknown>;
  /** Pre-rendered HTML for body-rich blocks; empty for config-only blocks. */
  bodyHtml: string;
}

// Renders the ordered blocks parsed from a custom page's markdown. A body-rich
// block receives its rendered markdown as children. A block may declare a
// reserved `id` prop, which becomes an anchor wrapper (e.g. for in-page links)
// without each component needing to know about it.
export function BlockRenderer({ blocks }: { blocks: RenderedBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const entry = BLOCK_REGISTRY[block.name];
        if (!entry) return null;

        const Component = entry.component;
        const { id, ...props } = block.props as { id?: string } & Record<
          string,
          unknown
        >;

        const node = entry.body ? (
          <Component {...props}>
            <div dangerouslySetInnerHTML={{ __html: block.bodyHtml }} />
          </Component>
        ) : (
          <Component {...props} />
        );

        return id ? (
          <div id={String(id)} key={index}>
            {node}
          </div>
        ) : (
          <Fragment key={index}>{node}</Fragment>
        );
      })}
    </>
  );
}
