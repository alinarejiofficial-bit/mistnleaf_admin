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

function persist(
  content: CmsContent,
  user: { id: string; roleId: RoleId } | null,
) {
  saveCmsContent(content);
  if (user && canEditCmsContent(user.roleId)) {
    void saveCmsContentToApi(content, user.roleId, user.id).catch((error) => {
      console.error("CMS API save failed:", error);
    });
  }
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const userRef = useRef(currentUser);
  userRef.current = currentUser;

  const [ready, setReady] = useState(false);
  const [content, setContent] = useState<CmsContent>(defaultCmsContent);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (currentUser && canEditCmsContent(currentUser.roleId)) {
        try {
          const fromApi = await fetchCmsContentFromApi(
            currentUser.roleId,
            currentUser.id,
          );
          if (!cancelled) {
            setContent(fromApi);
            saveCmsContent(fromApi);
          }
        } catch {
          if (!cancelled) setContent(loadCmsContent());
        }
      } else if (!cancelled) {
        setContent(loadCmsContent());
      }

      if (!cancelled) setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const update = useCallback((updater: (prev: CmsContent) => CmsContent) => {
    setContent((prev) => {
      const next = updater(prev);
      persist(next, userRef.current);
      return next;
    });
  }, []);

  const value = useMemo<CmsContextValue>(
    () => ({
      ready,
      content,
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
          return { ...prev, amenities };
        }),
      deleteAmenity: (id) =>
        update((prev) => ({
          ...prev,
          amenities: prev.amenities.filter((item) => item.id !== id),
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
          return { ...prev, experiences };
        }),
      deleteExperience: (id) =>
        update((prev) => ({
          ...prev,
          experiences: prev.experiences.filter((item) => item.id !== id),
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
          return { ...prev, galleryImages };
        }),
      deleteGalleryImage: (id) =>
        update((prev) => ({
          ...prev,
          galleryImages: prev.galleryImages.filter((item) => item.id !== id),
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
          return { ...prev, offers };
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
          return { ...prev, testimonials };
        }),
      deleteTestimonial: (id) =>
        update((prev) => ({
          ...prev,
          testimonials: prev.testimonials.filter((item) => item.id !== id),
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
        persist(defaultCmsContent, userRef.current);
      },
    }),
    [content, ready, update],
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
