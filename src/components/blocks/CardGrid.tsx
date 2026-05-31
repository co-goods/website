import Card, { type CardProps } from './Card';

// A responsive grid of cards. Used directly by layouts (children) and as the
// `cardgrid` composed-page block (via the `cards` prop). Shares the standard
// contained section width so it lines up with prose/callout/cta blocks.

const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

interface CardGridProps {
  columns?: number;
  cards?: CardProps[];
  children?: React.ReactNode;
}

export default function CardGrid({ columns = 2, cards, children }: CardGridProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      <div className={`mx-auto max-w-3xl grid gap-6 ${COLS[columns] ?? COLS[2]}`}>
        {children ?? cards?.map((c, i) => <Card key={c.id ?? i} {...c} />)}
      </div>
    </section>
  );
}
