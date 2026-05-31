import Link from 'next/link';

type CTAVariant = 'primary' | 'secondary';

interface CTAProps {
  label: string;
  href: string;
  variant?: CTAVariant;
  description?: string;
  heading?: string;
}

const VARIANT_STYLES: Record<CTAVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
};

export default function CTA({
  label,
  href,
  variant = 'primary',
  description,
  heading,
}: CTAProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-3xl text-center">
        {heading && (
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {heading}
          </h2>
        )}
        {description && (
          <p className="mt-3 text-base text-gray-600">{description}</p>
        )}
        <div className="mt-6">
          <Link
            href={href}
            className={`inline-block rounded-md px-5 py-3 text-sm font-semibold ${VARIANT_STYLES[variant]}`}
          >
            {label}
          </Link>
        </div>
      </div>
    </section>
  );
}
