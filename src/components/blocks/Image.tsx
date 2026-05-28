import NextImage from 'next/image';
import Attribution from './Attribution';

interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: string;
  credit?: string;
  creditUrl?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
}

// Wraps next/image with caption + attribution support. For decorative images,
// pass alt="". For above-the-fold (hero) images, pass priority for LCP.
// Media carries its own license, independent of the surrounding content —
// see the credit/license fields.
//
// TODO: migrate to Grund — the responsive image + aspect-ratio box belong in
// a Grund Figure/ResponsiveImage Component (aspect-ratios foundation); the
// authoring vocabulary and license semantics stay in this block.

export default function Image({
  src,
  alt,
  caption,
  width,
  height,
  priority = false,
  aspectRatio,
  credit,
  creditUrl,
  license,
  licenseUrl,
  sourceUrl,
}: ImageProps) {
  const isRemote = /^https?:\/\//.test(src);
  const hasAttribution = Boolean(credit || license || sourceUrl);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      <figure className="mx-auto max-w-3xl">
        <div
          className="overflow-hidden rounded-md bg-gray-100"
          style={aspectRatio ? { aspectRatio } : undefined}
        >
          {width && height ? (
            <NextImage
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              unoptimized={isRemote}
              className="w-full h-auto"
            />
          ) : (
            // Fallback when explicit dimensions aren't provided — rely on
            // the figure's aspect-ratio container. next/image with `fill`
            // requires a positioned parent.
            <div className="relative w-full aspect-[16/9]">
              <NextImage
                src={src}
                alt={alt}
                fill
                priority={priority}
                unoptimized={isRemote}
                className="object-cover"
              />
            </div>
          )}
        </div>
        {(caption || hasAttribution) && (
          <figcaption className="mt-3 text-sm text-gray-600 text-center">
            {caption}
            {caption && hasAttribution && ' '}
            <Attribution
              credit={credit}
              creditUrl={creditUrl}
              license={license}
              licenseUrl={licenseUrl}
              sourceUrl={sourceUrl}
            />
          </figcaption>
        )}
      </figure>
    </section>
  );
}
