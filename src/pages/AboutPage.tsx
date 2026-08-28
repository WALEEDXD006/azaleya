import { useRouter } from '@/context/RouterContext';
import { Instagram } from 'lucide-react';

export function AboutPage() {
  const { navigate } = useRouter();
  return (
    <div className="fade-in">
      <section className="bg-cream-100">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-cream-600">Our story</p>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-cream-800 sm:text-4xl lg:text-5xl">
            Azaleya — quiet luxury in earthy tones
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream-600">
            Azaleya is a clothing brand built around natural fabrics, considered design, and a warm
            palette of browns and creams. Each piece is made to be lived in — soft linens for slow
            mornings, tailored wool for cool evenings, and silk for the moments in between.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          {[
            { t: 'Natural fabrics', d: 'We choose linen, cotton, silk and wool — breathable, biodegradable, and beautiful to wear.' },
            { t: 'Considered design', d: 'Relaxed silhouettes and timeless cuts that outlast trends and seasons.' },
            { t: 'Made responsibly', d: 'Small-batch production with partners who share our standards for craft and care.' },
          ].map((v) => (
            <div key={v.t} className="card p-5 sm:p-6">
              <h3 className="font-serif text-xl font-semibold text-cream-800">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-600">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-100">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <h2 className="font-serif text-2xl font-semibold text-cream-800 sm:text-3xl">Follow the journey</h2>
          <p className="mt-2 text-sm text-cream-600">
            New drops, styling ideas, and behind-the-scenes — on Instagram.
          </p>
          <a
            href="https://instagram.com/azaleya_official_"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6"
          >
            <Instagram size={16} /> @azaleya_official_
          </a>
          <div className="mt-8">
            <button onClick={() => navigate('/shop')} className="btn-outline">
              Shop the collection
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
