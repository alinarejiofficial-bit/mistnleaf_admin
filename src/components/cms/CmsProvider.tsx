"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { canEditCmsContent } from "@/lib/cms-api-auth";
import type { RoleId } from "@/lib/roles";
import {
  fetchCmsContentFromApi,
  saveCmsContentToApi,
} from "@/lib/cms-api-client";
import {
  createId,
  defaultCmsContent,
  type CmsAbout,
  type CmsAmenity,
  type CmsContact,
  type CmsContent,
  type CmsExperience,
  type CmsFaq,
  type CmsFooter,
  type CmsGalleryCategory,
  type CmsGalleryImage,
  type CmsHomepage,
  type CmsLocation,
  type CmsOffersSection,
  type CmsRoomContent,
  type CmsSocialLinks,
  type CmsTestimonial,
  type CmsWebsiteOffer,
} from "@/lib/cms-data";
import { loadCmsContent, saveCmsContent } from "@/lib/cms-storage";

type CmsContextValue = {
  ready: boolean;
  content: CmsContent;
  contentSource: "api" | "local" | "default";
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;
  clearSaveError: () => void;
  saveHomepage: (homepage: CmsHomepage) => void;
  saveAbout: (about: CmsAbout) => void;
  saveRoom: (room: CmsRoomContent) => void;
  deleteRoom: (id: string) => void;
  saveAmenity: (amenity: CmsAmenity) => void;
  deleteAmenity: (id: string) => void;
  reorderAmenities: (amenities: CmsAmenity[]) => void;
  saveExperience: (experience: CmsExperience) => void;
  deleteExperience: (id: string) => void;
  reorderExperiences: (experiences: CmsExperience[]) => void;
  saveGalleryCategory: (category: CmsGalleryCategory) => void;
  deleteGalleryCategory: (id: string) => void;
  saveGalleryImage: (image: CmsGalleryImage) => void;
  deleteGalleryImage: (id: string) => void;
  reorderGalleryImages: (images: CmsGalleryImage[]) => void;
  saveOffer: (offer: CmsWebsiteOffer) => void;
  deleteOffer: (id: string) => void;
  saveOffersSection: (offersSection: CmsOffersSection) => void;
  saveTestimonial: (testimonial: CmsTestimonial) => void;
  deleteTestimonial: (id: string) => void;
  saveFaq: (faq: CmsFaq) => void;
  deleteFaq: (id: string) => void;
  reorderFaqs: (faqs: CmsFaq[]) => void;
  saveContact: (contact: CmsContact) => void;
  saveLocation: (location: CmsLocation) => void;
  saveSocial: (social: CmsSocialLinks) => void;
  saveFooter: (footer: CmsFooter) => void;
  resetToDefaults: () => void;
};

const CmsContext = createContext<CmsContextValue | null>(null);

function persistLocal(content: CmsContent) {
  saveCmsContent(content);
}

function mergeLocalOnlyItems<T extends { id: string }>(remote: T[], local: T[]): T[] {
  const remoteIds = new Set(remote.map((item) => item.id));
  const extras = local.filter((item) => item.id && !remoteIds.has(item.id));
  return extras.length ? [...remote, ...extras] : remote;
}

/** Recover items that saved locally but never reached the API (e.g. failed remote save). */
function mergeLocalAheadContent(remote: CmsContent, local: CmsContent): CmsContent {
  return {
    ...remote,
    rooms: mergeLocalOnlyItems(remote.rooms, local.rooms),
    amenities: mergeLocalOnlyItems(remote.amenities, local.amenities),
    experiences: mergeLocalOnlyItems(remote.experiences, local.experiences),
    galleryCategories: mergeLocalOnlyItems(remote.galleryCategories, local.galleryCategories),
    galleryImages: mergeLocalOnlyItems(remote.galleryImages, local.galleryImages),
    offers: mergeLocalOnlyItems(remote.offers, local.offers),
    testimonials: mergeLocalOnlyItems(remote.testimonials, local.testimonials),
    faqs: mergeLocalOnlyItems(remote.faqs, local.faqs),
  };
}

function hasExtraLocalItems(remote: CmsContent, merged: CmsContent) {
  return (
    merged.experiences.length > remote.experiences.length ||
    merged.rooms.length > remote.rooms.length ||
    merged.amenities.length > remote.amenities.length ||
    merged.galleryImages.length > remote.galleryImages.length ||
    merged.offers.length > remote.offers.length ||
    merged.testimonials.length > remote.testimonials.length ||
    merged.faqs.length > remote.faqs.length
  );
}

function persistRemote(
  content: CmsContent,
  user: { id: string; roleId: RoleId },
): Promise<void> {
  return saveCmsContentToApi(content, user.roleId, user.id);
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const userRef = useRef(currentUser);
  userRef.current = currentUser;

  const [ready, setReady] = useState(false);
  const [content, setContent] = useState<CmsContent>(defaultCmsContent);
  const [contentSource, setContentSource] = useState<"api" | "local" | "default">("default");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const pendingSaveRef = useRef<CmsContent | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);

  const flushRemoteSave = useCallback(async () => {
    const user = userRef.current;
    if (!user || !canEditCmsContent(user.roleId, user.permissions)) return;
    if (saveInFlightRef.current) return;

    saveInFlightRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    let failed = false;

    try {
      // Keep writing the latest queued document until nothing newer arrives mid-request.
      while (pendingSaveRef.current) {
        const payload = pendingSaveRef.current;
        await persistRemote(payload, user);
        if (pendingSaveRef.current === payload) {
          pendingSaveRef.current = null;
          setSaveError(null);
          setLastSavedAt(new Date().toLocaleTimeString());
        }
      }
    } catch (error: unknown) {
      failed = true;
      const message =
        error instanceof Error ? error.message : "Failed to save to the website backend.";
      console.error("CMS API save failed:", error);
      setSaveError(message);
    } finally {
      saveInFlightRef.current = false;
      if (!failed && pendingSaveRef.current) {
        void flushRemoteSave();
      } else {
        setIsSaving(false);
      }
    }
  }, []);

  const pushRemoteSave = useCallback(
    (nextContent: CmsContent) => {
      const user = userRef.current;
      if (!user || !canEditCmsContent(user.roleId, user.permissions)) return;

      pendingSaveRef.current = nextContent;
      setIsSaving(true);
      setSaveError(null);

      // If a save is already running, the in-flight loop / finally handler will pick this up.
      if (saveInFlightRef.current) return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      // Debounce rapid keystrokes, then flush serially so older PUTs cannot overwrite newer ones.
      saveTimerRef.current = setTimeout(() => {
        void flushRemoteSave();
      }, 350);
    },
    [flushRemoteSave],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (currentUser && canEditCmsContent(currentUser.roleId, currentUser.permissions)) {
        try {
          const fromApi = await fetchCmsContentFromApi(
            currentUser.roleId,
            currentUser.id,
          );
          if (cancelled) return;

          const local = loadCmsContent();
          const merged = mergeLocalAheadContent(fromApi, local);
          setContent(merged);
          setContentSource("api");
          saveCmsContent(merged);

          // Re-push local-only items so the homepage picker and public site stay in sync.
          if (hasExtraLocalItems(fromApi, merged)) {
            pushRemoteSave(merged);
          }
        } catch (error) {
          console.error("CMS API load failed:", error);
          if (!cancelled) {
            setContent(loadCmsContent());
            setContentSource("local");
          }
        }
      } else if (!cancelled) {
        setContent(loadCmsContent());
        setContentSource("local");
      }

      if (!cancelled) setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [currentUser, pushRemoteSave]);

  const update = useCallback(
    (updater: (prev: CmsContent) => CmsContent) => {
      setContent((prev) => {
        const next = updater(prev);
        try {
          persistLocal(next);
        } catch (error) {
          console.warn("CMS local cache failed:", error);
        }
        pushRemoteSave(next);
        return next;
      });
    },
    [pushRemoteSave],
  );

  const value = useMemo<CmsContextValue>(
    () => ({
      ready,
      content,
      contentSource,
      isSaving,
      saveError,
      lastSavedAt,
      clearSaveError: () => setSaveError(null),
      saveHomepage: (homepage) =>
        update((prev) => ({ ...prev, homepage: { ...homepage, updatedAt: today() } })),
      saveAbout: (about) =>
        update((prev) => ({ ...prev, about: { ...about, updatedAt: today() } })),
      saveRoom: (room) =>
        update((prev) => {
          const exists = prev.rooms.some((item) => item.id === room.id);
          const rooms = exists
            ? prev.rooms.map((item) =>
                item.id === room.id ? { ...room, updatedAt: today() } : item,
              )
            : [...prev.rooms, { ...room, updatedAt: today() }];
          return { ...prev, rooms };
        }),
      deleteRoom: (id) =>
        update((prev) => ({
          ...prev,
          rooms: prev.rooms.filter((item) => item.id !== id),
          homepage: {
            ...prev.homepage,
            featuredRoomIds: prev.homepage.featuredRoomIds.filter((rid) => rid !== id),
          },
        })),
      saveAmenity: (amenity) =>
        update((prev) => {
          const exists = prev.amenities.some((item) => item.id === amenity.id);
          const amenities = exists
            ? prev.amenities.map((item) => (item.id === amenity.id ? amenity : item))
            : [...prev.amenities, amenity];

          let featuredAmenityIds = prev.homepage.featuredAmenityIds ?? [];
          if (amenity.status === "Published") {
            if (!featuredAmenityIds.includes(amenity.id)) {
              featuredAmenityIds = [amenity.id, ...featuredAmenityIds].slice(0, 3);
            }
          } else {
            featuredAmenityIds = featuredAmenityIds.filter((id) => id !== amenity.id);
          }

          return {
            ...prev,
            amenities,
            homepage: { ...prev.homepage, featuredAmenityIds },
          };
        }),
      deleteAmenity: (id) =>
        update((prev) => ({
          ...prev,
          amenities: prev.amenities.filter((item) => item.id !== id),
          homepage: {
            ...prev.homepage,
            featuredAmenityIds: (prev.homepage.featuredAmenityIds ?? []).filter(
              (aid) => aid !== id,
            ),
          },
        })),
      reorderAmenities: (amenities) => update((prev) => ({ ...prev, amenities })),
      saveExperience: (experience) =>
        update((prev) => {
          const exists = prev.experiences.some((item) => item.id === experience.id);
          const experiences = exists
            ? prev.experiences.map((item) =>
                item.id === experience.id ? experience : item,
              )
            : [...prev.experiences, experience];

          let featuredExperienceIds = prev.homepage.featuredExperienceIds ?? [];
          if (experience.status === "Published") {
            if (!featuredExperienceIds.includes(experience.id)) {
              // Prefer newly published experiences on the homepage (max 4).
              featuredExperienceIds = [experience.id, ...featuredExperienceIds].slice(0, 4);
            }
          } else {
            featuredExperienceIds = featuredExperienceIds.filter((id) => id !== experience.id);
          }

          return {
            ...prev,
            experiences,
            homepage: { ...prev.homepage, featuredExperienceIds },
          };
        }),
      deleteExperience: (id) =>
        update((prev) => ({
          ...prev,
          experiences: prev.experiences.filter((item) => item.id !== id),
          homepage: {
            ...prev.homepage,
            featuredExperienceIds: (prev.homepage.featuredExperienceIds ?? []).filter(
              (eid) => eid !== id,
            ),
          },
        })),
      reorderExperiences: (experiences) => update((prev) => ({ ...prev, experiences })),
      saveGalleryCategory: (category) =>
        update((prev) => {
          const exists = prev.galleryCategories.some((item) => item.id === category.id);
          const galleryCategories = exists
            ? prev.galleryCategories.map((item) =>
                item.id === category.id ? category : item,
              )
            : [...prev.galleryCategories, category];
          return { ...prev, galleryCategories };
        }),
      deleteGalleryCategory: (id) =>
        update((prev) => ({
          ...prev,
          galleryCategories: prev.galleryCategories.filter((item) => item.id !== id),
          galleryImages: prev.galleryImages.filter((item) => item.categoryId !== id),
        })),
      saveGalleryImage: (image) =>
        update((prev) => {
          const exists = prev.galleryImages.some((item) => item.id === image.id);
          const galleryImages = exists
            ? prev.galleryImages.map((item) => (item.id === image.id ? image : item))
            : [...prev.galleryImages, image];

          let homepageGalleryImageIds = prev.homepage.homepageGalleryImageIds ?? [];
          if (image.status === "Published") {
            if (!homepageGalleryImageIds.includes(image.id)) {
              homepageGalleryImageIds = [image.id, ...homepageGalleryImageIds].slice(0, 7);
            }
          } else {
            homepageGalleryImageIds = homepageGalleryImageIds.filter((gid) => gid !== image.id);
          }

          return {
            ...prev,
            galleryImages,
            homepage: { ...prev.homepage, homepageGalleryImageIds },
          };
        }),
      deleteGalleryImage: (id) =>
        update((prev) => ({
          ...prev,
          galleryImages: prev.galleryImages.filter((item) => item.id !== id),
          homepage: {
            ...prev.homepage,
            homepageGalleryImageIds: (prev.homepage.homepageGalleryImageIds ?? []).filter(
              (gid) => gid !== id,
            ),
          },
        })),
      reorderGalleryImages: (images) =>
        update((prev) => ({ ...prev, galleryImages: images })),
      saveOffer: (offer) =>
        update((prev) => {
          const exists = prev.offers.some((item) => item.id === offer.id);
          const offers = exists
            ? prev.offers.map((item) =>
                item.id === offer.id ? { ...offer, updatedAt: today() } : item,
              )
            : [...prev.offers, { ...offer, updatedAt: today() }];

          let featuredOfferIds = prev.homepage.featuredOfferIds ?? [];
          const isLive = offer.status === "Published" && offer.active !== false;
          if (isLive) {
            if (!featuredOfferIds.includes(offer.id)) {
              featuredOfferIds = [offer.id, ...featuredOfferIds].slice(0, 3);
            }
          } else {
            featuredOfferIds = featuredOfferIds.filter((id) => id !== offer.id);
          }

          return {
            ...prev,
            offers,
            homepage: { ...prev.homepage, featuredOfferIds },
          };
        }),
      deleteOffer: (id) =>
        update((prev) => ({
          ...prev,
          offers: prev.offers.filter((item) => item.id !== id),
          homepage: {
            ...prev.homepage,
            featuredOfferIds: prev.homepage.featuredOfferIds.filter((oid) => oid !== id),
          },
        })),
      saveOffersSection: (offersSection) =>
        update((prev) => ({
          ...prev,
          offersSection: { ...offersSection, updatedAt: today() },
        })),
      saveTestimonial: (testimonial) =>
        update((prev) => {
          const exists = prev.testimonials.some((item) => item.id === testimonial.id);
          const testimonials = exists
            ? prev.testimonials.map((item) =>
                item.id === testimonial.id
                  ? { ...testimonial, updatedAt: today() }
                  : item,
              )
            : [...prev.testimonials, { ...testimonial, updatedAt: today() }];

          let featuredTestimonialIds = prev.homepage.featuredTestimonialIds ?? [];
          if (testimonial.status === "Published") {
            if (!featuredTestimonialIds.includes(testimonial.id)) {
              featuredTestimonialIds = [testimonial.id, ...featuredTestimonialIds].slice(0, 3);
            }
          } else {
            featuredTestimonialIds = featuredTestimonialIds.filter(
              (id) => id !== testimonial.id,
            );
          }

          return {
            ...prev,
            testimonials,
            homepage: { ...prev.homepage, featuredTestimonialIds },
          };
        }),
      deleteTestimonial: (id) =>
        update((prev) => ({
          ...prev,
          testimonials: prev.testimonials.filter((item) => item.id !== id),
          homepage: {
            ...prev.homepage,
            featuredTestimonialIds: (prev.homepage.featuredTestimonialIds ?? []).filter(
              (tid) => tid !== id,
            ),
          },
        })),
      saveFaq: (faq) =>
        update((prev) => {
          const exists = prev.faqs.some((item) => item.id === faq.id);
          const faqs = exists
            ? prev.faqs.map((item) => (item.id === faq.id ? faq : item))
            : [...prev.faqs, faq];
          return { ...prev, faqs };
        }),
      deleteFaq: (id) =>
        update((prev) => ({
          ...prev,
          faqs: prev.faqs.filter((item) => item.id !== id),
        })),
      reorderFaqs: (faqs) => update((prev) => ({ ...prev, faqs })),
      saveContact: (contact) =>
        update((prev) => ({
          ...prev,
          contact: { ...contact, updatedAt: today() },
        })),
      saveLocation: (location) =>
        update((prev) => ({
          ...prev,
          location: { ...location, updatedAt: today() },
        })),
      saveSocial: (social) =>
        update((prev) => ({
          ...prev,
          social: { ...social, updatedAt: today() },
        })),
      saveFooter: (footer) =>
        update((prev) => ({
          ...prev,
          footer: { ...footer, updatedAt: today() },
        })),
      resetToDefaults: () => {
        setContent(defaultCmsContent);
        try {
          persistLocal(defaultCmsContent);
        } catch (error) {
          console.warn("CMS local cache failed:", error);
        }
        pushRemoteSave(defaultCmsContent);
      },
    }),
    [content, ready, contentSource, isSaving, saveError, lastSavedAt, update, pushRemoteSave],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) throw new Error("useCms must be used within CmsProvider");
  return context;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export { createId };
