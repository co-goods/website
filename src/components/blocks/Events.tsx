import { loadEvents, type CoGoodsEvent, type EventKind } from '@/lib/events';

// Renders community events from data/events.yaml. Authored as a block:
//   ```events
//   filter: upcoming   # upcoming (default) | past | all
//   limit: 5
//   heading: What's next
//   ```
//
// NOTE: the upcoming/past split is computed at build time, so it's accurate as
// of the last deploy. If freshness between deploys matters, move the date
// filtering into a small client component (ship all events, split on the
// client's current date).
//
// TODO: migrate to Grund — the event card is a candidate Grund Component once
// the design system covers cards.

type EventFilter = 'upcoming' | 'past' | 'all';

interface EventsProps {
  filter?: EventFilter;
  limit?: number;
  heading?: string;
}

const KIND_LABEL: Record<EventKind, string> = {
  'irl': 'In person',
  'video-call': 'Video call',
  'discord-call': 'Discord',
};

const KIND_STYLE: Record<EventKind, string> = {
  'irl': 'bg-amber-100 text-amber-800',
  'video-call': 'bg-sky-100 text-sky-800',
  'discord-call': 'bg-indigo-100 text-indigo-800',
};

function formatWhen(start: string, end?: string): string {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
  const startMs = Date.parse(start);
  if (Number.isNaN(startMs)) return start;
  const base = fmt.format(new Date(startMs)) + ' UTC';
  const endMs = end ? Date.parse(end) : NaN;
  if (!Number.isNaN(endMs)) {
    const endTime = new Intl.DateTimeFormat('en-GB', {
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(endMs));
    return `${base} – ${endTime}`;
  }
  return base;
}

export default function Events({ filter = 'upcoming', limit, heading }: EventsProps) {
  const now = Date.now();
  const refTime = (e: CoGoodsEvent) => Date.parse(e.end ?? e.start);

  let events = loadEvents();
  if (filter === 'upcoming') {
    events = events.filter(e => refTime(e) >= now).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  } else if (filter === 'past') {
    events = events.filter(e => refTime(e) < now).sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
  } else {
    events = events.sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
  }
  if (typeof limit === 'number') events = events.slice(0, limit);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-3xl">
        {heading && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2>
        )}
        {events.length === 0 ? (
          <p className="text-gray-500">
            {filter === 'past' ? 'No past events yet.' : 'No upcoming events scheduled — check back soon.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {events.map((e, i) => (
              <li
                key={`${e.title}-${i}`}
                className="rounded-lg border border-gray-200 p-5"
              >
                <div className="flex items-center gap-x-3 mb-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${KIND_STYLE[e.kind] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {KIND_LABEL[e.kind] ?? e.kind}
                  </span>
                  <span className="text-sm text-gray-500">{formatWhen(e.start, e.end)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {e.url ? (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-700"
                    >
                      {e.title}
                    </a>
                  ) : (
                    e.title
                  )}
                </h3>
                {e.location && <p className="text-sm text-gray-600 mt-1">{e.location}</p>}
                {e.summary && <p className="text-gray-700 mt-2">{e.summary}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
