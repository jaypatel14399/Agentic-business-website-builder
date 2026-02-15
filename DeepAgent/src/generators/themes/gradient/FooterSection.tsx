'use client'

import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function FooterSection({ content }: { content: ContentProps }) {
  return (
    <footer className="py-12 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)] border-t border-[var(--theme-border)]">
      <div className="container mx-auto max-w-[var(--theme-maxWidth)] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[var(--theme-textMuted)] text-sm">{content.footerCopyright}</p>
        <nav className="flex gap-6 text-sm">
          <Link href="/about" className="text-[var(--theme-textMuted)] hover:text-[var(--theme-primary)] transition-colors">
            About
          </Link>
          <Link href="/#services" className="text-[var(--theme-textMuted)] hover:text-[var(--theme-primary)] transition-colors">
            Services
          </Link>
          <Link href="/contact" className="text-[var(--theme-textMuted)] hover:text-[var(--theme-primary)] transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
