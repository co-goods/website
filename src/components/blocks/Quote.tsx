interface QuoteProps {
  cite?: string;
  role?: string;
  children: React.ReactNode;
}

export default function Quote({ cite, role, children }: QuoteProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <figure className="mx-auto max-w-3xl">
        <blockquote className="text-2xl sm:text-3xl font-light italic leading-relaxed text-gray-900">
          <span aria-hidden="true" className="select-none text-indigo-300 mr-1">“</span>
          {children}
          <span aria-hidden="true" className="select-none text-indigo-300 ml-1">”</span>
        </blockquote>
        {(cite || role) && (
          <figcaption className="mt-6 text-sm text-gray-600">
            {cite && <span className="font-medium text-gray-900">{cite}</span>}
            {cite && role && <span className="mx-1">·</span>}
            {role && <span>{role}</span>}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
