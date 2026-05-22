import NextImage from 'next/image';

interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: string;
}

// Wraps next/image with caption support. For decorative images, pass alt="".
// For above-the-fold (hero) images, pass priority for LCP optimization.

export default function Image({
  src,
  alt,
  caption,
  width,
  height,
  priority = false,
  aspectRatio,
}: ImageProps) {
  const isRemote = /^https?:\/\//.test(src);

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
        {caption && (
          <figcaption className="mt-3 text-sm text-gray-600 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
