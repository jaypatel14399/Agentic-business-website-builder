'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function ServicesSection({ content }: { content: ContentProps }) {
  const services = content.services.slice(0, 3)
  const imageUrls = content.serviceImageUrls ?? []

  return (
    <section id="services" className="py-20 px-[var(--theme-sectionPaddingX)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <div className="text-center mb-14">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-[var(--theme-text)]">
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
              className="rounded-[var(--theme-borderRadius)] bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl hover:border-[var(--theme-primary)]/40 hover:shadow-[var(--theme-primary)]/10 transition-all duration-300"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
            className="inline-block bg-white/10 backdrop-blur border border-white/20 text-[var(--theme-text)] px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
