'use client'

import type { ContentProps } from '../shared/content-types'

export default function TestimonialsSection({ content }: { content: ContentProps }) {
  const testimonials = content.testimonials
  if (testimonials.length === 0) return null

  return (
    <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <h2 className="font-heading text-5xl md:text-6xl font-bold text-[var(--theme-text)] tracking-tight mb-4">
          {content.testimonialsTitle}
        </h2>
        <div className="h-1 w-24 bg-[var(--theme-primary)] rounded-full mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((review, i) => (
            <blockquote
              key={i}
              className="border-l-4 border-[var(--theme-primary)] pl-6 py-2"
            >
              <div className="flex gap-1 mb-3 text-[var(--theme-accent)] text-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= (review.rating ?? 5) ? 'opacity-100' : 'opacity-30'}>
                    ★
                  </span>
                ))}
              </div>
              {review.text && (
                <p className="font-body text-[var(--theme-text)] leading-relaxed mb-4 italic">
                  &ldquo;{review.text.slice(0, 200)}{review.text.length > 200 ? '...' : ''}&rdquo;
                </p>
              )}
              {review.author_name && (
                <cite className="text-sm text-[var(--theme-textMuted)] not-italic">
                  — {review.author_name}
                </cite>
              )}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
