'use client'

import type { ContentProps } from '../shared/content-types'

export default function ContactSection({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-text)] text-[var(--theme-background)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
        <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
          Contact us today to learn more about our services and how we can help you.
        </p>
        <a
          href="/contact"
          className="inline-block bg-[var(--theme-background)] text-[var(--theme-text)] px-8 py-4 rounded-md font-semibold hover:opacity-95 transition-all duration-300"
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
