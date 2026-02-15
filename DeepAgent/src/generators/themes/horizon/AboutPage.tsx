'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function AboutPage({ content }: { content: ContentProps }) {
  const hasImage = content.aboutImageUrl
  return (
    <>
      <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-background)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-[var(--theme-text)] tracking-tight mb-8">
            {content.aboutTitle}
          </h1>
          <div className="h-1 w-24 bg-[var(--theme-primary)] rounded-full mb-12" />
        </div>
      </section>

      <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          {hasImage && (
            <div className="relative aspect-video md:aspect-[21/9] rounded-md overflow-hidden mb-12">
              <Image src={content.aboutImageUrl!} alt={content.aboutTitle} fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <p className="text-lg text-[var(--theme-text)] leading-relaxed whitespace-pre-line mb-10">
                {content.aboutDescription}
              </p>
              {content.aboutHistory && (
                <div className="mb-10">
                  <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-4">Our Story</h2>
                  <p className="text-lg text-[var(--theme-textMuted)] leading-relaxed whitespace-pre-line">
                    {content.aboutHistory}
                  </p>
                </div>
              )}
            </div>
            <div className="lg:col-span-5">
              {content.aboutValues.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-6">Our Values</h2>
                  <ul className="space-y-4">
                    {content.aboutValues.map((value, i) => (
                      <li key={i} className="border-l-4 border-[var(--theme-primary)] pl-6 py-2">
                        <span className="font-heading text-lg font-semibold text-[var(--theme-text)]">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="border border-[var(--theme-border)] p-8 rounded-md">
                <h2 className="font-heading text-2xl font-bold text-[var(--theme-text)] mb-4">
                  Why Choose {content.businessName}?
                </h2>
                <ul className="list-disc list-inside space-y-2 text-[var(--theme-textMuted)]">
                  <li>Located in {content.city}{content.state ? `, ${content.state}` : ''}</li>
                  <li>Experienced in {content.industry} services</li>
                  {content.rating != null && <li>{content.rating}-star rated business</li>}
                  <li>Committed to customer satisfaction</li>
                  <li>Professional and reliable service</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-text)] text-[var(--theme-background)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
          <h2 className="font-heading text-5xl font-bold mb-6 tracking-tight">Get In Touch</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Have questions or want to learn more? Contact us today!
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[var(--theme-background)] text-[var(--theme-text)] px-8 py-4 rounded-md font-semibold hover:opacity-95 transition-all duration-300"
          >
            {content.primaryCTA}
          </Link>
        </div>
      </section>
    </>
  )
}
