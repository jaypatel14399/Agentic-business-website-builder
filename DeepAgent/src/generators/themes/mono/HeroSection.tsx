'use client'

import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function HeroSection({ content }: { content: ContentProps }) {
  return (
    <section className="min-h-screen flex flex-col justify-center px-[var(--theme-sectionPaddingX)] py-24 border-b border-[var(--theme-border)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-[var(--theme-text)] tracking-tight uppercase mb-8">
          {content.businessName}
        </h1>
        <div className="w-24 h-px bg-[var(--theme-text)] mx-auto mb-8" />
        <p className="text-xl md:text-2xl text-[var(--theme-textMuted)] font-medium mb-6 max-w-2xl mx-auto">
          {content.tagline}
        </p>
        <p className="text-lg text-[var(--theme-textMuted)] max-w-xl mx-auto mb-12 leading-relaxed">
          {content.description}
        </p>
        {(content.rating != null || (content.reviewCount != null && content.reviewCount > 0)) && (
          <div className="flex justify-center gap-6 mb-10 text-[var(--theme-textMuted)] text-sm">
            {content.rating != null && <span>★ {content.rating} rating</span>}
            {content.reviewCount != null && content.reviewCount > 0 && (
              <span>{content.reviewCount}+ reviews</span>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-block bg-[var(--theme-text)] text-[var(--theme-background)] px-10 py-4 font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity duration-300"
          >
            {content.primaryCTA}
          </Link>
          <Link
            href="/#services"
            className="inline-block border border-[var(--theme-text)] text-[var(--theme-text)] px-10 py-4 font-semibold uppercase tracking-widest hover:bg-[var(--theme-text)] hover:text-[var(--theme-background)] transition-all duration-300"
          >
            Our Services
          </Link>
        </div>
      </div>
    </section>
  )
}
