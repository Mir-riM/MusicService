import { useCallback, useEffect, useMemo, useState } from "react";
import { PaginatedResponse } from "../types/common/pagination";

type WithId = { _id: string };

type UsePaginatedListParams<T extends WithId> = {
  pageSize?: number;
  dedupeById?: boolean;
  resetDeps?: unknown[];
};

export function usePaginatedList<T extends WithId>({
  pageSize = 20,
  dedupeById = true,
  resetDeps = [],
}: UsePaginatedListParams<T>) {
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const applyPage = useCallback(
    (pageData?: PaginatedResponse<T>) => {
      if (!pageData) return;

      setHasMore(pageData.pageInfo.hasMore);

      if (pageData.pageInfo.offset === 0) {
        setItems(pageData.items);
        return;
      }

      setItems((prev) => {
        const combined = [...prev, ...pageData.items];
        if (!dedupeById) return combined;

        const byId = new Map<string, T>();
        combined.forEach((item) => byId.set(item._id, item));
        return Array.from(byId.values());
      });
    },
    [dedupeById],
  );

  const reset = useCallback(() => {
    setOffset(0);
    setItems([]);
    setHasMore(false);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setOffset((prev) => prev + pageSize);
  }, [hasMore, pageSize]);

  useEffect(() => {
    reset();
  }, [reset, ...resetDeps]);

  return useMemo(
    () => ({
      items,
      offset,
      hasMore,
      applyPage,
      setOffset,
      loadMore,
      reset,
    }),
    [items, offset, hasMore, applyPage, loadMore, reset],
  );
}
