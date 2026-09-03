import { media } from "@/lib/media";
import {
  amenities as defaultAmenities,
  experiences as defaultExperiences,
  faqs as defaultFaqs,
  galleryImages as defaultGalleryImages,
  offers as defaultOffers,
  rooms as defaultRooms,
  site as defaultSite,
  testimonials as defaultTestimonials,
  type Room,
} from "@/lib/site";
import { getCmsAdminBase } from "@/lib/cms/fetch";
import type { PublishedCmsContent } from "@/lib/cms/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickImage(url: string | undefined, fallback: string) {
  const value = url?.trim();
  if (!value) return fallback;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  // CMS uploads are stored on the admin host (e.g. /uploads/cms/...).
  if (value.startsWith("/")) {
    return `${getCmsAdminBase()}${value}`;
  }
  return value;
}

/** Prefer remote Unsplash fallbacks so empty CMS images still render on the public site. */
const galleryFallbackSrcs = [
  media.hero,
  media.lodgeExterior,
  media.suiteBath,
  media.locationHills,
  media.spa,
  media.pool,
  media.lounge,
  media.yoga,
  media.cottageInterior,
  media.suiteBalcony,
];

function galleryFallback(index: number) {
  return galleryFallbackSrcs[index % galleryFallbackSrcs.length] ?? media.hero;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const roomImageBySlug = Object.fromEntries(
  defaultRooms.map((room) => [room.slug, room.image]),
);

const experienceImageByTitle = Object.fromEntries(
  defaultExperiences.map((item) => [item.title.toLowerCase(), item.image]),
);

const amenityImageByTitle = Object.fromEntries(
  defaultAmenities.map((item) => [item.title.toLowerCase(), item.image]),
);

function mapRoom(room: PublishedCmsContent["rooms"][number], fallback?: Room): Room {
  const slug = fallback?.slug ?? slugify(room.name);
  const fallbackRoom = fallback ?? defaultRooms.find((item) => item.slug === slug);

  return {
    slug,
    name: room.name,
    short: room.tagline || fallbackRoom?.short || "",
    description: stripHtml(room.description) || fallbackRoom?.description || "",
    price: room.priceFrom || fallbackRoom?.price || 0,
    guests: room.capacity || fallbackRoom?.guests || 2,
    size: fallbackRoom?.size ?? "—",
    beds: fallbackRoom?.beds ?? "—",
    amenities: room.amenities.length ? room.amenities : (fallbackRoom?.amenities ?? []),
    includedServices: fallbackRoom?.includedServices ?? [],
    availability: fallbackRoom?.availability ?? "",
    policies: fallbackRoom?.policies ?? [],
    image: pickImage(room.images[0], roomImageBySlug[slug] ?? media.leafBedroom),
    gallery: room.images.length
      ? room.images
      : (fallbackRoom?.gallery ?? [pickImage(room.images[0], roomImageBySlug[slug] ?? media.leafBedroom)]),
  };
}

export type MappedSiteContent = {
  site: {
    name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      line2: string;
      country: string;
    };
    hours: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    eyebrow: string;
    title: string;
    content: string;
    image: string;
    ctaLabel: string;
    pageEyebrow: string;
    lead: string;
    storyEyebrow: string;
    storyTitle: string;
    storyHtml: string;
    storyImage: string;
    pillarsEyebrow: string;
    pillarsTitle: string;
    pillars: Array<{ id: string; title: string; copy: string }>;
    atmosphereEyebrow: string;
    atmosphereTitle: string;
    atmosphereLead: string;
    mosaic: Array<{ id: string; image: string; caption: string }>;
    placeEyebrow: string;
    placeTitle: string;
    placeLead: string;
    placeMeta: string;
    placeCtaLabel: string;
    placeDirectionsLabel: string;
    placeImage: string;
  };
  rooms: Room[];
  allRooms: Room[];
  experiences: Array<{
    title: string;
    duration: string;
    description: string;
    image: string;
  }>;
  amenities: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  homepageAmenities: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  galleryImages: Array<{
    src: string;
    alt: string;
    label?: string;
  }>;
  offers: Array<{
    title: string;
    detail: string;
    valid: string;
    priceFrom: number;
    priceLabel?: string;
    bookCtaLabel?: string;
    bookCtaHref?: string;
  }>;
  offersSection: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAllLabel: string;
  };
  homepageBands: {
    rooms: { eyebrow: string; title: string; lead: string; viewAllLabel: string };
    experiences: { eyebrow: string; title: string; lead: string; viewAllLabel: string };
    amenities: { eyebrow: string; title: string; lead: string; viewAllLabel: string };
    gallery: { eyebrow: string; title: string; lead: string; viewAllLabel: string };
    offers: { eyebrow: string; title: string; lead: string; viewAllLabel: string };
    testimonials: { eyebrow: string; title: string; lead: string };
    faqs: { eyebrow: string; title: string; lead: string; viewAllLabel: string };
    location: { eyebrow: string; title: string; lead: string; directionsLabel: string };
  };
  homepageExperiences: Array<{
    title: string;
    duration: string;
    description: string;
    image: string;
  }>;
  homepageGalleryImages: Array<{
    src: string;
    alt: string;
    label?: string;
  }>;
  homepageOffers: Array<{
    title: string;
    detail: string;
    valid: string;
    priceFrom: number;
    priceLabel: string;
    bookCtaLabel: string;
    bookCtaHref: string;
  }>;
  homepageFaqs: Array<{
    q: string;
    a: string;
  }>;
  homepageLocation: {
    title: string;
    description: string;
    directionsLabel: string;
    addressLine1: string;
    addressLine2: string;
    airportNote: string;
    directionsUrl: string;
  };
  testimonials: Array<{
    quote: string;
    name: string;
    place: string;
  }>;
  homepageTestimonials: Array<{
    quote: string;
    name: string;
    place: string;
  }>;
  faqs: Array<{
    q: string;
    a: string;
  }>;
  location: {
    title: string;
    description: string;
    addressLine1: string;
    addressLine2: string;
    airportNote: string;
    directionsUrl: string;
  };
  contact: {
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    whatsapp: string;
    checkInNote: string;
  };
  footer: {
    tagline: string;
    description: string;
    copyright: string;
    exploreLinks: Array<{ href: string; label: string }>;
    planLinks: Array<{ href: string; label: string }>;
    policyLinks: Array<{ href: string; label: string }>;
  };
  fromCms: boolean;
};

export function mapCmsToSiteContent(cms: PublishedCmsContent): MappedSiteContent {
  const addressLines = cms.contact.address.split("\n").map((line) => line.trim());
  const locationLines = cms.location.address.split("\n").map((line) => line.trim());

  const allRooms = cms.rooms.map((room) => {
    const fallback = defaultRooms.find((item) => slugify(item.name) === slugify(room.name));
    return mapRoom(room, fallback);
  });

  const featuredRooms = cms.homepage.featuredRoomIds.length
    ? allRooms.filter((room) =>
        cms.rooms.some(
          (cmsRoom) =>
            cms.homepage.featuredRoomIds.includes(cmsRoom.id) &&
            slugify(cmsRoom.name) === room.slug,
        ),
      )
    : allRooms;

  const rooms = featuredRooms.length ? featuredRooms : allRooms.slice(0, 3);

  const sortedExperiences = [...cms.experiences].sort((a, b) => a.sortOrder - b.sortOrder);
  // Public API already returns published-only; keep a status check for safety.
  const publishedExperiences = sortedExperiences.filter(
    (item) => !item.status || item.status === "Published",
  );
  const featuredExperienceIds = cms.homepage.featuredExperienceIds ?? [];
  const selectedExperiences = featuredExperienceIds.length
    ? featuredExperienceIds
        .map((id) => publishedExperiences.find((item) => item.id === id))
        .filter((item): item is (typeof publishedExperiences)[number] => Boolean(item))
    : [];
  const homepageExperienceSource =
    selectedExperiences.length > 0
      ? selectedExperiences
      : publishedExperiences.slice(0, 4);

  const experiences = sortedExperiences.map((item) => ({
    title: item.title,
    duration: item.duration,
    description: item.description,
    image: pickImage(
      item.imageUrl,
      experienceImageByTitle[item.title.toLowerCase()] ?? media.forestWalk,
    ),
  }));

  const homepageExperiences = homepageExperienceSource.map((item) => ({
    title: item.title,
    duration: item.duration,
    description: item.description,
    image: pickImage(
      item.imageUrl,
      experienceImageByTitle[item.title.toLowerCase()] ?? media.forestWalk,
    ),
  }));

  const sortedAmenities = [...cms.amenities].sort((a, b) => a.sortOrder - b.sortOrder);
  const publishedAmenities = sortedAmenities.filter(
    (item) => !item.status || item.status === "Published",
  );
  const featuredAmenityIds = cms.homepage.featuredAmenityIds ?? [];
  const selectedAmenities = featuredAmenityIds.length
    ? featuredAmenityIds
        .map((id) => publishedAmenities.find((item) => item.id === id))
        .filter((item): item is (typeof publishedAmenities)[number] => Boolean(item))
    : [];
  const homepageAmenitySource =
    selectedAmenities.length > 0 ? selectedAmenities : publishedAmenities.slice(0, 3);

  const mapAmenity = (item: (typeof publishedAmenities)[number]) => ({
    title: item.title,
    description: item.description,
    image: pickImage(
      item.imageUrl,
      amenityImageByTitle[item.title.toLowerCase()] ?? media.spa,
    ),
  });

  const amenities = sortedAmenities.map(mapAmenity);
  const homepageAmenities = homepageAmenitySource.map(mapAmenity);

  const sortedGallery = [...cms.galleryImages].sort((a, b) => a.sortOrder - b.sortOrder);
  const publishedGallery = sortedGallery.filter(
    (item) => !item.status || item.status === "Published",
  );
  const featuredGalleryIds = cms.homepage.homepageGalleryImageIds ?? [];
  const selectedGallery = featuredGalleryIds.length
    ? featuredGalleryIds
        .map((id) => publishedGallery.find((item) => item.id === id))
        .filter((item): item is (typeof publishedGallery)[number] => Boolean(item))
    : [];
  const homepageGallerySource =
    selectedGallery.length > 0 ? selectedGallery : publishedGallery.slice(0, 7);

  const galleryImages = sortedGallery.map((item, index) => ({
    src: pickImage(item.imageUrl, galleryFallback(index)),
    alt: item.caption || item.title,
    label: item.title,
  }));

  const homepageGalleryImages = homepageGallerySource.map((item, index) => ({
    src: pickImage(item.imageUrl, galleryFallback(index)),
    alt: item.caption || item.title,
    label: item.title,
  }));

  const sortedOffers = [...cms.offers].sort((a, b) => a.sortOrder - b.sortOrder);
  const publishedOffers = sortedOffers.filter(
    (item) => (!item.status || item.status === "Published") && item.active !== false,
  );
  const featuredOfferIds = cms.homepage.featuredOfferIds ?? [];
  const selectedOffers = featuredOfferIds.length
    ? featuredOfferIds
        .map((id) => publishedOffers.find((item) => item.id === id))
        .filter((item): item is (typeof publishedOffers)[number] => Boolean(item))
    : [];
  // Homepage only — never reuse the full offers catalog when featured picks exist.
  const homepageOfferSource =
    selectedOffers.length > 0 ? selectedOffers : publishedOffers.slice(0, 3);

  const mapOffer = (item: (typeof publishedOffers)[number]) => ({
    title: item.title,
    detail: item.description,
    valid: item.terms.join(" · ") || stripHtml(item.details),
    priceFrom: item.priceFrom,
    priceLabel: item.priceLabel || "FROM",
    bookCtaLabel: item.bookCtaLabel || "Book package",
    bookCtaHref: item.bookCtaHref || "/booking/search",
  });

  // Full /offers page always gets the complete published catalog.
  const offers = publishedOffers.map(mapOffer);
  const homepageOffers = homepageOfferSource.map(mapOffer);

  const publishedTestimonials = cms.testimonials.filter(
    (item) => !item.status || item.status === "Published",
  );
  const featuredTestimonialIds = cms.homepage.featuredTestimonialIds ?? [];
  const selectedTestimonials = featuredTestimonialIds.length
    ? featuredTestimonialIds
        .map((id) => publishedTestimonials.find((item) => item.id === id))
        .filter((item): item is (typeof publishedTestimonials)[number] => Boolean(item))
    : [];
  const homepageTestimonialSource =
    selectedTestimonials.length > 0
      ? selectedTestimonials
      : publishedTestimonials.slice(0, 3);

  const mapTestimonial = (item: (typeof publishedTestimonials)[number]) => ({
    quote: item.content,
    name: item.guestName,
    place: item.guestLocation,
  });

  const testimonials = publishedTestimonials.map(mapTestimonial);
  const homepageTestimonials = homepageTestimonialSource.map(mapTestimonial);

  const sortedFaqs = [...cms.faqs].sort((a, b) => a.sortOrder - b.sortOrder);
  const publishedFaqs = sortedFaqs.filter((item) => item.status === "Published");
  const homepageFaqSource = (cms.homepage.homepageFaqIds ?? []).length
    ? publishedFaqs.filter((item) => (cms.homepage.homepageFaqIds ?? []).includes(item.id))
    : publishedFaqs.slice(0, 4);

  const faqs = sortedFaqs.map((item) => ({
    q: item.question,
    a: item.answer,
  }));

  const homepageFaqs = homepageFaqSource.map((item) => ({
    q: item.question,
    a: item.answer,
  }));

  return {
    site: {
      name: defaultSite.name,
      tagline: cms.homepage.heroHeadline || defaultSite.tagline,
      description: cms.footer.brandDescription || defaultSite.description,
      email: cms.contact.email || defaultSite.email,
      phone: cms.contact.phone || defaultSite.phone,
      address: {
        line1: addressLines[0] ?? defaultSite.address.line1,
        line2: addressLines[1] ?? defaultSite.address.line2,
        country: defaultSite.address.country,
      },
      hours: defaultSite.hours,
    },
    hero: {
      eyebrow: cms.homepage.heroEyebrow,
      title: cms.homepage.heroHeadline,
      description: cms.homepage.heroDescription,
      image: pickImage(cms.homepage.heroMediaUrl, media.hero),
      ctaPrimary: cms.homepage.heroCtaPrimary,
      ctaSecondary: cms.homepage.heroCtaSecondary,
    },
    about: {
      eyebrow: cms.about.eyebrow,
      title: cms.about.title,
      content: stripHtml(cms.about.content),
      image: pickImage(cms.about.imageUrl, media.aboutLodge),
      ctaLabel: cms.about.ctaLabel,
      pageEyebrow: cms.about.pageEyebrow || cms.about.eyebrow || "Our story",
      lead:
        cms.about.lead ||
        "A small retreat above the Munnar valley — shaped by mist, leaf, and the wish for unhurried days.",
      storyEyebrow: cms.about.storyEyebrow || "Beginnings",
      storyTitle: cms.about.storyTitle || cms.about.title,
      storyHtml: cms.about.storyHtml || cms.about.content,
      storyImage: pickImage(cms.about.storyImageUrl, media.forestWalk),
      pillarsEyebrow: cms.about.pillarsEyebrow || "How we host",
      pillarsTitle: cms.about.pillarsTitle || "What we keep close",
      pillars: (cms.about.pillars?.length
        ? cms.about.pillars
        : [
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
          ]
      ).map((pillar) => ({
        id: pillar.id,
        title: pillar.title,
        copy: pillar.copy,
      })),
      atmosphereEyebrow: cms.about.atmosphereEyebrow || "Atmosphere",
      atmosphereTitle:
        cms.about.atmosphereTitle || "Light through glass, mist in the trees",
      atmosphereLead:
        cms.about.atmosphereLead ||
        "Lodge mornings, tea-hill afternoons, and evenings when the valley softens into fog.",
      mosaic: (cms.about.mosaic?.length
        ? cms.about.mosaic
        : [
            { id: "about-mosaic-1", imageUrl: "", caption: "Tea hills beyond the lodge" },
            { id: "about-mosaic-2", imageUrl: "", caption: "Canopy light indoors" },
            { id: "about-mosaic-3", imageUrl: "", caption: "Valley mist at dusk" },
          ]
      ).map((item, index) => ({
        id: item.id,
        image: pickImage(
          item.imageUrl,
          [media.teaEstate, media.leafBedroom, media.hero][index] ?? media.hero,
        ),
        caption: item.caption,
      })),
      placeEyebrow: cms.about.placeEyebrow || "Find us",
      placeTitle: cms.about.placeTitle || cms.location.title,
      placeLead:
        cms.about.placeLead ||
        [locationLines[0], locationLines[1]].filter(Boolean).join("\n"),
      placeMeta: cms.about.placeMeta || defaultSite.hours,
      placeCtaLabel: cms.about.placeCtaLabel || "Book your stay",
      placeDirectionsLabel: cms.about.placeDirectionsLabel || "Get directions",
      placeImage: pickImage(cms.about.placeImageUrl, media.cottageExterior),
    },
    rooms: rooms.length ? rooms : defaultRooms.slice(0, 3),
    allRooms: allRooms.length ? allRooms : defaultRooms,
    experiences: experiences.length ? experiences : defaultExperiences,
    amenities: amenities.length ? amenities : defaultAmenities,
    homepageAmenities: homepageAmenities.length
      ? homepageAmenities
      : defaultAmenities.slice(0, 3),
    galleryImages: galleryImages.length ? galleryImages : defaultGalleryImages,
    offers: offers.length ? offers : defaultOffers,
    offersSection: {
      eyebrow: cms.offersSection.eyebrow,
      title: cms.offersSection.title,
      subtitle: cms.offersSection.subtitle,
      viewAllLabel: cms.offersSection.viewAllLabel,
    },
    homepageBands: cms.homepage.bands ?? {
      rooms: {
        eyebrow: "Stay",
        title: "Featured Rooms",
        lead: "Suites and cottages shaped for rest, with forest light and soft linens.",
        viewAllLabel: "View all rooms",
      },
      experiences: {
        eyebrow: "Do",
        title: "Experiences",
        lead: "Optional rituals for your stay — walks, tea, and quiet evenings.",
        viewAllLabel: "All experiences",
      },
      amenities: {
        eyebrow: "Comforts",
        title: "Amenities",
        lead: "Shared spaces for rest between walks, meals, and quiet hours.",
        viewAllLabel: "Explore amenities",
      },
      gallery: {
        eyebrow: "Look",
        title: "A quiet visual diary",
        lead: "Soft light through glass, mist in the trees, and rooms shaped for unhurried mornings.",
        viewAllLabel: "Full gallery",
      },
      offers: {
        eyebrow: "Packages",
        title: "Offers & Packages",
        lead: "Thoughtful combinations of stay, meals, and experiences.",
        viewAllLabel: "View offers",
      },
      testimonials: {
        eyebrow: "Guests",
        title: "Guest Testimonials",
        lead: "Words from travellers who stayed among the mist and leaves.",
      },
      faqs: {
        eyebrow: "Help",
        title: "Frequently asked questions",
        lead: "Quick answers before you arrive — check-in, transfers, dining, and more.",
        viewAllLabel: "View all FAQs",
      },
      location: {
        eyebrow: "Location",
        title: "Above the valley in Munnar",
        lead: "Nestled near Whispering Pines — close enough to town, far enough for quiet.",
        directionsLabel: "Get directions",
      },
    },
    homepageExperiences: homepageExperiences.length
      ? homepageExperiences
      : defaultExperiences.slice(0, 4),
    homepageGalleryImages: homepageGalleryImages.length
      ? homepageGalleryImages
      : defaultGalleryImages.slice(0, 7).map((image, index) => ({
          src: image.src.startsWith("http") ? image.src : galleryFallback(index),
          alt: image.alt,
          label: image.label,
        })),
    homepageOffers: homepageOffers.length
      ? homepageOffers
      : defaultOffers.map((offer) => ({
          ...offer,
          priceLabel: "FROM",
          bookCtaLabel: "Book package",
          bookCtaHref: "/booking/search",
        })),
    homepageFaqs: homepageFaqs.length ? homepageFaqs : defaultFaqs.slice(0, 4),
    homepageLocation: {
      title: cms.homepage.bands?.location?.title ?? cms.location.title,
      description: cms.homepage.bands?.location?.lead ?? cms.location.description,
      directionsLabel: cms.homepage.bands?.location?.directionsLabel ?? "Get directions",
      addressLine1: locationLines[0] ?? defaultSite.address.line1,
      addressLine2: locationLines[1] ?? defaultSite.address.line2,
      airportNote: cms.location.airportNote,
      directionsUrl: cms.location.directionsUrl || "/location",
    },
    testimonials: testimonials.length ? testimonials : defaultTestimonials,
    homepageTestimonials: homepageTestimonials.length
      ? homepageTestimonials
      : defaultTestimonials.slice(0, 3),
    faqs: faqs.length ? faqs : defaultFaqs,
    location: {
      title: cms.location.title,
      description: cms.location.description,
      addressLine1: locationLines[0] ?? defaultSite.address.line1,
      addressLine2: locationLines[1] ?? defaultSite.address.line2,
      airportNote: cms.location.airportNote,
      directionsUrl: cms.location.directionsUrl || "/location",
    },
    contact: {
      phone: cms.contact.phone,
      email: cms.contact.email,
      addressLine1: addressLines[0] ?? defaultSite.address.line1,
      addressLine2: addressLines[1] ?? defaultSite.address.line2,
      whatsapp: cms.contact.whatsapp,
      checkInNote: cms.contact.checkInNote,
    },
    footer: {
      tagline: cms.footer.brandEyebrow || cms.footer.tagline,
      description: cms.footer.brandDescription,
      copyright: cms.footer.copyright,
      exploreLinks: cms.footer.exploreLinks.map((link) => ({
        href: link.href.startsWith("#") ? link.href : link.href,
        label: link.label,
      })),
      planLinks: cms.footer.planLinks.map((link) => ({
        href: link.href.startsWith("#") ? link.href : link.href,
        label: link.label,
      })),
      policyLinks: cms.footer.policyLinks.map((link) => ({
        href: link.href,
        label: link.label,
      })),
    },
    fromCms: true,
  };
}

export function getDefaultSiteContent(): MappedSiteContent {
  return {
    site: {
      name: defaultSite.name,
      tagline: defaultSite.tagline,
      description: defaultSite.description,
      email: defaultSite.email,
      phone: defaultSite.phone,
      address: defaultSite.address,
      hours: defaultSite.hours,
    },
    hero: {
      eyebrow: "Staycation",
      title: defaultSite.tagline,
      description: defaultSite.description,
      image: media.hero,
      ctaPrimary: "Book your stay",
      ctaSecondary: "Explore rooms",
    },
    about: {
      eyebrow: "About Mistnleaf",
      title: "Soft light, quiet rooms, forest air",
      content:
        "Mistnleaf sits above the valley where morning fog settles between the trees. We keep the stay intentionally small — thoughtful rooms, seasonal dining, and hospitality that feels personal.",
      image: media.aboutLodge,
      ctaLabel: "Read our story",
      pageEyebrow: "Our story",
      lead: "A small retreat above the Munnar valley — shaped by mist, leaf, and the wish for unhurried days.",
      storyEyebrow: "Beginnings",
      storyTitle: "Rebuilt slowly for quieter stays",
      storyHtml:
        "<p>Mistnleaf began as a family lodge nestled in the hills of Munnar. We rebuilt it slowly — fewer rooms, better light, and hospitality that feels personal rather than performative.</p><p>Today we welcome guests who want quiet mornings, forest walks, and meals drawn from local farms and tea estates. Everything here is intentionally small so attention can stay close.</p><p>Whether you stay one night or a week, our aim is simple: give you space to breathe between the mist and the leaves.</p>",
      storyImage: media.forestWalk,
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
        { id: "about-mosaic-1", image: media.teaEstate, caption: "Tea hills beyond the lodge" },
        { id: "about-mosaic-2", image: media.leafBedroom, caption: "Canopy light indoors" },
        { id: "about-mosaic-3", image: media.hero, caption: "Valley mist at dusk" },
      ],
      placeEyebrow: "Find us",
      placeTitle: "Above the valley in Munnar",
      placeLead: `${defaultSite.address.line1}\n${defaultSite.address.line2}`,
      placeMeta: defaultSite.hours,
      placeCtaLabel: "Book your stay",
      placeDirectionsLabel: "Get directions",
      placeImage: media.cottageExterior,
    },
    rooms: defaultRooms.slice(0, 3),
    allRooms: defaultRooms,
    experiences: defaultExperiences,
    amenities: defaultAmenities,
    homepageAmenities: defaultAmenities.slice(0, 3),
    galleryImages: defaultGalleryImages,
    offers: defaultOffers,
    offersSection: {
      eyebrow: "Packages",
      title: "Offers & Packages",
      subtitle: "Thoughtful combinations of stay, meals, and experiences.",
      viewAllLabel: "View offers",
    },
    homepageBands: {
      rooms: {
        eyebrow: "Stay",
        title: "Featured Rooms",
        lead: "Suites and cottages shaped for rest, with forest light and soft linens.",
        viewAllLabel: "View all rooms",
      },
      experiences: {
        eyebrow: "Do",
        title: "Experiences",
        lead: "Optional rituals for your stay — walks, tea, and quiet evenings.",
        viewAllLabel: "All experiences",
      },
      amenities: {
        eyebrow: "Comforts",
        title: "Amenities",
        lead: "Shared spaces for rest between walks, meals, and quiet hours.",
        viewAllLabel: "Explore amenities",
      },
      gallery: {
        eyebrow: "Look",
        title: "A quiet visual diary",
        lead: "Soft light through glass, mist in the trees, and rooms shaped for unhurried mornings.",
        viewAllLabel: "Full gallery",
      },
      offers: {
        eyebrow: "Packages",
        title: "Offers & Packages",
        lead: "Thoughtful combinations of stay, meals, and experiences.",
        viewAllLabel: "View offers",
      },
      testimonials: {
        eyebrow: "Guests",
        title: "Guest Testimonials",
        lead: "Words from travellers who stayed among the mist and leaves.",
      },
      faqs: {
        eyebrow: "Help",
        title: "Frequently asked questions",
        lead: "Quick answers before you arrive — check-in, transfers, dining, and more.",
        viewAllLabel: "View all FAQs",
      },
      location: {
        eyebrow: "Location",
        title: "Above the valley in Munnar",
        lead: "Nestled near Whispering Pines — close enough to town, far enough for quiet.",
        directionsLabel: "Get directions",
      },
    },
    homepageExperiences: defaultExperiences.slice(0, 4),
    homepageGalleryImages: defaultGalleryImages.slice(0, 7).map((image, index) => ({
      src: image.src.startsWith("http") ? image.src : galleryFallback(index),
      alt: image.alt,
      label: image.label,
    })),
    homepageOffers: defaultOffers.map((offer) => ({
      ...offer,
      priceLabel: "FROM",
      bookCtaLabel: "Book package",
      bookCtaHref: "/booking/search",
    })),
    homepageFaqs: defaultFaqs.slice(0, 4),
    homepageLocation: {
      title: "Above the valley in Munnar",
      description:
        "Nestled near Whispering Pines — close enough to town, far enough for quiet.",
      directionsLabel: "Get directions",
      addressLine1: defaultSite.address.line1,
      addressLine2: defaultSite.address.line2,
      airportNote: "~3.5–4 hrs from COK",
      directionsUrl: "/location",
    },
    testimonials: defaultTestimonials,
    homepageTestimonials: defaultTestimonials.slice(0, 3),
    faqs: defaultFaqs,
    location: {
      title: "Above the valley in Munnar",
      description:
        "Nestled near Whispering Pines — close enough to town, far enough for quiet. Private transfers can be arranged when you book.",
      addressLine1: defaultSite.address.line1,
      addressLine2: defaultSite.address.line2,
      airportNote: "~3.5–4 hrs from COK",
      directionsUrl: "/location",
    },
    contact: {
      phone: defaultSite.phone,
      email: defaultSite.email,
      addressLine1: defaultSite.address.line1,
      addressLine2: defaultSite.address.line2,
      whatsapp: defaultSite.phone,
      checkInNote: "",
    },
    footer: {
      tagline: defaultSite.tagline,
      description: defaultSite.description,
      copyright: `© ${new Date().getFullYear()} ${defaultSite.name}. Nature in every breath.`,
      exploreLinks: [
        { href: "/about", label: "About" },
        { href: "/rooms", label: "Rooms" },
        { href: "/experiences", label: "Experiences" },
        { href: "/amenities", label: "Amenities" },
        { href: "/dining", label: "Dining" },
        { href: "/gallery", label: "Gallery" },
      ],
      planLinks: [
        { href: "/offers", label: "Offers" },
        { href: "/things-to-do", label: "Things to Do" },
        { href: "/explore", label: "Site guide" },
        { href: "/faqs", label: "FAQs" },
        { href: "/contact", label: "Contact / Enquiry" },
        { href: "/booking/search", label: "Check availability" },
      ],
      policyLinks: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms & Conditions" },
        { href: "/cancellation", label: "Cancellation Policy" },
        { href: "/staff/login", label: "Staff login" },
      ],
    },
    fromCms: false,
  };
}
