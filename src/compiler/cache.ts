import NodeCache from "node-cache";
import type { HydratableBundleResult, SSRBundleResult } from "./../types";

export type CacheStore = ReturnType<typeof cacheStore>;

export const cacheStore = () => {
  const cache = new NodeCache({
    stdTTL: 0,
  });

  const get = (key: string) => {
    if (!has(key)) {
      return;
    }
    return cache.get(key);
  };

  const del = (key: string) => {
    if (!has(key)) {
      return;
    }
    return cache.del(key);
  };

  const has = (key: string) => {
    return cache.has(key);
  };
  const set = (
    key: string,
    value: SSRBundleResult | HydratableBundleResult | string
  ) => {
    cache.set(key, value, 0);
  };

  return { get, del, has, set };
};
