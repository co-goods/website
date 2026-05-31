import type { ComponentType } from 'react';
import Hero from './Hero';
import Quote from './Quote';
import Callout from './Callout';
import CTA from './CTA';
import EmailSignup from './EmailSignup';
import Prose from './Prose';
import Image from './Image';
import Video from './Video';
import Events from './Events';
import ContributeCallout from './ContributeCallout';
import CardGrid from './CardGrid';
import type { BlockSpecMap } from '@/lib/blockParser';

interface RegistryEntry {
  // Block prop shapes vary per component; the renderer spreads parsed props.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  body: boolean;
}

// The authoring vocabulary: maps a fenced block name to its component and
// whether it consumes a markdown body.
export const BLOCK_REGISTRY: Record<string, RegistryEntry> = {
  hero: { component: Hero, body: false },
  prose: { component: Prose, body: true },
  quote: { component: Quote, body: true },
  callout: { component: Callout, body: true },
  emailsignup: { component: EmailSignup, body: false },
  cta: { component: CTA, body: false },
  image: { component: Image, body: false },
  video: { component: Video, body: false },
  events: { component: Events, body: false },
  contribute: { component: ContributeCallout, body: false },
  cardgrid: { component: CardGrid, body: false },
};

// Body flags only — handed to the parser, which stays component-agnostic.
export const BLOCK_SPECS: BlockSpecMap = Object.fromEntries(
  Object.entries(BLOCK_REGISTRY).map(([name, { body }]) => [name, { body }])
);
