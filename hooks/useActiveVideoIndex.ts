'use client';

/**
 * Hook that centralizes TikTok-style feed navigation.
 * Tracks the active card via IntersectionObserver, debounces churn, and exposes helpers
 * for snapping to specific indexes or paging with next/prev commands.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type RegisterFn = (index: number, node: HTMLElement | null) => void;

export interface UseActiveVideoIndexOptions {
  itemCount: number;
  /**
   * Intersection ratio that marks a card as active.
   * Defaults to 0.6 (60% visible).
   */
  threshold?: number;
  /**
   * Extra margin to start detecting cards earlier.
   */
  rootMargin?: string;
  /**
   * Called whenever the active index changes.
   */
  onActiveChange?: (index: number) => void;
  /**
   * Triggered when the active index is within `nearEndOffset` of the itemCount.
   */
  onNearEnd?: () => void;
  /**
   * Number of remaining items that should trigger `onNearEnd`.
   */
  nearEndOffset?: number;
}

export interface ActiveVideoController {
  activeIndex: number;
  containerRef: (node: HTMLDivElement | null) => void;
  registerCard: RegisterFn;
  unregisterCard: (index: number) => void;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  goNext: () => void;
  goPrevious: () => void;
}

const DEFAULT_THRESHOLD = 0.6;
const DEFAULT_DEBOUNCE_MS = 120;

export function useActiveVideoIndex({
  itemCount,
  threshold = DEFAULT_THRESHOLD,
  rootMargin = '0px',
  onActiveChange,
  onNearEnd,
  nearEndOffset = 3,
}: UseActiveVideoIndexOptions): ActiveVideoController {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardElementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const elementIndexRef = useRef<Map<Element, number>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastNearEndCountRef = useRef<number>(0);

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  /**
   * Attach observer to all registered nodes whenever container or sizing changes.
   */
  const attachObserver = useCallback(() => {
    cleanupObserver();

    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        let candidateIndex: number | null = null;
        let highestRatio = 0;

        for (const entry of entries) {
          const index = elementIndexRef.current.get(entry.target);
          if (index == null) continue;

          if (entry.intersectionRatio >= threshold && entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            candidateIndex = index;
          }
        }

        if (candidateIndex == null) return;

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          setActiveIndex(prev => {
            if (candidateIndex === prev) {
              return prev;
            }
            return candidateIndex!;
          });
        }, DEFAULT_DEBOUNCE_MS);
      },
      {
        root: containerRef.current,
        threshold,
        rootMargin,
      }
    );

    cardElementsRef.current.forEach(node => {
      observerRef.current?.observe(node);
    });
  }, [cleanupObserver, rootMargin, threshold]);

  const containerCallback = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      attachObserver();
    },
    [attachObserver]
  );

  const registerCard: RegisterFn = useCallback(
    (index, node) => {
      const previousNode = cardElementsRef.current.get(index);
      if (previousNode && observerRef.current) {
        observerRef.current.unobserve(previousNode);
        elementIndexRef.current.delete(previousNode);
      }

      if (node) {
        cardElementsRef.current.set(index, node);
        elementIndexRef.current.set(node, index);

        if (observerRef.current) {
          observerRef.current.observe(node);
        }
      } else {
        cardElementsRef.current.delete(index);
      }
    },
    []
  );

  const unregisterCard = useCallback((index: number) => {
    const node = cardElementsRef.current.get(index);
    if (node) {
      if (observerRef.current) {
        observerRef.current.unobserve(node);
      }
      elementIndexRef.current.delete(node);
      cardElementsRef.current.delete(index);
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return;
      const node = cardElementsRef.current.get(index);
      if (!node) return;

      node.scrollIntoView({
        behavior,
        block: 'start',
      });
    },
    []
  );

  const goNext = useCallback(() => {
    if (activeIndex >= itemCount - 1) return;
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, itemCount, scrollToIndex]);

  const goPrevious = useCallback(() => {
    if (activeIndex <= 0) return;
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  // Cleanup observer on unmount.
  useEffect(() => {
    return () => {
      cleanupObserver();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [cleanupObserver]);

  // Notify consumer about active index changes.
  useEffect(() => {
    onActiveChange?.(activeIndex);
  }, [activeIndex, onActiveChange]);

  // Fire near-end callback when we approach the end of the current list.
  useEffect(() => {
    if (!onNearEnd || itemCount === 0) return;

    const thresholdIndex = Math.max(itemCount - nearEndOffset, 0);
    if (activeIndex >= thresholdIndex && lastNearEndCountRef.current !== itemCount) {
      lastNearEndCountRef.current = itemCount;
      onNearEnd();
    }
  }, [activeIndex, itemCount, nearEndOffset, onNearEnd]);

  return useMemo(
    () => ({
      activeIndex,
      containerRef: containerCallback,
      registerCard,
      unregisterCard,
      scrollToIndex,
      goNext,
      goPrevious,
    }),
    [activeIndex, containerCallback, registerCard, scrollToIndex, goNext, goPrevious]
  );
}
