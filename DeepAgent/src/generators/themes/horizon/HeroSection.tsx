'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function HeroSection({ content }: { content: ContentProps }) {
  const heroImage = content.heroImageUrl
  return (
    <section className="relative min-h-screen flex items-end md:items-center overflow-hidden bg-[var(--theme-background)]">
      <div className="absolute inset-0 z-0 grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="relative flex flex-col justify-center px-[var(--theme-sectionPaddingX)] py-24 md:py-32 order-2 md:order-1">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--theme-text)] tracking-tight leading-[1.1] mb-6">
            {content.businessName}
          </h1>
          <p className="text-xl md:text-2xl text-[var(--theme-textMuted)] font-medium mb-6 max-w-xl">
            {content.tagline}
          </p>
          <p className="text-lg text-[var(--theme-textMuted)] leading-relaxed mb-10 max-w-xl">
            {content.description}
          </p>
          {(content.rating != null || (content.reviewCount != null && content.reviewCount > 0)) && (
            <div className="flex flex-wrap gap-6 mb-8 text-[var(--theme-textMuted)]">
            {content.rating != null && <span className="font-medium">★ {content.rating} rating</span>}
            {content.reviewCount != null && content.reviewCount > 0 && (
              <span className="font-medium">{content.reviewCount}+ reviews</span>
            )}
          </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-block bg-[var(--theme-text)] text-[var(--theme-background)] px-8 py-4 rounded-md font-semibold hover:opacity-90 transition-all duration-300"
            >
              {content.primaryCTA}
            </Link>
            <Link
              href="/#services"
              className="inline-block border-2 border-[var(--theme-text)] text-[var(--theme-text)] px-8 py-4 rounded-md font-semibold hover:bg-[var(--theme-text)] hover:text-[var(--theme-background)] transition-all duration-300"
            >
              View Our Services
            </Link>
          </div>
        </div>
        <div className="relative min-h-[50vh] md:min-h-full order-1 md:order-2">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="50vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-gradientFrom)] to-[var(--theme-gradientTo)] opacity-90" />
          )}
        </div>
      </div>
    </section>
  )
}
