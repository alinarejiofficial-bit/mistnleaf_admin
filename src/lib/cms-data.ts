export type PublishStatus = "Published" | "Draft";

export type CmsExperience = {
  id: string;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
  sortOrder: number;
  status: PublishStatus;
};

export type CmsHomepageSectionBand = {
  eyebrow: string;
  title: string;
  lead: string;
  viewAllLabel: string;
  /** Controls whether this band appears on the public homepage. */
  status: PublishStatus;
};

export type CmsHomepageLocationBand = {
  eyebrow: string;
  title: string;
  lead: string;
  directionsLabel: string;
  status: PublishStatus;
};

export type CmsHomepageBands = {
  rooms: CmsHomepageSectionBand;
  experiences: CmsHomepageSectionBand;
  amenities: CmsHomepageSectionBand;
  gallery: CmsHomepageSectionBand;
  offers: CmsHomepageSectionBand;
  testimonials: Pick<CmsHomepageSectionBand, "eyebrow" | "title" | "lead" | "status">;
  faqs: CmsHomepageSectionBand;
  location: CmsHomepageLocationBand;
};

export type CmsHomepage = {
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  heroMediaType: "image" | "video";
  heroMediaUrl: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  featuredRoomIds: string[];
  featuredOfferIds: string[];
  featuredExperienceIds: string[];
  featuredAmenityIds: string[];
  featuredTestimonialIds: string[];
  homepageGalleryImageIds: string[];
  homepageFaqIds: string[];
  bands: CmsHomepageBands;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsAbout = {
  eyebrow: string;
  title: string;
  content: string;
  imageUrl: string;
  ctaLabel: string;
  /** Standalone /about page hero eyebrow */
  pageEyebrow: string;
  /** Standalone /about page hero lead */
  lead: string;
  storyEyebrow: string;
  storyTitle: string;
  storyHtml: string;
  storyImageUrl: string;
  pillarsEyebrow: string;
  pillarsTitle: string;
  pillars: CmsAboutPillar[];
  atmosphereEyebrow: string;
  atmosphereTitle: string;
  atmosphereLead: string;
  mosaic: CmsAboutMosaicItem[];
  placeEyebrow: string;
  placeTitle: string;
  placeLead: string;
  placeMeta: string;
  placeCtaLabel: string;
  placeDirectionsLabel: string;
  placeImageUrl: string;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsAboutPillar = {
  id: string;
  title: string;
  copy: string;
};

export type CmsAboutMosaicItem = {
  id: string;
  imageUrl: string;
  caption: string;
};

export type CmsAmenity = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  status: PublishStatus;
};

export type CmsRoomContent = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  priceFrom: number;
  images: string[];
  amenities: string[];
  capacity: number;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsGalleryCategory = {
  id: string;
  name: string;
  status: PublishStatus;
};

export type CmsGalleryImage = {
  id: string;
  categoryId: string;
  title: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
  status: PublishStatus;
};

export type CmsWebsiteOffer = {
  id: string;
  title: string;
  code: string;
  description: string;
  details: string;
  discount: string;
  priceFrom: number;
  priceLabel: string;
  terms: string[];
  bookCtaLabel: string;
  bookCtaHref: string;
  sortOrder: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsOffersSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
  viewAllHref: string;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsTestimonial = {
  id: string;
  guestName: string;
  guestLocation: string;
  initials: string;
  content: string;
  rating: number;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsFaq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  status: PublishStatus;
};

export type CmsContact = {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  checkInNote: string;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsLocation = {
  title: string;
  description: string;
  address: string;
  airportNote: string;
  directionsUrl: string;
  mapEmbedUrl: string;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsSocialLinks = {
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  linkedin: string;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsFooterLink = { label: string; href: string };

export type CmsFooter = {
  brandEyebrow: string;
  brandDescription: string;
  /** @deprecated Use brandDescription — kept for older saved content. */
  tagline: string;
  copyright: string;
  exploreLinks: CmsFooterLink[];
  planLinks: CmsFooterLink[];
  policyLinks: CmsFooterLink[];
  staffLoginLabel: string;
  staffLoginHref: string;
  status: PublishStatus;
  updatedAt: string;
};

export type CmsContent = {
  homepage: CmsHomepage;
  about: CmsAbout;
  rooms: CmsRoomContent[];
  amenities: CmsAmenity[];
  experiences: CmsExperience[];
  galleryCategories: CmsGalleryCategory[];
  galleryImages: CmsGalleryImage[];
  offersSection: CmsOffersSection;
  offers: CmsWebsiteOffer[];
  testimonials: CmsTestimonial[];
  faqs: CmsFaq[];
  contact: CmsContact;
  location: CmsLocation;
  social: CmsSocialLinks;
  footer: CmsFooter;
};

export type CmsSectionId =
  | "homepage"
  | "about"
  | "rooms"
  | "amenities"
  | "experiences"
  | "gallery"
  | "offers"
  | "testimonials"
  | "faqs"
  | "location"
  | "social"
  | "footer";

/** Route segment for CMS pages — includes contact as a separate nav item. */
export type CmsRouteSection = CmsSectionId | "contact";

export const cmsSectionLabels: Record<CmsSectionId, string> = {
  homepage: "Homepage",
  about: "About",
  rooms: "Rooms",
  amenities: "Amenities",
  experiences: "Experiences",
  gallery: "Gallery",
  offers: "Offers & Packages",
  testimonials: "Testimonials",
  faqs: "FAQs",
  location: "Location",
  social: "Social media",
  footer: "Footer",
};

export const cmsRouteLabels: Record<CmsRouteSection, string> = {
  ...cmsSectionLabels,
  contact: "Contact information",
};

export const cmsRouteSections: CmsRouteSection[] = [
  "homepage",
  "about",
  "rooms",
  "amenities",
  "experiences",
  "gallery",
  "offers",
  "testimonials",
  "faqs",
  "contact",
  "location",
  "social",
  "footer",
];

export function isCmsRouteSection(value: string): value is CmsRouteSection {
  return cmsRouteSections.includes(value as CmsRouteSection);
}

const today = "2026-08-20";

export const defaultCmsContent: CmsContent = {
  homepage: {
    heroEyebrow: "A forest retreat",
    heroHeadline: "Nature in Every Breath",
    heroDescription:
      "A quiet forest retreat where mist, leaf, and soft light set the pace.",
    heroMediaType: "image",
    heroMediaUrl: "",
    heroCtaPrimary: "Book your stay",
    heroCtaSecondary: "Explore rooms",
    featuredRoomIds: ["cms-room-1", "cms-room-2", "cms-room-3"],
    featuredOfferIds: ["cms-offer-1", "cms-offer-2", "cms-offer-3"],
    featuredExperienceIds: [],
    featuredAmenityIds: ["amen-4", "amen-5", "amen-6"],
    featuredTestimonialIds: ["tst-1", "tst-2", "tst-3"],
    homepageGalleryImageIds: ["gal-1", "gal-2", "gal-3"],
    homepageFaqIds: [],
    bands: {
      rooms: {
        eyebrow: "Stay",
        title: "Featured Rooms",
        lead: "Suites and cottages shaped for rest, with forest light and soft linens.",
        viewAllLabel: "View all rooms",
        status: "Published",
      },
      experiences: {
        eyebrow: "Do",
        title: "Experiences",
        lead: "Optional rituals for your stay — walks, tea, and quiet evenings.",
        viewAllLabel: "All experiences",
        status: "Published",
      },
      amenities: {
        eyebrow: "Comforts",
        title: "Amenities",
        lead: "Shared spaces for rest between walks, meals, and quiet hours.",
        viewAllLabel: "Explore amenities",
        status: "Published",
      },
      gallery: {
        eyebrow: "Look",
        title: "A quiet visual diary",
        lead: "Soft light through glass, mist in the trees, and rooms shaped for unhurried mornings.",
        viewAllLabel: "Full gallery",
        status: "Published",
      },
      offers: {
        eyebrow: "Packages",
        title: "Offers & Packages",
        lead: "Thoughtful combinations of stay, meals, and experiences.",
        viewAllLabel: "View offers",
        status: "Published",
      },
      testimonials: {
        eyebrow: "Guests",
        title: "Guest Testimonials",
        lead: "Words from travellers who stayed among the mist and leaves.",
        status: "Published",
      },
      faqs: {
        eyebrow: "Help",
        title: "Frequently asked questions",
        lead: "Quick answers before you arrive — check-in, transfers, dining, and more.",
        viewAllLabel: "View all FAQs",
        status: "Published",
      },
      location: {
        eyebrow: "Location",
        title: "Above the valley in Munnar",
        lead: "Nestled near Whispering Pines — close enough to town, far enough for quiet.",
        directionsLabel: "Get directions",
        status: "Published",
      },
    },
    status: "Published",
    updatedAt: today,
  },
  about: {
    eyebrow: "About Mistnleaf",
    title: "Soft light, quiet rooms, forest air",
    content:
      "<p>Mistnleaf sits above the valley where morning fog settles between the trees. We keep the stay intentionally small — thoughtful rooms, seasonal dining, and hospitality that feels personal.</p>",
    imageUrl: "",
    ctaLabel: "Read our story",
    pageEyebrow: "Our story",
    lead: "A small retreat above the Munnar valley — shaped by mist, leaf, and the wish for unhurried days.",
    storyEyebrow: "Beginnings",
    storyTitle: "Rebuilt slowly for quieter stays",
    storyHtml:
      "<p>Mistnleaf began as a family lodge nestled in the hills of Munnar. We rebuilt it slowly — fewer rooms, better light, and hospitality that feels personal rather than performative.</p><p>Today we welcome guests who want quiet mornings, forest walks, and meals drawn from local farms and tea estates. Everything here is intentionally small so attention can stay close.</p><p>Whether you stay one night or a week, our aim is simple: give you space to breathe between the mist and the leaves.</p>",
    storyImageUrl: "",
    pillarsEyebrow: "How we host",
    pillarsTitle: "What we keep close",
    pillars: [
      {
        id: "about-pillar-1",
        title: "Intentionally small",
        copy: "Fewer rooms mean quieter mornings, closer care, and a stay that never feels hurried.",
      },
      {
        id: "about-pillar-2",
        title: "Forest first",
        copy: "Paths, mist, and canopy light shape the day — we build around the landscape, not over it.",
      },
      {
        id: "about-pillar-3",
        title: "Personal hospitality",
        copy: "Meals, walks, and quiet hours arranged with attention, not a script.",
      },
    ],
    atmosphereEyebrow: "Atmosphere",
    atmosphereTitle: "Light through glass, mist in the trees",
    atmosphereLead:
      "Lodge mornings, tea-hill afternoons, and evenings when the valley softens into fog.",
    mosaic: [
      { id: "about-mosaic-1", imageUrl: "", caption: "Tea hills beyond the lodge" },
      { id: "about-mosaic-2", imageUrl: "", caption: "Canopy light indoors" },
      { id: "about-mosaic-3", imageUrl: "", caption: "Valley mist at dusk" },
    ],
    placeEyebrow: "Find us",
    placeTitle: "Above the valley in Munnar",
    placeLead: "",
    placeMeta: "Front desk · 8:00 AM – 10:00 PM",
    placeCtaLabel: "Book your stay",
    placeDirectionsLabel: "Get directions",
    placeImageUrl: "",
    status: "Published",
    updatedAt: today,
  },
  rooms: [
    {
      id: "cms-room-1",
      name: "Canopy Suite",
      tagline: "Tree-framed windows and a private balcony above the mist.",
      description:
        "<p>Elevated suite with lounge seating, canopy views, and unhurried mornings.</p>",
      priceFrom: 9800,
      images: [],
      amenities: ["Balcony", "Forest view", "King bed", "Mini bar"],
      capacity: 2,
      status: "Published",
      updatedAt: "2026-08-18",
    },
    {
      id: "cms-room-2",
      name: "Mist Cottage",
      tagline: "A freestanding cottage wrapped in morning fog and ferns.",
      description:
        "<p>Private cottage with garden path access and fireplace evenings.</p>",
      priceFrom: 8500,
      images: [],
      amenities: ["Fireplace", "Garden access", "Queen bed"],
      capacity: 2,
      status: "Published",
      updatedAt: "2026-08-17",
    },
    {
      id: "cms-room-3",
      name: "Leaf Room",
      tagline: "A calm lodge room with soft greens and curated quiet.",
      description:
        "<p>Compact lodge room designed for rest between forest walks.</p>",
      priceFrom: 6200,
      images: [],
      amenities: ["Ensuite", "Work desk", "Tea service"],
      capacity: 2,
      status: "Published",
      updatedAt: "2026-08-16",
    },
  ],
  amenities: [
    {
      id: "amen-1",
      title: "Mist Spa",
      description: "Treatments using local botanicals in a quiet treatment room.",
      imageUrl: "",
      sortOrder: 0,
      status: "Published",
    },
    {
      id: "amen-2",
      title: "Library Lounge",
      description: "Deep chairs, travel writing, and board games by the window.",
      imageUrl: "",
      sortOrder: 1,
      status: "Published",
    },
    {
      id: "amen-3",
      title: "Forest Pool",
      description: "A heated outdoor pool edged by ferns and stone.",
      imageUrl: "",
      sortOrder: 2,
      status: "Published",
    },
    {
      id: "amen-4",
      title: "Yoga Deck",
      description: "Morning sessions open to the canopy and cool air.",
      imageUrl: "",
      sortOrder: 3,
      status: "Published",
    },
    {
      id: "amen-5",
      title: "Work Nook",
      description: "Reliable wifi and a calm desk space when you need it.",
      imageUrl: "",
      sortOrder: 4,
      status: "Published",
    },
    {
      id: "amen-6",
      title: "Garden Paths",
      description: "Self-guided trails through moss, bamboo, and wildflowers.",
      imageUrl: "",
      sortOrder: 5,
      status: "Published",
    },
  ],
  experiences: [
    {
      id: "exp-1",
      title: "Dawn Forest Walk",
      description:
        "A guided walk through misted trails with a naturalist — birdsong, soft light, and slow conversation.",
      duration: "90 minutes",
      imageUrl: "",
      sortOrder: 0,
      status: "Published",
    },
    {
      id: "exp-2",
      title: "Tea Estate Afternoon",
      description:
        "Visit a nearby estate, learn the leaf-to-cup journey, and finish with a tasting on the veranda.",
      duration: "Half day",
      imageUrl: "",
      sortOrder: 1,
      status: "Published",
    },
    {
      id: "exp-3",
      title: "Fireside Story Hour",
      description:
        "Seasonal evenings by the hearth with local stories, warm drinks, and unhurried company.",
      duration: "Evenings",
      imageUrl: "",
      sortOrder: 2,
      status: "Published",
    },
    {
      id: "exp-4",
      title: "Botanical Workshop",
      description:
        "Press leaves, mix simple herbal infusions, and take home a small keepsake from the grounds.",
      duration: "2 hours",
      imageUrl: "",
      sortOrder: 3,
      status: "Published",
    },
  ],
  galleryCategories: [
    { id: "gal-cat-1", name: "Property & views", status: "Published" },
    { id: "gal-cat-2", name: "Rooms & suites", status: "Published" },
    { id: "gal-cat-3", name: "Dining & spa", status: "Published" },
  ],
  galleryImages: [
    {
      id: "gal-1",
      categoryId: "gal-cat-1",
      title: "Morning mist over the valley",
      caption: "View from the main terrace at sunrise",
      imageUrl: "",
      sortOrder: 0,
      status: "Published",
    },
    {
      id: "gal-2",
      categoryId: "gal-cat-1",
      title: "Infinity pool deck",
      caption: "Heated pool surrounded by native planting",
      imageUrl: "",
      sortOrder: 1,
      status: "Published",
    },
    {
      id: "gal-3",
      categoryId: "gal-cat-2",
      title: "Leaf Suite living area",
      caption: "Warm timber finishes and leafy outlook",
      imageUrl: "",
      sortOrder: 0,
      status: "Published",
    },
    {
      id: "gal-4",
      categoryId: "gal-cat-3",
      title: "Open-air dining pavilion",
      caption: "Evening service under lantern light",
      imageUrl: "",
      sortOrder: 0,
      status: "Draft",
    },
  ],
  offersSection: {
    eyebrow: "Packages",
    title: "Offers & Packages",
    subtitle: "Thoughtful combinations of stay, meals, and experiences.",
    viewAllLabel: "View offers",
    viewAllHref: "#offers",
    status: "Published",
    updatedAt: today,
  },
  offers: [
    {
      id: "cms-offer-1",
      title: "Two Nights in the Mist",
      code: "MIST2",
      description: "Stay two nights and receive a complimentary forest walk for two.",
      details: "<p>Valid weekdays · excludes peak weekends</p>",
      discount: "Package",
      priceFrom: 11400,
      priceLabel: "FROM",
      terms: ["VALID WEEKDAYS", "EXCLUDES PEAK WEEKENDS"],
      bookCtaLabel: "Book package →",
      bookCtaHref: "#contact",
      sortOrder: 0,
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      active: true,
      status: "Published",
      updatedAt: "2026-08-18",
    },
    {
      id: "cms-offer-2",
      title: "Leaf & Table",
      code: "LEAF3",
      description: "Room plus a three-course dinner at Fern Kitchen on one evening.",
      details: "<p>Available year-round with advance notice</p>",
      discount: "Package",
      priceFrom: 8900,
      priceLabel: "FROM",
      terms: [],
      bookCtaLabel: "Book package →",
      bookCtaHref: "#contact",
      sortOrder: 1,
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      active: true,
      status: "Published",
      updatedAt: "2026-08-17",
    },
    {
      id: "cms-offer-3",
      title: "Long Stay Soft Landing",
      code: "LONG5",
      description: "Five nights or more includes daily breakfast and late checkout.",
      details: "<p>Subject to availability</p>",
      discount: "Package",
      priceFrom: 5600,
      priceLabel: "FROM",
      terms: ["SUBJECT TO AVAILABILITY"],
      bookCtaLabel: "Book package →",
      bookCtaHref: "#contact",
      sortOrder: 2,
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      active: true,
      status: "Published",
      updatedAt: "2026-08-16",
    },
  ],
  testimonials: [
    {
      id: "tst-1",
      guestName: "Ananya R.",
      guestLocation: "Bengaluru",
      initials: "AR",
      content:
        "Waking to mist in the trees felt like the world had gone quiet just for us. We will be back.",
      rating: 5,
      status: "Published",
      updatedAt: "2026-08-18",
    },
    {
      id: "tst-2",
      guestName: "James & Priya",
      guestLocation: "Singapore",
      initials: "JP",
      content:
        "The Canopy Suite, the forest walk, and dinner at Fern Kitchen — every detail was unhurried and warm.",
      rating: 5,
      status: "Published",
      updatedAt: "2026-08-17",
    },
    {
      id: "tst-3",
      guestName: "Meera S.",
      guestLocation: "Kochi",
      initials: "MS",
      content:
        "A rare stay where the landscape does most of the talking. Soft light, kind staff, deep rest.",
      rating: 5,
      status: "Published",
      updatedAt: "2026-08-15",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What are check-in and check-out times?",
      answer:
        "Check-in from 2:00 PM and check-out by 11:00 AM. Early check-in and late checkout are subject to availability.",
      sortOrder: 0,
      status: "Published",
    },
    {
      id: "faq-2",
      question: "Is airport transfer available?",
      answer:
        "Yes — private transfers can be arranged from the nearest airport. Please share your flight details at least 24 hours in advance.",
      sortOrder: 1,
      status: "Published",
    },
    {
      id: "faq-3",
      question: "Are pets allowed?",
      answer:
        "We welcome small pets in select Garden Deluxe rooms with prior approval and a nominal cleaning fee.",
      sortOrder: 2,
      status: "Published",
    },
  ],
  contact: {
    phone: "+91 98765 43210",
    email: "stay@mistnleaf.com",
    address: "Hill Road, Near Whispering Pines\nMunnar, Kerala 685612",
    whatsapp: "+91 98765 43210",
    checkInNote: "Private transfers can be arranged when you book.",
    status: "Published",
    updatedAt: today,
  },
  location: {
    title: "Above the valley in Munnar",
    description:
      "Nestled near Whispering Pines — close enough to town, far enough for quiet. Private transfers can be arranged when you book.",
    address: "Hill Road, Near Whispering Pines\nMunnar, Kerala 685612",
    airportNote: "~3.5–4 hrs from COK",
    directionsUrl: "https://maps.google.com",
    mapEmbedUrl: "",
    status: "Published",
    updatedAt: today,
  },
  social: {
    instagram: "https://instagram.com/mistnleaf",
    facebook: "https://facebook.com/mistnleaf",
    twitter: "",
    youtube: "",
    linkedin: "",
    status: "Published",
    updatedAt: today,
  },
  footer: {
    brandEyebrow: "Nature in every breath",
    brandDescription:
      "Mistnleaf Staycation is a forest retreat where slow mornings, soft light, and thoughtful hospitality meet.",
    tagline: "A quiet stay among the mist and trees",
    copyright: "© 2026 Mistnleaf. Nature in every breath.",
    exploreLinks: [
      { label: "About", href: "/about" },
      { label: "Rooms", href: "/rooms" },
      { label: "Experiences", href: "/experiences" },
      { label: "Amenities", href: "/amenities" },
      { label: "Dining", href: "/dining" },
      { label: "Gallery", href: "/gallery" },
    ],
    planLinks: [
      { label: "Offers", href: "/offers" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
      { label: "Check availability", href: "/booking/search" },
    ],
    policyLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cancellation Policy", href: "/cancellation" },
    ],
    staffLoginLabel: "Staff login",
    staffLoginHref: "/login",
    status: "Published",
    updatedAt: today,
  },
};

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function togglePublishStatus(status: PublishStatus): PublishStatus {
  return status === "Published" ? "Draft" : "Published";
}
