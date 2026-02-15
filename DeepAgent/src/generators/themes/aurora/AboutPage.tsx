'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ContentProps } from '../shared/content-types'

export default function AboutPage({ content }: { content: ContentProps }) {
  const hasImage = content.aboutImageUrl
  return (
    <>
      <section className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-primary)] text-[var(--theme-onPrimary,#fff)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6">
            {content.aboutTitle}
          </h1>
        </div>
      </section>

      <section className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-background)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          {hasImage && (
            <div className="relative aspect-video md:aspect-[21/9] rounded-[var(--theme-borderRadius)] overflow-hidden mb-12">
              <Image
                src={content.aboutImageUrl!}
                alt={content.aboutTitle}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="prose prose-lg max-w-none">
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
            {content.aboutValues.length > 0 && (
              <div className="mb-10">
                <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-6">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.aboutValues.map((value, i) => (
                    <div
                      key={i}
                      className="rounded-[var(--theme-borderRadius)] border border-[var(--theme-border)] bg-[var(--theme-backgroundAlt)] p-6"
                    >
                      <h3 className="font-heading text-xl font-semibold text-[var(--theme-primary)] mb-2">
                        {value}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-[var(--theme-borderRadius)] border border-[var(--theme-border)] bg-[var(--theme-backgroundAlt)] p-8 mt-12">
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
      </section>

      <section className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
          <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-4">Get In Touch</h2>
          <p className="text-lg text-[var(--theme-textMuted)] mb-8">
            Have questions or want to learn more? Contact us today!
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[var(--theme-primary)] text-[var(--theme-onPrimary,#fff)] px-8 py-4 rounded-xl font-semibold hover:opacity-95 transition-all duration-300 shadow-lg"
          >
            {content.primaryCTA}
          </Link>
        </div>
      </section>
    </>
  )
}
