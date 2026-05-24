import Link from 'next/link';

type HeroVariant = 'default' | 'gradient' | 'minimal';

interface HeroProps {
  variant?: HeroVariant;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  children?: React.ReactNode;
}

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
}: HeroProps) {
  return (
    <section className={`${VARIANT_BG[variant]} px-4 sm:px-6 lg:px-8 py-20 sm:py-28`}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
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
                className="text-sm font-semibold text-gray-900 hover:text-gray-700"
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
