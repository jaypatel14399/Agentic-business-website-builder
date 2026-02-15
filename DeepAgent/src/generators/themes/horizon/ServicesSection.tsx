'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function ServicesSection({ content }: { content: ContentProps }) {
  const services = content.services.slice(0, 3)
  const imageUrls = content.serviceImageUrls ?? []

  return (
    <section id="services" className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-background)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <div className="mb-16">
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-[var(--theme-text)] tracking-tight mb-4">
            Our Services
          </h2>
          <div className="h-1 w-24 bg-[var(--theme-primary)] rounded-full mb-6" />
          <p className="text-xl text-[var(--theme-textMuted)] max-w-2xl">
            Professional {content.industry} services in {content.city}
            {content.state ? `, ${content.state}` : ''}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {services.map((service, index) => (
            <article key={index} className="group">
              {imageUrls[index] && (
                <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-md">
                  <Image
                    src={imageUrls[index]}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <h3 className="font-heading text-2xl font-bold text-[var(--theme-text)] mb-3">
                {service.name}
              </h3>
              <p className="text-[var(--theme-textMuted)] leading-relaxed">
                {service.description}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-16">
          <Link
            href="/#services"
            className="inline-block border-2 border-[var(--theme-text)] text-[var(--theme-text)] px-8 py-4 rounded-md font-semibold hover:bg-[var(--theme-text)] hover:text-[var(--theme-background)] transition-all duration-300"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
