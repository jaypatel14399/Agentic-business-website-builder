'use client'

import ContactForm from '@/components/ContactForm'
import type { ContentProps } from '../shared/content-types'

export default function ContactPage({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <>
      <section className="py-20 px-[var(--theme-sectionPaddingX)] rounded-b-[2.5rem] bg-gradient-to-br from-[var(--theme-gradientFrom)] to-[var(--theme-gradientTo)] text-[var(--theme-onPrimary,#fff)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)] text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6">
            {c.form_title}
          </h1>
          {c.form_description && (
            <p className="text-xl opacity-90 max-w-2xl mx-auto">{c.form_description}</p>
          )}
        </div>
      </section>

      <section className="py-20 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-background)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="rounded-[var(--theme-borderRadius)] bg-[var(--theme-backgroundAlt)] border border-[var(--theme-border)] p-6 shadow-md">
              <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-6">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>
            <div className="space-y-6">
              <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-6">
                Contact Information
              </h2>
              <div className="rounded-[var(--theme-borderRadius)] bg-[var(--theme-backgroundAlt)] border border-[var(--theme-border)] p-6 shadow-md">
                <h3 className="font-heading text-xl font-semibold text-[var(--theme-primary)] mb-2">Business Name</h3>
                <p className="text-[var(--theme-text)]">{content.businessName}</p>
              </div>
              {c.address_display && (
                <div className="rounded-[var(--theme-borderRadius)] bg-[var(--theme-backgroundAlt)] border border-[var(--theme-border)] p-6 shadow-md">
                  <h3 className="font-heading text-xl font-semibold text-[var(--theme-primary)] mb-2">Address</h3>
                  <p className="text-[var(--theme-text)] whitespace-pre-line">{c.address_display}</p>
                </div>
              )}
              {c.phone_display && c.phone_display !== 'N/A' && (
                <div className="rounded-[var(--theme-borderRadius)] bg-[var(--theme-backgroundAlt)] border border-[var(--theme-border)] p-6 shadow-md">
                  <h3 className="font-heading text-xl font-semibold text-[var(--theme-primary)] mb-2">Phone</h3>
                  <p className="text-[var(--theme-text)]">
                    <a href={`tel:${c.phone_display}`} className="hover:opacity-80 transition-opacity">{c.phone_display}</a>
                  </p>
                </div>
              )}
              <div className="rounded-[var(--theme-borderRadius)] bg-[var(--theme-backgroundAlt)] border border-[var(--theme-border)] p-6 shadow-md">
                <h3 className="font-heading text-xl font-semibold text-[var(--theme-primary)] mb-2">Service Area</h3>
                <p className="text-[var(--theme-text)]">
                  {content.city}{content.state ? `, ${content.state}` : ''} and surrounding areas
                </p>
              </div>
              {content.rating != null && (
                <div className="rounded-[var(--theme-borderRadius)] bg-gradient-to-r from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 border border-[var(--theme-border)] p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[var(--theme-text)]">{content.rating}</span>
                    <div className="flex text-[var(--theme-accent)]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={i <= Math.floor(content.rating!) ? 'opacity-100' : 'opacity-30'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--theme-textMuted)] mt-1">Rated on Google</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
