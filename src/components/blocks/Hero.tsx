import Link from 'next/link';
import NextImage from 'next/image';

type HeroVariant = 'default' | 'gradient' | 'minimal';
type HeroTone = 'light' | 'dark';

interface HeroProps {
  variant?: HeroVariant;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  children?: React.ReactNode;
  // Full-bleed background media — an image, a YouTube clip, or a muted looping
  // self-hosted video — with the text overlaid (the text-on-image treatment
  // from the DePalma Workwear hero). When none is set, the hero renders on the
  // flat `variant` background, as before. Precedence: image, then YouTube,
  // then video.
  backgroundImage?: string;
  backgroundYouTube?: string;
  backgroundVideo?: string;
  poster?: string;
  // Text colour over the background. Defaults to `light` when media is present
  // (text sits on imagery), `dark` otherwise.
  tone?: HeroTone;
  // A dark scrim over the media for text legibility. Defaults to `scrim` when
  // media is present.
  overlay?: 'scrim' | 'none';
}

// TODO: migrate to Grund — the text-on-image composition (full-bleed media +
// scrim + overlaid content) is a media-overlay Pattern; the brand-agnostic
// responsive image belongs in a Grund Component. The hero's content vocabulary
// (eyebrow/title/subtitle/cta) stays here.

const VARIANT_BG: Record<HeroVariant, string> = {
  default: 'bg-white',
  gradient: 'bg-gradient-to-br from-indigo-50 via-white to-amber-50',
  minimal: 'bg-transparent',
};

export default function Hero({
  variant = 'default',
  eyebrow,
  title,
  subtitle,
  cta,
  secondaryCta,
  children,
  backgroundImage,
  backgroundYouTube,
  backgroundVideo,
  poster,
  tone,
  overlay,
}: HeroProps) {
  const hasMedia = Boolean(backgroundImage || backgroundYouTube || backgroundVideo);
  const isLight = (tone ?? (hasMedia ? 'light' : 'dark')) === 'light';
  const showScrim = hasMedia && (overlay ?? 'scrim') === 'scrim';
  const isRemote = backgroundImage ? /^https?:\/\//.test(backgroundImage) : false;

  const sectionClass = hasMedia
    ? 'relative isolate overflow-hidden flex items-center min-h-[60vh] px-4 sm:px-6 lg:px-8 py-24 sm:py-32'
    : `${VARIANT_BG[variant]} px-4 sm:px-6 lg:px-8 py-20 sm:py-28`;

  return (
    <section className={sectionClass}>
      {hasMedia && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {backgroundImage ? (
            <NextImage
              src={backgroundImage}
              alt=""
              fill
              priority
              unoptimized={isRemote}
              className="object-cover"
            />
          ) : backgroundYouTube ? (
            // YouTube can't object-cover like a <video>, so size the iframe to
            // 16:9 and centre it large enough to cover the box (177.78vh wide /
            // 56.25vw tall, whichever wins). pointer-events-none so the cover
            // video never intercepts clicks on the hero.
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${backgroundYouTube}?autoplay=1&mute=1&loop=1&playlist=${backgroundYouTube}&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0`}
              title=""
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            />
          ) : (
            <video
              src={backgroundVideo}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          {showScrim && <div className="absolute inset-0 bg-black/45" />}
        </div>
      )}

      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && (
          <p
            className={`text-sm font-semibold uppercase tracking-wide mb-3 ${
              isLight ? 'text-indigo-200' : 'text-indigo-700'
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${
            isLight ? 'text-white' : 'text-gray-900'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-6 text-lg sm:text-xl leading-relaxed ${
              isLight ? 'text-gray-100' : 'text-gray-600'
            }`}
          >
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-8 prose prose-slate mx-auto">{children}</div>
        )}
        {(cta || secondaryCta) && (
          <div className="mt-10 flex items-center justify-center gap-x-4">
            {cta && (
              <Link
                href={cta.href}
                className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {cta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className={`text-sm font-semibold ${
                  isLight
                    ? 'text-white hover:text-gray-200'
                    : 'text-gray-900 hover:text-gray-700'
                }`}
              >
                {secondaryCta.label} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
