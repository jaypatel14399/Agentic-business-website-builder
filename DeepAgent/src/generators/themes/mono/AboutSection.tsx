'use client'

import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function AboutSection({ content }: { content: ContentProps }) {
  return (
    <section className="py-24 px-[var(--theme-sectionPaddingX)] border-b border-[var(--theme-border)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[var(--theme-text)] tracking-tight uppercase mb-12">
          About
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <p className="text-[var(--theme-textMuted)] text-lg leading-relaxed">
            {content.aboutDescription.slice(0, 320)}
            {content.aboutDescription.length > 320 ? '...' : ''}
          </p>
          <div>
            {content.aboutValues.length > 0 && (
              <ul className="space-y-3">
                {content.aboutValues.slice(0, 4).map((value, i) => (
                  <li key={i} className="text-[var(--theme-text)] font-medium flex items-center gap-3">
                    <span className="w-2 h-2 bg-[var(--theme-text)]" />
                    {value}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/about"
              className="inline-block mt-8 border-b-2 border-[var(--theme-text)] text-[var(--theme-text)] font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
