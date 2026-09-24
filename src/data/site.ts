// Single source of truth for business details. The contact section, the
// footer, WhatsApp links and the JSON-LD schema all read from here, so a
// change of phone number or hours is made once.

export const SITE_URL = "https://marketmovers.co.in";

export const business = {
  name: "Market Movers",
  description:
    "Wholesale distributor of plumbing pipes, fittings, HDPE, PVC, sprinkler systems and bath & sanitary products in Jabalpur, Madhya Pradesh.",
  phones: [
    { display: "+91 94250 66923", tel: "+919425066923" },
    { display: "+91 75668 66923", tel: "+917566866923" },
  ],
  whatsapp: "919425066923",
  address: {
    street: "4 & 5 Anjuman Market, Marhatal",
    city: "Jabalpur",
    region: "Madhya Pradesh",
    postalCode: "482001",
    country: "IN",
  },
  mapUrl: "https://maps.app.goo.gl/YJqPVN8XAv8VZDPh6",
  hours: { days: "Monday to Saturday", short: "Mon–Sat", opens: "09:00", closes: "19:00", display: "9 am – 7 pm" },
} as const;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${business.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Brands we distribute. `slug` is set when the brand has its own page. */
export const brands: { name: string; slug?: string }[] = [
  { name: "Finolex", slug: "finolex" },
  { name: "Dutron", slug: "dutron" },
  { name: "Texmo", slug: "texmo" },
  { name: "Waterflo", slug: "waterflo" },
  { name: "Johnson Bathrooms", slug: "johnson" },
  { name: "Kisan" },
  { name: "Plasto" },
  { name: "MBH" },
  { name: "Rewa" },
  { name: "Reco" },
];

export const categories = [
  {
    id: "pvc",
    name: "PVC pipes & fittings",
    text: "uPVC, CPVC, rigid PVC and SWR for water supply, drainage and industrial lines.",
    brands: ["Finolex", "Dutron", "Texmo", "Waterflo", "Kisan", "Plasto", "MBH"],
  },
  {
    id: "hdpe",
    name: "HDPE pipes",
    text: "For underground mains, agriculture and water supply networks.",
    brands: ["Texmo", "Dutron", "Kisan", "MBH", "Rewa"],
  },
  {
    id: "sprinkler",
    name: "Sprinkler & drip irrigation",
    text: "Sprinkler pipes, drip lines and components for farms and landscaping.",
    brands: ["Kisan", "Texmo", "Rewa", "MBH"],
  },
  {
    id: "bath",
    name: "Bath & sanitaryware",
    text: "Faucets, sanitaryware, showers, sinks and accessories for homes and projects.",
    brands: ["Johnson Bathrooms", "Reco"],
  },
  {
    id: "casing",
    name: "Casing & column pipes",
    text: "Borewell casing and submersible column pipes for pump installations.",
    brands: ["Finolex", "Dutron", "Texmo", "Waterflo"],
  },
  {
    id: "suction",
    name: "Suction & garden hose",
    text: "Flexible hose for pump suction, garden use and water transfer.",
    brands: ["Dutron", "Texmo"],
  },
  {
    id: "fittings",
    name: "Fittings & accessories",
    text: "Elbows, tees, reducers, valves, clamps, solvent cement and more.",
    brands: [],
  },
] as const;

export const customers = [
  "Builders & contractors",
  "Retailers & dealers",
  "Farmers",
  "Government projects",
  "Housing projects",
  "Industry",
];
