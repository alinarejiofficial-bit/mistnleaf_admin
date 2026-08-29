import { media } from "@/lib/media";

export const site = {
  name: "Mistnleaf",
  tagline: "Nature in Every Breath",
  description:
    "Mistnleaf Staycation is a forest retreat where slow mornings, soft light, and thoughtful hospitality meet.",
  email: "info@mistnleaf.com",
  phone: "+91 98765 43210",
  address: {
    line1: "Hill Road, Near Whispering Pines",
    line2: "Munnar, Kerala 685612",
    country: "India",
  },
  hours: "Front desk · 8:00 AM – 10:00 PM",
} as const;

export type Room = {
  slug: string;
  name: string;
  short: string;
  description: string;
  price: number;
  guests: number;
  size: string;
  beds: string;
  amenities: string[];
  includedServices: string[];
  availability: string;
  policies: string[];
  image: string;
  gallery: string[];
};

export const stayInfo = {
  checkIn: "2:00 PM",
  checkOut: "11:00 AM",
  checkInNote:
    "Early check-in may be arranged when the room is ready. Please share your arrival time when you book.",
  checkOutNote:
    "Late check-out is subject to availability and may carry a fee on peak days.",
  taxesNote: "Rates are per room per night. Taxes extra as applicable.",
} as const;

export const rooms: Room[] = [
  {
    slug: "canopy-suite",
    name: "Canopy Suite",
    short: "Tree-framed windows and a private balcony above the mist.",
    description:
      "Wake to filtered forest light in our most spacious suite. A freestanding tub, writing desk, and balcony make this the ideal base for longer stays. Soft linens, quiet finishes, and a view that opens into the canopy keep the pace unhurried from morning tea to evening light.",
    price: 9800,
    guests: 2,
    size: "42 m²",
    beds: "King bed",
    amenities: [
      "Private balcony",
      "Rain shower & freestanding tub",
      "Forest view",
      "Mini pantry",
      "Workspace",
      "Climate control",
      "High-speed Wi‑Fi",
      "In-room safe",
    ],
    includedServices: [
      "Daily housekeeping",
      "Complimentary estate tea & filtered water",
      "Evening turndown on request",
      "Welcome amenity on arrival",
      "Access to Mist Spa & Forest Pool",
    ],
    availability:
      "Two suites · often open midweek; weekends book 2–3 weeks ahead.",
    policies: [
      "Maximum occupancy: 2 adults",
      "Extra beds are not available in this suite",
      "Quiet hours from 10:00 PM to 7:00 AM",
      "Non-smoking room",
      "Free cancellation up to 48 hours before arrival (see Cancellation Policy)",
    ],
    image: media.suiteBedroom,
    gallery: [media.suiteBedroom, media.suiteBalcony, media.suiteBath],
  },
  {
    slug: "mist-cottage",
    name: "Mist Cottage",
    short: "A freestanding cottage wrapped in morning fog and ferns.",
    description:
      "Tucked a short walk from the main lodge, Mist Cottage offers privacy, a wood-accented lounge, and a porch made for tea at dusk. Ideal for couples who want space to spread out, or a small family with a child on the daybed.",
    price: 8500,
    guests: 3,
    size: "38 m²",
    beds: "Queen + daybed",
    amenities: [
      "Private porch",
      "Lounge nook",
      "Garden path access",
      "Heated floors",
      "Outdoor seating",
      "Rain shower",
      "High-speed Wi‑Fi",
      "Mini pantry",
    ],
    includedServices: [
      "Daily housekeeping",
      "Complimentary estate tea & filtered water",
      "Porch breakfast setup on request",
      "Welcome amenity on arrival",
      "Access to Mist Spa & Forest Pool",
    ],
    availability:
      "One cottage · limited inventory; reserve early for peak season.",
    policies: [
      "Maximum occupancy: 2 adults + 1 child (daybed)",
      "Children welcome with advance notice for bedding",
      "Quiet hours from 10:00 PM to 7:00 AM",
      "Non-smoking cottage",
      "Free cancellation up to 48 hours before arrival (see Cancellation Policy)",
    ],
    image: media.cottageExterior,
    gallery: [
      media.cottageExterior,
      media.cottageInterior,
      media.cottagePorch,
    ],
  },
  {
    slug: "leaf-room",
    name: "Leaf Room",
    short: "A calm lodge room with soft greens and curated quiet.",
    description:
      "Compact and carefully composed — linen bedding, a reading chair, and a window seat that looks into the canopy. Perfect for solo travellers and couples who want the lodge close at hand without giving up forest calm.",
    price: 6200,
    guests: 2,
    size: "28 m²",
    beds: "Queen bed",
    amenities: [
      "Window seat",
      "Reading chair",
      "Rain shower",
      "Organic toiletries",
      "Blackout drapes",
      "High-speed Wi‑Fi",
      "Climate control",
      "Wardrobe space",
    ],
    includedServices: [
      "Daily housekeeping",
      "Complimentary estate tea & filtered water",
      "Welcome amenity on arrival",
      "Access to Mist Spa & Forest Pool",
      "Library Lounge access",
    ],
    availability:
      "Two rooms · flexible dates midweek; weekends fill first.",
    policies: [
      "Maximum occupancy: 2 guests",
      "Extra beds are not available in this room",
      "Quiet hours from 10:00 PM to 7:00 AM",
      "Non-smoking room",
      "Free cancellation up to 48 hours before arrival (see Cancellation Policy)",
    ],
    image: media.leafBedroom,
    gallery: [media.leafBedroom, media.leafDetail, media.leafWindow],
  },
];

export const experiences = [
  {
    title: "Dawn Forest Walk",
    duration: "90 minutes",
    description:
      "A guided walk through misted trails with a naturalist — birdsong, soft light, and slow conversation.",
    image: media.forestWalk,
  },
  {
    title: "Tea Estate Afternoon",
    duration: "Half day",
    description:
      "Visit a nearby estate, learn the leaf-to-cup journey, and finish with a tasting on the veranda.",
    image: media.teaEstate,
  },
  {
    title: "Fireside Story Hour",
    duration: "Evenings",
    description:
      "Seasonal evenings by the hearth with local stories, warm drinks, and unhurried company.",
    image: media.fireside,
  },
  {
    title: "Botanical Workshop",
    duration: "2 hours",
    description:
      "Press leaves, mix simple herbal infusions, and take home a small keepsake from the grounds.",
    image: media.botanical,
  },
];

export const amenities = [
  {
    title: "Mist Spa",
    description: "Treatments using local botanicals in a quiet treatment room.",
    image: media.spa,
  },
  {
    title: "Library Lounge",
    description: "Deep chairs, travel writing, and board games by the window.",
    image: media.lounge,
  },
  {
    title: "Forest Pool",
    description: "A heated outdoor pool edged by ferns and stone.",
    image: media.pool,
  },
  {
    title: "Yoga Deck",
    description: "Morning sessions open to the canopy and cool air.",
    image: media.yoga,
  },
  {
    title: "Work Nook",
    description: "Reliable wifi and a calm desk space when you need it.",
    image: media.leafWindow,
  },
  {
    title: "Garden Paths",
    description: "Self-guided trails through moss, bamboo, and wildflowers.",
    image: media.forestLight,
  },
];

export const galleryImages = [
  { src: media.aboutLodge, alt: "Glass lodge above the misted valley", label: "The lodge" },
  { src: media.suiteBedroom, alt: "Canopy Suite opening to forest light", label: "Canopy Suite" },
  { src: media.cottageExterior, alt: "Mist Cottage among ferns and water", label: "Mist Cottage" },
  { src: media.forestWalk, alt: "Dawn walk through misted forest trails", label: "Forest trail" },
  { src: media.leafBedroom, alt: "Leaf Room window over the hills", label: "Leaf Room" },
  { src: media.teaEstate, alt: "Tea estate afternoon on the lawn", label: "Tea estate" },
  { src: media.fireside, alt: "Fireside evening under the open sky", label: "Fireside" },
  { src: media.pool, alt: "Forest pool edged by stone and plants", label: "Forest pool" },
  { src: media.dining, alt: "Seasonal dining at Fern Kitchen", label: "Fern Kitchen" },
  { src: media.hero, alt: "Fog settling over the valley", label: "Valley mist" },
  { src: media.spa, alt: "Quiet spa ritual at Mistnleaf", label: "Mist Spa" },
  { src: media.lounge, alt: "Library lounge with soft afternoon light", label: "Lounge" },
];

export const offers = [
  {
    title: "Two Nights in the Mist",
    detail: "Stay two nights and receive a complimentary forest walk for two.",
    valid: "Valid weekdays · excludes peak weekends",
    priceFrom: 11400,
  },
  {
    title: "Leaf & Table",
    detail: "Room plus a three-course dinner at Fern Kitchen on one evening.",
    valid: "Available year-round with advance notice",
    priceFrom: 8900,
  },
  {
    title: "Long Stay Soft Landing",
    detail: "Five nights or more includes daily breakfast and late checkout.",
    valid: "Subject to availability",
    priceFrom: 5600,
  },
];

export const testimonials = [
  {
    quote:
      "Waking to mist in the trees felt like the world had gone quiet just for us. We will be back.",
    name: "Ananya R.",
    place: "Bengaluru",
  },
  {
    quote:
      "The Canopy Suite, the forest walk, and dinner at Fern Kitchen — every detail was unhurried and warm.",
    name: "James & Priya",
    place: "Singapore",
  },
  {
    quote:
      "A rare stay where the landscape does most of the talking. Soft light, kind staff, deep rest.",
    name: "Meera S.",
    place: "Kochi",
  },
];

export const dining = {
  intro:
    "Fern Kitchen serves seasonal plates rooted in local produce — quiet breakfasts, lingering lunches, and candlelit dinners.",
  meals: [
    {
      name: "Breakfast",
      time: "7:30 – 10:30 AM",
      note: "Fresh fruit, house breads, eggs to order, and estate tea.",
    },
    {
      name: "Lunch",
      time: "12:30 – 3:00 PM",
      note: "Light bowls, salads, and a daily regional special.",
    },
    {
      name: "Dinner",
      time: "7:00 – 10:00 PM",
      note: "A short tasting menu that changes with the harvest.",
    },
  ],
  image: media.dining,
};

export const thingsToDo = [
  {
    title: "Eravikulam National Park",
    distance: "45 minutes",
    description: "Protected grasslands and mountain views on a guided day trip.",
  },
  {
    title: "Attukal Waterfalls",
    distance: "30 minutes",
    description: "A short drive to cascading water after monsoon rains.",
  },
  {
    title: "Local Spice Markets",
    distance: "20 minutes",
    description: "Browse cardamom, pepper, and handmade crafts in town.",
  },
  {
    title: "Sunrise Viewpoint",
    distance: "15 minutes",
    description:
      "Catch first light over the valley — we can arrange an early transfer.",
  },
];

export const faqs = [
  {
    q: "What is the check-in and check-out time?",
    a: "Check-in is from 2:00 PM and check-out is by 11:00 AM. Early arrival or late departure can be arranged when available.",
  },
  {
    q: "Do you offer airport or railway transfers?",
    a: "Yes. Private transfers can be arranged at the time of booking. Share your arrival details and we will confirm pricing.",
  },
  {
    q: "Are children welcome?",
    a: "Children are welcome in Mist Cottage and select rooms. Please note ages at booking so we can prepare bedding and meals.",
  },
  {
    q: "Is dining included?",
    a: "Breakfast is included with most packages. Lunch and dinner can be reserved separately or added through our Leaf & Table offer.",
  },
  {
    q: "What is your pet policy?",
    a: "We are not able to host pets at this time, except trained service animals with prior notice.",
  },
  {
    q: "How do I modify or cancel a reservation?",
    a: "Please review our Cancellation Policy. Changes are easiest by emailing stay@mistnleaf.com at least 48 hours before arrival where possible.",
  },
];

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRoom(slug: string) {
  return rooms.find((room) => room.slug === slug);
}

export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/rooms", label: "Rooms" },
  { href: "/experiences", label: "Experiences" },
  { href: "/amenities", label: "Amenities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/things-to-do", label: "Activities" },
  { href: "/location", label: "Location" },
  { href: "/contact", label: "Contact" },
] as const;
