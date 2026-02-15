/**
 * Shared content interface for all premium themes.
 * Same data structure across Aurora, Midnight, Horizon, Mono, Gradient.
 */

export interface ServiceItem {
  name: string
  description: string
  features?: string[]
}

export interface TestimonialItem {
  text: string
  author_name: string
  rating: number
}

export interface ContactInfo {
  form_title: string
  form_description?: string
  phone_display: string
  address_display: string
}

export interface ContentProps {
  businessName: string
  tagline: string
  description: string
  industry: string
  city: string
  state: string
  services: ServiceItem[]
  testimonials: TestimonialItem[]
  testimonialsTitle: string
  testimonialsSubtitle?: string
  contactInfo: ContactInfo
  aboutTitle: string
  aboutDescription: string
  aboutHistory?: string
  aboutValues: string[]
  aboutImageUrl?: string
  footerCopyright: string
  primaryCTA: string
  heroImageUrl?: string
  serviceImageUrls?: string[]
  rating?: number
  reviewCount?: number
}
