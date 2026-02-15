'use client'

import type { ContentProps } from '../shared/content-types'

export default function TestimonialsSection({ content }: { content: ContentProps }) {
  const testimonials = content.testimonials

  if (testimonials.length === 0) return null

  return (
    <section className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-[var(--theme-text)]">
            {content.testimonialsTitle}
          </h2>
          <p className="text-[var(--theme-textMuted)] text-lg">
            {content.testimonialsSubtitle || 'Real reviews from our customers.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((review, i) => (
            <div
              key={i}
              className="bg-[var(--theme-background)] p-6 rounded-[var(--theme-borderRadius)] shadow-md border border-[var(--theme-border)] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-4 text-[var(--theme-accent)]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= (review.rating ?? 5) ? 'opacity-100' : 'opacity-30'}>
                    ★
                  </span>
                ))}
              </div>
              {review.text && (
                <p className="text-[var(--theme-text)] mb-4 leading-relaxed">
                  &ldquo;{review.text.slice(0, 200)}{review.text.length > 200 ? '...' : ''}&rdquo;
                </p>
              )}
              {review.author_name && (
                <p className="text-sm font-semibold text-[var(--theme-textMuted)]">
                  — {review.author_name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
