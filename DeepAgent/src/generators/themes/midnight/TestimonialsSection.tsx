'use client'

import type { ContentProps } from '../shared/content-types'

export default function TestimonialsSection({ content }: { content: ContentProps }) {
  const testimonials = content.testimonials
  if (testimonials.length === 0) return null

  return (
    <section className="py-20 px-[var(--theme-sectionPaddingX)] overflow-hidden">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-[var(--theme-text)]">
            {content.testimonialsTitle}
          </h2>
          <p className="text-[var(--theme-textMuted)] text-lg">
            {content.testimonialsSubtitle || 'What our customers say.'}
          </p>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[min(100%,22rem)] snap-center rounded-[var(--theme-borderRadius)] bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[var(--theme-primary)]/30 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4 text-[var(--theme-accent)]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= (review.rating ?? 5) ? 'opacity-100' : 'opacity-30'}>
                    ★
                  </span>
                ))}
              </div>
              {review.text && (
                <p className="text-[var(--theme-text)] mb-4 leading-relaxed text-sm">
                  &ldquo;{review.text.slice(0, 180)}{review.text.length > 180 ? '...' : ''}&rdquo;
                </p>
              )}
              {review.author_name && (
                <p className="text-sm font-semibold text-[var(--theme-textMuted)]">— {review.author_name}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
