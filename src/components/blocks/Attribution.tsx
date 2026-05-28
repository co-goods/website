interface AttributionProps {
  credit?: string;
  creditUrl?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
}

// The credit + license line shown under an image or video. Renders nothing
// when no attribution fields are set. Links each part when a URL is given.
// The license string is editorial (e.g. "CC BY-SA 4.0"). A media item's
// license is its own — independent of the surrounding content's license —
// so reused or embedded media should declare it.
//
// TODO: migrate to Grund — caption/attribution typography belongs in the
// Grund Figure Component once it exists; the license semantics stay here.
export default function Attribution({
  credit,
  creditUrl,
  license,
  licenseUrl,
  sourceUrl,
}: AttributionProps) {
  if (!credit && !license && !sourceUrl) return null;

  const link = (label: string, href: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-gray-700"
    >
      {label}
    </a>
  );

  const parts: React.ReactNode[] = [];
  if (credit) {
    parts.push(creditUrl ? link(credit, creditUrl) : credit);
  }
  if (license) {
    parts.push(licenseUrl ? link(license, licenseUrl) : license);
  }
  if (sourceUrl) {
    parts.push(link('Source', sourceUrl));
  }

  return (
    <span className="text-gray-500">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && ' · '}
          {part}
        </span>
      ))}
    </span>
  );
}
