'use client'

import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function AboutSection({ content }: { content: ContentProps }) {
  return (
    <section className="py-20 px-[var(--theme-sectionPaddingX)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <div className="max-w-3xl mx-auto text-center rounded-[var(--theme-borderRadius)] bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-[var(--theme-text)]">
            About {content.businessName}
          </h2>
          <p className="text-lg text-[var(--theme-textMuted)] mb-8 leading-relaxed">
            {content.aboutDescription.slice(0, 320)}
            {content.aboutDescription.length > 320 ? '...' : ''}
          </p>
          {content.aboutValues.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-3 mb-8">
              {content.aboutValues.slice(0, 4).map((value, i) => (
                <li
                  key={i}
                  className="px-4 py-2 rounded-full bg-[var(--theme-primary)]/20 text-[var(--theme-accent)] font-medium text-sm border border-[var(--theme-primary)]/30"
                >
                  {value}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/about"
            className="inline-block bg-[var(--theme-primary)] text-[var(--theme-onPrimary,#fff)] px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition-all duration-300"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </section>
  )
}
