'use client'

import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function AboutSection({ content }: { content: ContentProps }) {
  return (
    <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-5">
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-[var(--theme-text)] tracking-tight mb-8">
            About {content.businessName}
          </h2>
          <div className="h-1 w-24 bg-[var(--theme-primary)] rounded-full" />
        </div>
        <div className="lg:col-span-7">
          <p className="text-lg text-[var(--theme-textMuted)] leading-relaxed mb-8">
            {content.aboutDescription.slice(0, 400)}
            {content.aboutDescription.length > 400 ? '...' : ''}
          </p>
          {content.aboutValues.length > 0 && (
            <ul className="flex flex-wrap gap-3 mb-8">
              {content.aboutValues.slice(0, 4).map((value, i) => (
                <li key={i} className="px-4 py-2 border border-[var(--theme-border)] rounded-md text-[var(--theme-text)] font-medium text-sm">
                  {value}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/about"
            className="inline-block bg-[var(--theme-text)] text-[var(--theme-background)] px-8 py-4 rounded-md font-semibold hover:opacity-90 transition-all duration-300"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </section>
  )
}
