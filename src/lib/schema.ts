import { business, brands, SITE_URL } from "@/data/site";
import type { Brand } from "@/data/brands";

const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function homeSchema() {
  const a = business.address;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: business.name,
        inLanguage: "en-IN",
        publisher: { "@id": BUSINESS_ID },
      },
      {
        "@type": "HardwareStore",
        "@id": BUSINESS_ID,
        name: business.name,
        description: business.description,
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/assets/og-image.jpg`,
        logo: `${SITE_URL}/assets/apple-touch-icon.png`,
        telephone: business.phones.map((p) => p.tel),
        address: {
          "@type": "PostalAddress",
          streetAddress: a.street,
          addressLocality: a.city,
          addressRegion: a.region,
          postalCode: a.postalCode,
          addressCountry: a.country,
        },
        hasMap: business.mapUrl,
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: business.hours.opens,
            closes: business.hours.closes,
          },
        ],
        areaServed: { "@type": "State", name: a.region },
        brand: brands.map((b) => ({ "@type": "Brand", name: b.name })),
      },
    ],
  };
}

export function brandSchema(brand: Brand, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: brand.seo.title,
    description: brand.seo.description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@type": "Brand", name: brand.about },
    publisher: { "@id": BUSINESS_ID },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: brand.about, item: url },
      ],
    },
  };
}
