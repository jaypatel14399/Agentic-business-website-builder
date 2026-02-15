'use client'

import type { ContentProps } from '../shared/content-types'

export default function ContactSection({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <section className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-primary)] text-[var(--theme-onPrimary,#fff)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
        <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-10 opacity-90">
          Contact us today to learn more about our services and how we can help you.
        </p>
        <a
          href="/contact"
          className="inline-block bg-[var(--theme-background)] text-[var(--theme-primary)] px-8 py-4 rounded-xl font-semibold hover:opacity-95 transition-all duration-300 shadow-xl hover:scale-[1.02]"
        >
          {content.primaryCTA}
        </a>
        <div className="mt-12 pt-12 border-t border-current/20 text-sm opacity-80">
          <p>{c.phone_display}</p>
          <p>{c.address_display}</p>
        </div>
      </div>
    </section>
  )
}
