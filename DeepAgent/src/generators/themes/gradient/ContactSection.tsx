'use client'

import type { ContentProps } from '../shared/content-types'

export default function ContactSection({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <section className="py-20 px-[var(--theme-sectionPaddingX)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center rounded-[var(--theme-borderRadius)] bg-gradient-to-br from-[var(--theme-gradientFrom)] to-[var(--theme-gradientTo)] p-12 md:p-16 text-white">
        <div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Contact us today to learn more about our services and how we can help you.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-[var(--theme-primary)] px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            {content.primaryCTA}
          </a>
        </div>
        <div className="lg:border-l lg:border-white/30 lg:pl-12">
          <p className="text-white/90 font-medium mb-2">Phone</p>
          <p className="text-white mb-6">{c.phone_display}</p>
          <p className="text-white/90 font-medium mb-2">Address</p>
          <p className="text-white">{c.address_display}</p>
        </div>
      </div>
    </section>
  )
}
