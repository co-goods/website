import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Community events are structured data, not documents — they live in the
// content repo at data/events.yaml (a single list) rather than one markdown
// file each. This loads + validates that list. The events block renders it.

const EVENTS_FILE = path.join(process.cwd(), 'content', 'data', 'events.yaml');

export type EventKind = 'irl' | 'video-call' | 'discord-call';

export interface CoGoodsEvent {
  title: string;
  start?: string;       // dated one-off events; absent for recurring
  end?: string;
  kind: EventKind;
  location?: string;
  url?: string;
  summary?: string;
  recurrence?: string;  // a human schedule string marks a recurring event
}

export function loadEvents(): CoGoodsEvent[] {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  // JSON_SCHEMA so ISO datetimes stay strings — the default schema would parse
  // them into Date objects.
  const parsed = yaml.load(fs.readFileSync(EVENTS_FILE, 'utf8'), { schema: yaml.JSON_SCHEMA });
  if (!Array.isArray(parsed)) return [];
  // Keep an entry if it has a title and is either dated (start) or recurring
  // (recurrence).
  return parsed.filter(
    (e): e is CoGoodsEvent =>
      !!e &&
      typeof e === 'object' &&
      typeof (e as CoGoodsEvent).title === 'string' &&
      (typeof (e as CoGoodsEvent).start === 'string' ||
        typeof (e as CoGoodsEvent).recurrence === 'string'),
  );
}
