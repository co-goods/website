import Link from 'next/link';
import NextImage from 'next/image';
import { FaGithub } from 'react-icons/fa';

// A single person card for the team/people grid. Shows an initials avatar,
// name, role, short bio, and an optional GitHub link; the name links to the
// full profile when a href is given.
//
// TODO: migrate to Grund once the design system covers people/avatar cards.

export interface PersonCardProps {
  name: string;
  role?: string;
  bio?: string;
  github?: string;
  href?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function PersonCard({ name, role, bio, github, href }: PersonCardProps) {
  // GitHub serves an avatar at github.com/<user>.png; use it when we have a
  // handle, falling back to an initials chip. unoptimized — same as the Image
  // block — so no remote-image config is needed.
  const photo = github ? `https://github.com/${github}.png?size=160` : undefined;
  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-3">
        {photo ? (
          <NextImage
            src={photo}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 shrink-0 rounded-full object-cover bg-gray-100"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
          >
            {initials(name)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {href ? (
              <Link href={href} className="hover:text-indigo-700">
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          {role && <p className="text-sm font-medium text-indigo-700">{role}</p>}
        </div>
      </div>
      {bio && <p className="mt-3 text-sm text-gray-600">{bio}</p>}
      {github && (
        <a
          href={`https://github.com/${github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
          aria-label={`${name} on GitHub`}
        >
          <FaGithub className="h-4 w-4" aria-hidden="true" />
          GitHub
        </a>
      )}
    </div>
  );
}
