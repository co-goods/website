import { Hero, Quote, Callout, EmailSignup, CTA } from '@/components/blocks';

export default function HomePage() {
  return (
    <>
      <Hero
        variant="gradient"
        eyebrow="Open-innovation research"
        title="Co-Goods"
        subtitle="A protocol for co-created and networked physical products that become more valuable through shared use and collaborative ownership."
        cta={{ label: 'Stay in the loop', href: '#signup' }}
        secondaryCta={{ label: 'On GitHub', href: 'https://github.com/co-goods' }}
      />

      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            What we&rsquo;re working on
          </h2>
          <div className="mt-5 space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              Co-Goods is a research project developing the protocol layer
              for goods that get better as more people use them together —
              <em> antirival</em> goods, in the academic sense. Physical
              products designed and produced collectively, with a shared
              fabric of design, manufacturing, and value.
            </p>
            <p>
              The work is open. Findings live in a public research repo;
              the protocol&rsquo;s vocabulary, mechanics, and decisions are
              drafted in the open. This site is the public face of that
              work — in early development.
            </p>
          </div>
        </div>
      </section>

      <Quote cite="An old proverb, repurposed">
        Many hands make light work — and shared work, when designed well,
        makes more than the sum of its parts.
      </Quote>

      <Callout type="info" title="Early days">
        The Co-Goods website is a work in progress. We&rsquo;re sharing what
        we have so the community can engage early. Most pages are not yet
        public — they&rsquo;re being assembled. Sign up below to hear when
        more lands.
      </Callout>

      <section id="signup" className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="mx-auto max-w-xl">
          <EmailSignup
            variant="card"
            heading="Get updates"
            description="A short note when there's something new — usually no more than once a month."
            source="home"
          />
        </div>
      </section>

      <CTA
        heading="Contribute"
        description="Co-Goods is open-innovation research. The protocol evolves through community contribution. Issues, pull requests, and discussion are welcome."
        label="See how to contribute"
        href="/contributing"
        variant="secondary"
      />
    </>
  );
}
