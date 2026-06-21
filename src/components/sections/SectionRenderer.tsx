import { Fragment } from 'react';
import { SECTION_REGISTRY } from './registry';

export interface RenderedSection {
  name: string;
  props: Record<string, unknown>;
  /** Pre-rendered HTML for body-rich sections; empty for config-only sections. */
  bodyHtml: string;
}

// Renders the ordered sections parsed from a custom page's markdown. A body-rich
// section receives its rendered markdown as children. A section may declare a
// reserved `id` prop, which becomes an anchor wrapper (e.g. for in-page links)
// without each component needing to know about it.
export function SectionRenderer({ sections }: { sections: RenderedSection[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const entry = SECTION_REGISTRY[section.name];
        if (!entry) return null;

        const Component = entry.component;
        const { id, ...props } = section.props as { id?: string } & Record<
          string,
          unknown
        >;

        const node = entry.body ? (
          <Component {...props}>
            {/* display:contents so the body has no box of its own — a single
                paragraph flows inline (e.g. inside a quote's marks) while
                multi-paragraph bodies still stack as blocks. */}
            <div
              style={{ display: 'contents' }}
              dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
            />
          </Component>
        ) : (
          <Component {...props} />
        );

        return id ? (
          // scroll-mt offsets the sticky header when linked to via #id.
          <div id={String(id)} className="scroll-mt-20" key={index}>
            {node}
          </div>
        ) : (
          <Fragment key={index}>{node}</Fragment>
        );
      })}
    </>
  );
}
