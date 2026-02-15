'use client'

import type { ContentProps } from '../shared/content-types'

export default function TestimonialsSection({ content }: { content: ContentProps }) {
  const testimonials = content.testimonials
  if (testimonials.length === 0) return null

  return (
    <section className="py-24 px-[var(--theme-sectionPaddingX)] border-b border-[var(--theme-border)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[var(--theme-text)] tracking-tight uppercase mb-16">
          {content.testimonialsTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((review, i) => (
            <div key={i} className="border-l-2 border-[var(--theme-border)] pl-8">
              <div className="flex gap-1 mb-4 text-[var(--theme-textMuted)] text-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= (review.rating ?? 5) ? 'opacity-100' : 'opacity-30'}>
                    ★
                  </span>
                ))}
              </div>
              {review.text && (
                <p className="text-[var(--theme-text)] leading-relaxed mb-4">
                  &ldquo;{review.text.slice(0, 160)}{review.text.length > 160 ? '...' : ''}&rdquo;
                </p>
              )}
              {review.author_name && (
                <p className="text-sm text-[var(--theme-textMuted)] uppercase tracking-widest">
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
