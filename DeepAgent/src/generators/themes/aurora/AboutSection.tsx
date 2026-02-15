'use client'

import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function AboutSection({ content }: { content: ContentProps }) {
  return (
    <section className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--theme-gradientFrom)] to-[var(--theme-gradientTo)] bg-clip-text text-transparent">
            About {content.businessName}
          </h2>
          <p className="text-lg text-[var(--theme-textMuted)] mb-6 leading-relaxed max-w-2xl mx-auto">
            {content.aboutDescription.slice(0, 320)}
            {content.aboutDescription.length > 320 ? '...' : ''}
          </p>
          {content.aboutValues.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-3 mb-8">
              {content.aboutValues.slice(0, 4).map((value, i) => (
                <li
                  key={i}
                  className="px-4 py-2 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] font-medium text-sm"
                >
                  {value}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/about"
            className="inline-block bg-[var(--theme-primary)] text-[var(--theme-onPrimary,#fff)] px-8 py-4 rounded-xl font-semibold hover:opacity-95 transition-all duration-300 shadow-lg"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </section>
  )
}
