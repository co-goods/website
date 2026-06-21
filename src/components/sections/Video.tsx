import Attribution from './Attribution';

type VideoProvider = 'youtube' | 'vimeo' | 'file';

interface VideoProps {
  provider: VideoProvider;
  // youtube/vimeo: the video id. file: ignored (use src). Named videoId, not
  // id, because the section renderer reserves `id` for section anchors.
  videoId?: string;
  // file: path to the .mp4 (public/ path or remote URL).
  src?: string;
  // file: poster frame shown before playback.
  poster?: string;
  title?: string;
  caption?: string;
  aspectRatio?: string;
  credit?: string;
  creditUrl?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
}

// Embeds a YouTube/Vimeo video or plays a self-hosted MP4. Embeds are the
// default for anything substantial — self-hosted files are served from the
// site's own bandwidth, so reserve `provider: file` for short clips.
// Media carries its own license, independent of the surrounding content.
//
// TODO: migrate to Grund — the responsive aspect-ratio frame belongs in a
// Grund Component (aspect-ratios foundation); provider handling and license
// semantics stay in this section.

function embedSrc(provider: VideoProvider, videoId?: string): string | null {
  if (!videoId) return null;
  if (provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${videoId}`;
  if (provider === 'vimeo') return `https://player.vimeo.com/video/${videoId}`;
  return null;
}

export default function Video({
  provider,
  videoId,
  src,
  poster,
  title,
  caption,
  aspectRatio = '16 / 9',
  credit,
  creditUrl,
  license,
  licenseUrl,
  sourceUrl,
}: VideoProps) {
  const hasAttribution = Boolean(credit || license || sourceUrl);
  const embed = embedSrc(provider, videoId);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      <figure className="mx-auto max-w-3xl">
        <div
          className="overflow-hidden rounded-md bg-gray-900"
          style={{ aspectRatio }}
        >
          {provider === 'file' ? (
            src ? (
              <video
                src={src}
                poster={poster}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            ) : null
          ) : embed ? (
            <iframe
              src={embed}
              title={title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="w-full h-full border-0"
            />
          ) : null}
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
