// A small "engage with this page" row: edit the source on GitHub, and (when
// the page declares a `discord:` URL in its frontmatter) jump to its Discord
// discussion. Renders nothing when neither is available. Both are plain links —
// no runtime cost. Shown at the foot of an article.
export default function PageActions({
  editUrl,
  discordUrl,
}: {
  editUrl?: string;
  discordUrl?: string;
}) {
  if (!editUrl && !discordUrl) return null;

  return (
    <div className="not-prose mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
      {editUrl && (
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900"
        >
          Edit this page on GitHub <span aria-hidden="true">→</span>
        </a>
      )}
      {discordUrl && (
        <a
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900"
        >
          Discuss on Discord <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}
