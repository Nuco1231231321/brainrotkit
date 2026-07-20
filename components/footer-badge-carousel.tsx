"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

const badges = [
  {
    href: "https://huzzler.so/products/qQKLfy6N6w/brainrotkit?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=free_listing",
    src: "https://huzzler.so/assets/images/embeddable-badges/featured.png",
    alt: "Huzzler Embed Badge",
    label: "View BrainrotKit on Huzzler",
    width: 159,
    height: 55,
  },
  {
    href: "https://showmebest.ai",
    src: "https://showmebest.ai/badge/feature-badge-white.webp",
    alt: "Featured on ShowMeBestAI",
    label: "View BrainrotKit featured on ShowMeBestAI",
    width: 220,
    height: 60,
  },
  {
    href: "https://huntifyai.com/tools/brainrotkit",
    src: "https://huntifyai.com/api/badge?theme=light",
    alt: "Featured on HuntifyAI",
    label: "View BrainrotKit featured on HuntifyAI",
    width: 220,
    height: 54,
  },
  {
    href: "https://findly.tools/brainrotkit?utm_source=brainrotkit",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on Findly.tools",
    label: "View BrainrotKit featured on Findly.tools",
    width: 175,
    height: 55,
  },
  {
    href: "https://startupfa.st",
    src: "https://startupfa.st/images/badges/powered-by-light.svg",
    alt: "Powered by Startup Fast",
    label: "View Startup Fast",
    width: 150,
    height: 44,
  },
  {
    href: "https://startupfa.me/s/brainrotkit?utm_source=brainrotkit.com",
    src: "https://startupfa.me/badges/featured-badge.webp",
    alt: "BrainrotKit - Featured on Startup Fame",
    label: "View BrainrotKit featured on Startup Fame",
    width: 171,
    height: 54,
  },
  {
    href: "https://dang.ai",
    src: "https://assets.dang.ai/badges/dang-verified-dark.png",
    alt: "Verified on DANG!",
    label: "View BrainrotKit verified on DANG!",
    width: 260,
    height: 94,
  },
  {
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge0-light.svg",
    alt: "Featured on Twelve Tools",
    label: "View BrainrotKit featured on Twelve Tools",
    width: 200,
    height: 54,
  },
  {
    href: "https://wired.business",
    src: "https://wired.business/badge1-light.svg",
    alt: "Featured on Wired Business",
    label: "View BrainrotKit featured on Wired Business",
    width: 200,
    height: 54,
  },
  {
    href: "https://www.foundrlist.com/product/brainrotkit?utm_source=badge&utm_medium=embed",
    src: "https://www.foundrlist.com/api/badge/brainrotkit",
    alt: "Featured on FoundrList",
    label: "View BrainrotKit featured on FoundrList",
    width: 150,
    height: 48,
  },
  {
    href: "https://submitaitools.org",
    src: "https://submitaitools.org/static_submitaitools/images/submitaitools.png",
    alt: "Submit AI Tools",
    label: "View Submit AI Tools",
    width: 200,
    height: 60,
  },
  {
    href: "https://saasgrow.app?ref=brainrotkit.com",
    src: "https://saasgrow.app/api/badge?type=featured&style=light",
    alt: "BrainrotKit on SaaSGrow",
    label: "View BrainrotKit on SaaSGrow",
    width: 240,
    height: 54,
  },
  {
    href: "https://aiagentsdirectory.com/agent/ai-brainrot-video-generator",
    src: "https://aiagentsdirectory.com/featured-badge.svg?v=2024",
    alt: "AI Brainrot Video Generator - Featured on AI Agents Directory",
    label: "Discover AI Brainrot Video Generator on AI Agents Directory",
    width: 200,
    height: 50,
  },
  {
    href: "https://neeed.directory/products/brainrotkit?utm_source=brainrotkit",
    src: "https://neeed.directory/badges/neeed-badge-light.svg",
    alt: "Featured on neeed.directory",
    label: "View BrainrotKit featured on neeed.directory",
    width: 139,
    height: 44,
  },
] as const;

const autoplayDelayMs = 3_500;

type CarouselState = {
  index: number;
  direction: 1 | -1;
};

export function FooterBadgeCarousel() {
  const [carousel, setCarousel] = useState<CarouselState>({ index: 0, direction: 1 });
  const [isPaused, setIsPaused] = useState(false);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(reducedMotionQuery.matches);

    updateMotionPreference();
    reducedMotionQuery.addEventListener("change", updateMotionPreference);
    return () => reducedMotionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateDocumentVisibility = () => setIsDocumentVisible(!document.hidden);

    updateDocumentVisibility();
    document.addEventListener("visibilitychange", updateDocumentVisibility);
    return () => document.removeEventListener("visibilitychange", updateDocumentVisibility);
  }, []);

  useEffect(() => {
    const shouldPause =
      isPaused || isPointerOver || isFocusWithin || !isDocumentVisible || prefersReducedMotion;

    if (shouldPause) return;

    const timer = window.setInterval(() => {
      setCarousel((current) => {
        const nextIndex = current.index + current.direction;

        if (nextIndex >= badges.length) {
          return { index: badges.length - 2, direction: -1 };
        }

        if (nextIndex < 0) {
          return { index: 1, direction: 1 };
        }

        return { ...current, index: nextIndex };
      });
    }, autoplayDelayMs);

    return () => window.clearInterval(timer);
  }, [isDocumentVisible, isFocusWithin, isPaused, isPointerOver, prefersReducedMotion]);

  const showPreviousBadge = () => {
    setCarousel((current) => ({
      index: current.index === 0 ? badges.length - 1 : current.index - 1,
      direction: -1,
    }));
  };

  const showNextBadge = () => {
    setCarousel((current) => ({
      index: current.index === badges.length - 1 ? 0 : current.index + 1,
      direction: 1,
    }));
  };

  return (
    <section
      className="footer-badge-carousel"
      aria-label="BrainrotKit listings and features"
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={() => setIsPointerOver(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusWithin(false);
      }}
    >
      <div className="footer-badge-stage">
        {badges.map((badge, badgeIndex) => {
          const isActive = badgeIndex === carousel.index;

          return (
            <a
              key={badge.href}
              className={`footer-badge-link${isActive ? " is-active" : ""}`}
              href={badge.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={badge.label}
              aria-hidden={isActive ? undefined : true}
              tabIndex={isActive ? undefined : -1}
              title={badge.label}
            >
              <Image
                className="footer-badge-image"
                alt={badge.alt}
                src={badge.src}
                width={badge.width}
                height={badge.height}
                unoptimized
              />
            </a>
          );
        })}
      </div>

      <div className="footer-badge-controls">
        <button type="button" onClick={showPreviousBadge} aria-label="Show previous badge" title="Previous badge">
          <ChevronLeft aria-hidden="true" size={16} strokeWidth={2} />
        </button>
        <span aria-live="polite" aria-atomic="true">
          <span className="sr-only">Showing badge </span>
          {carousel.index + 1} / {badges.length}
        </span>
        <button
          type="button"
          onClick={() => setIsPaused((current) => !current)}
          aria-label={isPaused ? "Resume badge rotation" : "Pause badge rotation"}
          title={isPaused ? "Resume rotation" : "Pause rotation"}
          aria-pressed={isPaused}
          disabled={prefersReducedMotion}
        >
          {isPaused ? <Play aria-hidden="true" size={14} fill="currentColor" /> : <Pause aria-hidden="true" size={14} fill="currentColor" />}
        </button>
        <button type="button" onClick={showNextBadge} aria-label="Show next badge" title="Next badge">
          <ChevronRight aria-hidden="true" size={16} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
