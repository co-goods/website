import Card, { type CardProps } from '@/components/blocks/Card';

// Area-overview body for the docs root + group index pages: a title and a grid
// of cards (sub-collections or leaf docs). The sidebar owns the full leaf tree,
// so this gives orientation instead of repeating it.
export default function DocCardListing({
  title,
  description,
  cards,
}: {
  title: string;
  description?: string;
  cards: CardProps[];
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-gray-600 mb-8">{description}</p>}
      {cards.length === 0 ? (
        <p className="text-gray-500">Nothing here yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(c => (
            <Card key={c.href ?? c.title} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}
