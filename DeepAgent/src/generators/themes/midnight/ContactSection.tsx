'use client'

import type { ContentProps } from '../shared/content-types'

export default function ContactSection({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <section className="py-20 px-[var(--theme-sectionPaddingX)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center rounded-[var(--theme-borderRadius)] bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-16">
        <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-[var(--theme-text)]">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-10 text-[var(--theme-textMuted)]">
          Contact us today to learn more about our services and how we can help you.
        </p>
        <a
          href="/contact"
          className="inline-block bg-[var(--theme-primary)] text-[var(--theme-onPrimary,#fff)] px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition-all duration-300"
        >
          {content.primaryCTA}
        </a>
        <div className="mt-12 pt-12 border-t border-white/10 text-[var(--theme-textMuted)] text-sm">
          <p>{c.phone_display}</p>
          <p>{c.address_display}</p>
        </div>
      </div>
    </section>
  )
}
