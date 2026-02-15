'use client'

import ContactForm from '@/components/ContactForm'
import type { ContentProps } from '../shared/content-types'

export default function ContactPage({ content }: { content: ContentProps }) {
  const c = content.contactInfo
  return (
    <>
      <section className="py-24 px-[var(--theme-sectionPaddingX)] border-b border-[var(--theme-border)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[var(--theme-text)] tracking-tight uppercase mb-8">
            {c.form_title}
          </h1>
          <div className="w-24 h-px bg-[var(--theme-text)] mb-6" />
          {c.form_description && (
            <p className="text-[var(--theme-textMuted)] max-w-2xl">{c.form_description}</p>
          )}
        </div>
      </section>

      <section className="py-24 px-[var(--theme-sectionPaddingX)] border-b border-[var(--theme-border)]">
        <div className="container mx-auto max-w-[var(--theme-maxWidth)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--theme-text)] uppercase tracking-tight mb-6">
                Send Us a Message
              </h2>
              <div className="border border-[var(--theme-border)] p-8">
                <ContactForm />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--theme-text)] uppercase tracking-tight mb-6">
                Contact Information
              </h2>
              <div className="space-y-8">
                <div>
                  <span className="text-xs font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest">Business</span>
                  <p className="text-[var(--theme-text)] mt-1">{content.businessName}</p>
                </div>
                {c.address_display && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest">Address</span>
                    <p className="text-[var(--theme-text)] mt-1 whitespace-pre-line">{c.address_display}</p>
                  </div>
                )}
                {c.phone_display && c.phone_display !== 'N/A' && (
                  <div>
                    <span className="text-xs font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest">Phone</span>
                    <p className="text-[var(--theme-text)] mt-1">
                      <a href={`tel:${c.phone_display}`} className="hover:opacity-70">{c.phone_display}</a>
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-[var(--theme-textMuted)] uppercase tracking-widest">Service Area</span>
                  <p className="text-[var(--theme-text)] mt-1">
                    {content.city}{content.state ? `, ${content.state}` : ''} and surrounding areas
                  </p>
                </div>
                {content.rating != null && (
                  <div className="border-t border-[var(--theme-border)] pt-8">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[var(--theme-text)]">{content.rating}</span>
                      <div className="flex text-[var(--theme-textMuted)] text-xs">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={i <= Math.floor(content.rating!) ? 'opacity-100' : 'opacity-30'}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--theme-textMuted)] uppercase tracking-widest mt-1">Rated on Google</p>
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
