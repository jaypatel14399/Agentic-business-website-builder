'use client'

import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function ServicesSection({ content }: { content: ContentProps }) {
  const services = content.services.slice(0, 3)

  return (
    <section id="services" className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)] border-b border-[var(--theme-border)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[var(--theme-text)] tracking-tight uppercase mb-16">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {services.map((service, index) => (
            <article key={index} className="border-t border-[var(--theme-border)] pt-8">
              <span className="text-[var(--theme-textMuted)] text-sm font-medium tracking-widest uppercase">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-heading text-2xl font-bold text-[var(--theme-text)] mt-2 mb-4 uppercase tracking-tight">
                {service.name}
              </h3>
              <p className="text-[var(--theme-textMuted)] leading-relaxed text-sm">
                {service.description}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            href="/#services"
            className="inline-block border-b-2 border-[var(--theme-text)] text-[var(--theme-text)] font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
