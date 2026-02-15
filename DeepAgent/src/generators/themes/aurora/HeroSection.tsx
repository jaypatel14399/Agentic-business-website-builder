'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function HeroSection({ content }: { content: ContentProps }) {
  const heroImage = content.heroImageUrl
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden rounded-b-[2rem]">
      {heroImage ? (
        <>
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-[var(--theme-primary)]/90 backdrop-blur-[3px]" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--theme-gradientFrom)] to-[var(--theme-gradientTo)]" />
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
            {content.rating != null && (
              <span className="flex items-center gap-2 font-medium">
                <span className="text-white">★</span> {content.rating} rating
              </span>
            )}
            {content.reviewCount != null && content.reviewCount > 0 && (
              <span className="font-medium">{content.reviewCount}+ reviews</span>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-block bg-white text-[var(--theme-primary)] px-8 py-4 rounded-xl font-semibold hover:opacity-95 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
          >
            {content.primaryCTA}
          </Link>
          <Link
            href="/#services"
            className="inline-block bg-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border-2 border-white/60 backdrop-blur-sm"
          >
            View Our Services
          </Link>
        </div>
      </div>
    </section>
  )
}
