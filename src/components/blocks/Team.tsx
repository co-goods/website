import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import { loadPeople } from '@/lib/people';
import { getCollection } from '@/lib/content/collections';
import PersonCard from './PersonCard';

// A grid of people, read from the content repo and filtered by `affiliation`
// (e.g. the Core Team). Configurable: how many columns, whether names link to
// full profiles, and an optional trailing CTA card (an "Is this you?" style
// invitation) rendered as the last cell.
//
//   ```team
//   heading: Core team
//   filter: co-goods-team   # affiliation to match; omit for everyone
//   columns: 2
//   link: true              # link names to /people/<slug>
//   cta:
//     heading: Is this you?
//     body: We're a small team and growing — if your work belongs here, say hello.
//     label: Get in touch
//     href: /community
//   ```

interface TeamCta {
  heading?: string;
  body?: string;
  label?: string;
  href?: string;
}

interface TeamProps {
  heading?: string;
  filter?: string;
  columns?: number;
  link?: boolean;
  cta?: TeamCta;
}

const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

function JoinCard({ cta }: { cta: TeamCta }) {
  return (
    <div className="h-full flex flex-col rounded-lg border border-indigo-200 bg-indigo-50 p-6">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-indigo-300 text-indigo-300"
        >
          <FaUser className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-indigo-900">{cta.heading ?? 'Is this you?'}</h3>
      </div>
      {cta.body && <p className="mt-3 text-sm text-indigo-700">{cta.body}</p>}
      {cta.label && cta.href && (
        <div className="mt-4">
          <Link
            href={cta.href}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Team({ heading, filter, columns = 2, link = false, cta }: TeamProps) {
  let people = loadPeople().filter(p => p.status !== 'inactive');
  if (filter) people = people.filter(p => p.affiliation === filter);

  const peopleUrl = getCollection('people')?.urlPrefix ?? '/people';

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-3xl">
        {heading && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2>
        )}
        <div className={`grid gap-6 ${COLS[columns] ?? COLS[2]}`}>
          {people.map(p => (
            <PersonCard
              key={p.slug}
              name={p.name}
              role={p.role}
              bio={p.bio}
              github={p.github}
              href={link ? `${peopleUrl}/${p.slug}` : undefined}
            />
          ))}
          {cta && <JoinCard cta={cta} />}
        </div>
      </div>
    </section>
  );
}
