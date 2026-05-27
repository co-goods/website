interface ProseProps {
  children: React.ReactNode;
}

// Plain-markdown section: the explicit wrapper for ordinary prose on custom
// pages (which require every chunk of content to live inside a block). Visual
// treatment is deliberately minimal for now — refined later with the design
// system.
export default function Prose({ children }: ProseProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto max-w-3xl prose prose-gray">{children}</div>
    </section>
  );
}
