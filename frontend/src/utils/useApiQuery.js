"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Thin wrapper around TanStack Query's useQuery for authenticated API calls.
 *
 * @param {string|string[]} queryKey — unique cache key (e.g. "posts" or ["posts", userId])
 * @param {string} endpoint — API path (e.g. "/api/posts"). Prepends NEXT_PUBLIC_API_URL.
 * @param {object} [options] — extra options forwarded to useQuery
 * @param {function} [options.select] — transform the raw response data
 * @param {boolean} [options.enabled] — conditionally enable/disable the query
 * @param {number} [options.staleTime] — override default staleTime
 * @param {object} [options.fetchOptions] — extra fetch init options (method, body, etc.)
 * @returns {{ data, isLoading, error, refetch, isFetching }}
 */
export function useApiQuery(queryKey, endpoint, options = {}) {
  const { select, enabled = true, staleTime, fetchOptions, ...rest } = options;

  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
  ).trim();

  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("collegeadda_token")
          : null;

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(fetchOptions?.headers || {}),
      };

      const res = await fetch(`${apiUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      if (!res.ok) {
        const error = new Error(`API error: ${res.status}`);
        error.status = res.status;
        throw error;
      }

      return res.json();
    },
    select,
    enabled,
    ...(staleTime !== undefined ? { staleTime } : {}),
    ...rest,
  });
}
