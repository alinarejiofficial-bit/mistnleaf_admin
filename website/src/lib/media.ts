/** Curated Unsplash imagery — boutique forest resort / misty-hill stay */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const media = {
  /** Brand logo lockup (transparent PNG) */
  logo: "/images/mistnleaf-logo.png",
  /** Light logo for dark backgrounds */
  logoLight: "/images/mistnleaf-logo-light.png",
  hero: u("photo-1470071459604-3b5ec3a7fe05", 2000),
  /** Glass hillside lodge above misty mountain valleys */
  aboutLodge: "/images/about-lodge.png",
  locationHills: u("photo-1464822759023-fed622ff2c3b", 1400),
  lodgeExterior: u("photo-1449158743715-0a90ebb6d2d8", 1600),
  /** Stone cottage porch above misty water */
  cottageExterior: "/images/mist-cottage.png",
  /** Canopy suite bedroom opening to forest mist */
  suiteBedroom: "/images/canopy-suite.png",
  suiteBath: u("photo-1582719478250-c89cae4dc85b", 1200),
  suiteBalcony: u("photo-1590490360182-c33d57733427", 1200),
  cottageInterior: u("photo-1578683010236-d716f9a3f461", 1200),
  cottagePorch: u("photo-1449158743715-0a90ebb6d2d8", 1200),
  /** Leaf room window overlooking misted hills */
  leafBedroom: "/images/leaf-room.png",
  leafDetail: u("photo-1611892440504-42a792e24d32", 1200),
  leafWindow: u("photo-1595576508898-0ad5c879a061", 1200),
  /** Dawn forest trail */
  forestWalk: "/images/dawn-forest-walk.png",
  /** Tea tasting / leaf-to-cup */
  teaEstate: "/images/tea-estate-afternoon.png",
  /** Warm hearth for story hour */
  fireside: "/images/fireside-story-hour.png",
  /** Herbs & botanical workshop */
  botanical: "/images/botanical-workshop.png",
  spa: u("photo-1544161515-4ab6ce6db874", 1200),
  lounge: u("photo-1618221195710-dd6b41faaea6", 1200),
  /** Outdoor pool with stone edge and greenery */
  pool: u("photo-1576013551627-0cc20b96c2a7", 1200),
  yoga: u("photo-1544367567-0f2fcb009e0b", 1200),
  dining: u("photo-1559339352-11d035aa65de", 1600),
  diningClose: u("photo-1414235077428-338989a2e8c0", 1400),
  mistHills: u("photo-1506905925346-21bda4d32df4", 1400),
  forestLight: u("photo-1448375240586-882707db888b", 1400),
  lakeDusk: u("photo-1501785888041-af3ef285b470", 1400),
  resortPath: u("photo-1470770841072-f978cf4d019e", 1400),
  spaDetail: u("photo-1540555700478-4be289fbecef", 1400),
  mountainCabin: u("photo-1542718610-a1d656d1884c", 1400),
} as const;
