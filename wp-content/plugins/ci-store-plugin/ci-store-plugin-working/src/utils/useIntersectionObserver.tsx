//https://usehooks-ts.com/react-hook/use-intersection-observer
import { RefObject, useEffect, useState } from 'react';

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

function useIntersectionObserver(elementRef: RefObject<Element>, { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false }: Args): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>({ isIntersecting: false } as IntersectionObserverEntry);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    if (elementRef.current) {
      const node = elementRef?.current; // DOM Ref
      const hasIOSupport = !!window.IntersectionObserver;

      if (!hasIOSupport || frozen || !node) return;

      const observerParams = { threshold, root, rootMargin };
      const observer = new IntersectionObserver(updateEntry, observerParams);

      observer.observe(node);

      return () => observer.disconnect();
    }
  }, [elementRef.current, JSON.stringify(threshold), root, rootMargin, frozen]);

  return entry;
}

export default useIntersectionObserver;
