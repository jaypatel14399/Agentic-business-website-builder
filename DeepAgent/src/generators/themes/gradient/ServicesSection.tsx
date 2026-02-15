'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function ServicesSection({ content }: { content: ContentProps }) {
  const services = content.services.slice(0, 3)
  const imageUrls = content.serviceImageUrls ?? []

  return (
    <section id="services" className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-background)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <div className="text-center mb-14">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--theme-gradientFrom)] to-[var(--theme-gradientTo)] bg-clip-text text-transparent">
            Our Services
          </h2>
          <p className="text-xl text-[var(--theme-textMuted)] max-w-2xl mx-auto">
            Professional {content.industry} services in {content.city}
            {content.state ? `, ${content.state}` : ''}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <article
              key={index}
              className="rounded-[var(--theme-borderRadius)] bg-[var(--theme-backgroundAlt)] border border-[var(--theme-border)] p-6 shadow-md hover:shadow-xl hover:border-[var(--theme-primary)]/30 transition-all duration-300 overflow-hidden"
            >
              {imageUrls[index] && (
                <div className="relative aspect-video -mx-6 -mt-6 mb-4 rounded-t-[var(--theme-borderRadius)] overflow-hidden">
                  <Image
                    src={imageUrls[index]}
                    alt={service.name}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}
              <h3 className="font-heading text-xl font-bold text-[var(--theme-text)] mb-2">
                {service.name}
              </h3>
              <p className="text-[var(--theme-textMuted)] text-sm leading-relaxed">
                {service.description}
              </p>
            </article>
          ))}
        </div>
        <div className="text-center mt-14">
          <Link
            href="/#services"
            className="inline-block bg-gradient-to-r from-[var(--theme-gradientFrom)] to-[var(--theme-gradientTo)] text-[var(--theme-onPrimary,#fff)] px-8 py-4 rounded-2xl font-semibold hover:opacity-95 transition-all duration-300 shadow-lg"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
