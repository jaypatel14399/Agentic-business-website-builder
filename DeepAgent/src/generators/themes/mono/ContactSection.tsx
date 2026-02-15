'use client'

import type { ContentProps } from '../shared/content-types'

export default function ContactSection({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-text)] text-[var(--theme-background)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
        <div className="w-24 h-px bg-[var(--theme-background)] mx-auto mb-8" />
        <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight uppercase mb-6">
          Get in Touch
        </h2>
        <p className="text-[var(--theme-background)]/80 mb-10 max-w-md mx-auto">
          Contact us today to learn more about our services and how we can help you.
        </p>
        <a
          href="/contact"
          className="inline-block bg-[var(--theme-background)] text-[var(--theme-text)] px-10 py-4 font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity duration-300"
        >
          {content.primaryCTA}
        </a>
        <div className="mt-16 pt-16 border-t border-current/20 text-sm opacity-80">
          <p>{c.phone_display}</p>
          <p className="mt-1">{c.address_display}</p>
        </div>
      </div>
    </section>
  )
}
