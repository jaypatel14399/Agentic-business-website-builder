'use client'

import ContactForm from '@/components/ContactForm'
import type { ContentProps } from '../shared/content-types'

export default function ContactPage({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <>
      <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-background)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-[var(--theme-text)] tracking-tight mb-4">
            {c.form_title}
          </h1>
          <div className="h-1 w-24 bg-[var(--theme-primary)] rounded-full mb-6" />
          {c.form_description && (
            <p className="text-xl text-[var(--theme-textMuted)] max-w-2xl">{c.form_description}</p>
          )}
        </div>
      </section>

      <section className="py-24 px-[var(--theme-sectionPaddingX)] bg-[var(--theme-backgroundAlt)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-6">
                Send Us a Message
              </h2>
              <div className="border border-[var(--theme-border)] p-6 rounded-md">
                <ContactForm />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-[var(--theme-text)] mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="border-l-4 border-[var(--theme-primary)] pl-6 py-2">
                  <h3 className="font-heading text-sm font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest mb-1">Business</h3>
                  <p className="text-[var(--theme-text)]">{content.businessName}</p>
                </div>
                {c.address_display && (
                  <div className="border-l-4 border-[var(--theme-primary)] pl-6 py-2">
                    <h3 className="font-heading text-sm font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest mb-1">Address</h3>
                    <p className="text-[var(--theme-text)] whitespace-pre-line">{c.address_display}</p>
                  </div>
                )}
                {c.phone_display && c.phone_display !== 'N/A' && (
                  <div className="border-l-4 border-[var(--theme-primary)] pl-6 py-2">
                    <h3 className="font-heading text-sm font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest mb-1">Phone</h3>
                    <p className="text-[var(--theme-text)]">
                      <a href={`tel:${c.phone_display}`} className="hover:opacity-80">{c.phone_display}</a>
                    </p>
                  </div>
                )}
                <div className="border-l-4 border-[var(--theme-primary)] pl-6 py-2">
                  <h3 className="font-heading text-sm font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest mb-1">Service Area</h3>
                  <p className="text-[var(--theme-text)]">
                    {content.city}{content.state ? `, ${content.state}` : ''} and surrounding areas
                  </p>
                </div>
                {content.rating != null && (
                  <div className="border border-[var(--theme-border)] p-6 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[var(--theme-text)]">{content.rating}</span>
                      <div className="flex text-[var(--theme-accent)] text-sm">
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
        </div>
      </section>
    </>
  )
}
