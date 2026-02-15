'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function HeroSection({ content }: { content: ContentProps }) {
  const heroImage = content.heroImageUrl
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {heroImage ? (
        <>
          <div className="absolute inset-0 z-0">
            <Image src={heroImage} alt="" fill className="object-cover" priority sizes="100vw" unoptimized />
            <div className="absolute inset-0 bg-[var(--theme-background)]/80 backdrop-blur-md" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--theme-background)] via-[var(--theme-backgroundAlt)] to-[var(--theme-primary)]/20" />
      )}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,transparent_0%,var(--theme-background)_95%)] pointer-events-none" />
      <div className="container relative z-10 mx-auto max-w-[var(--theme-maxWidth)] px-[var(--theme-sectionPaddingX)] py-24 text-center">
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl tracking-tight">
          {content.businessName}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 font-medium max-w-2xl mx-auto">
          {content.tagline}
        </p>
        <p className="text-lg mb-10 max-w-3xl mx-auto text-white/80 leading-relaxed">
          {content.description}
        </p>
        {(content.rating != null || (content.reviewCount != null && content.reviewCount > 0)) && (
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-white/80">
            {content.rating != null && (
              <span className="flex items-center gap-2 font-medium">★ {content.rating} rating</span>
            )}
            {content.reviewCount != null && content.reviewCount > 0 && (
              <span className="font-medium">{content.reviewCount}+ reviews</span>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-block bg-white/15 backdrop-blur-xl text-white border border-white/30 px-8 py-4 rounded-2xl font-semibold hover:bg-white/25 transition-all duration-300"
          >
            {content.primaryCTA}
          </Link>
          <Link
            href="/#services"
            className="inline-block bg-[var(--theme-primary)] text-[var(--theme-onPrimary,#fff)] px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition-all duration-300"
          >
            View Our Services
          </Link>
        </div>
      </div>
    </section>
  )
}
