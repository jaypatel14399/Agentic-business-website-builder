'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function HeroSection({ content }: { content: ContentProps }) {
  const heroImage = content.heroImageUrl
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden rounded-b-[2.5rem]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--theme-gradientFrom)] via-[var(--theme-secondary)] to-[var(--theme-gradientTo)]" />
      {heroImage && (
        <>
          <div className="absolute inset-0 z-[1]">
            <Image src={heroImage} alt="" fill className="object-cover opacity-40" priority sizes="100vw" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--theme-primary)]/50 to-[var(--theme-primary)]/80" />
          </div>
        </>
      )}
      <div className="container relative z-10 mx-auto max-w-[var(--theme-maxWidth)] px-[var(--theme-sectionPaddingX)] py-24 text-center">
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg tracking-tight">
          {content.businessName}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/95 font-medium max-w-2xl mx-auto">
          {content.tagline}
        </p>
        <p className="text-lg mb-10 max-w-3xl mx-auto text-white/90 leading-relaxed">
          {content.description}
        </p>
        {(content.rating != null || (content.reviewCount != null && content.reviewCount > 0)) && (
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-white/90">
            {content.rating != null && <span className="font-medium">★ {content.rating} rating</span>}
            {content.reviewCount != null && content.reviewCount > 0 && (
              <span className="font-medium">{content.reviewCount}+ reviews</span>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-block bg-white text-[var(--theme-primary)] px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg"
          >
            {content.primaryCTA}
          </Link>
          <Link
            href="/#services"
            className="inline-block bg-white/20 backdrop-blur text-white border-2 border-white/50 px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300"
          >
            View Our Services
          </Link>
        </div>
      </div>
    </section>
  )
}
