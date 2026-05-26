"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getMatches,
  getKeywords,
  getDashboardStats,
} from "./dashboard-actions";
import { deleteKeyword as deleteKeywordAction } from "./keywords/actions";

export interface Match {
  id: number;
  title: string;
  permalink: string;
  matched_at: string;
  keywords: {
    phrase: string;
    user_id: string;
  };
}

export interface Keyword {
  id: number;
  phrase: string;
  target_subreddits: string[];
  discord_webhook_url: string | null;
  created_at: string;
  user_id: string;
}

export interface Stats {
  keywordCount: number;
  matchCount: number;
  lastMatch: string;
}

interface DashboardContextType {
  matchesCache: Record<number, Match[]>;
  keywords: Keyword[] | null;
  stats: Stats | null;
  matchesPage: number;
  hasMoreMatches: boolean;
  isMatchesLoading: boolean;
  isKeywordsLoading: boolean;
  isStatsLoading: boolean;
  tier: string;
  userEmail: string;

  fetchMatches: (page: number, force?: boolean) => Promise<void>;
  fetchKeywords: (force?: boolean) => Promise<void>;
  fetchStats: (force?: boolean) => Promise<void>;
  prefetchMatches: (page: number) => Promise<void>;
  prefetchKeywords: () => Promise<void>;
  deleteKeyword: (id: number) => Promise<{ error?: string } | undefined>;
  refreshKeywords: () => void;
  refreshStats: () => void;
  refreshMatches: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
  children,
  initialTier,
  initialUserEmail,
}: {
  children: React.ReactNode;
  initialTier: string;
  initialUserEmail: string;
}) {
  const [matchesCache, setMatchesCache] = useState<Record<number, Match[]>>({});
  const [keywords, setKeywords] = useState<Keyword[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [matchesPage, setMatchesPage] = useState(1);
  const [hasMoreMatches, setHasMoreMatches] = useState(true);

  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  const [isKeywordsLoading, setIsKeywordsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const prefetchingPagesRef = useRef<Set<number>>(new Set());
  const prefetchingKeywordsRef = useRef(false);
  const prefetchingStatsRef = useRef(false);

  // Fetch matches for a specific page (from DB or cache)
  const fetchMatches = useCallback(
    async (page: number, force: boolean = false) => {
      if (matchesCache[page] && !force) {
        setMatchesPage(page);
        return;
      }

      setIsMatchesLoading(true);
      try {
        const result = await getMatches(page, 20);
        setMatchesCache((prev) => ({
          ...prev,
          [page]: result.matches,
        }));
        setHasMoreMatches(result.hasMore);
        setMatchesPage(page);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      } finally {
        setIsMatchesLoading(false);
      }
    },
    [matchesCache]
  );

  // Fetch all keywords
  const fetchKeywords = useCallback(
    async (force: boolean = false) => {
      if (keywords !== null && !force) {
        return;
      }

      setIsKeywordsLoading(true);
      try {
        const result = await getKeywords();
        setKeywords(result);
      } catch (err) {
        console.error("Failed to fetch keywords:", err);
      } finally {
        setIsKeywordsLoading(false);
      }
    },
    [keywords]
  );

  // Fetch overall statistics
  const fetchStats = useCallback(
    async (force: boolean = false) => {
      if (stats !== null && !force) {
        return;
      }

      setIsStatsLoading(true);
      try {
        const result = await getDashboardStats();
        setStats(result);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setIsStatsLoading(false);
      }
    },
    [stats]
  );

  // Background hover prefetching for matches
  const prefetchMatches = useCallback(
    async (page: number) => {
      if (matchesCache[page]) return;
      if (prefetchingPagesRef.current.has(page)) return;

      prefetchingPagesRef.current.add(page);
      try {
        const result = await getMatches(page, 20);
        setMatchesCache((prev) => ({
          ...prev,
          [page]: result.matches,
        }));
        // If they prefetch the next page, we can also update hasMore
        if (page === matchesPage + 1) {
          setHasMoreMatches(result.hasMore);
        }
      } catch (err) {
        console.error("Failed to prefetch matches page:", page, err);
      } finally {
        prefetchingPagesRef.current.delete(page);
      }
    },
    [matchesCache, matchesPage]
  );

  // Background hover prefetching for keywords
  const prefetchKeywords = useCallback(async () => {
    if (keywords !== null || isKeywordsLoading || prefetchingKeywordsRef.current) {
      return;
    }

    prefetchingKeywordsRef.current = true;
    try {
      const result = await getKeywords();
      setKeywords(result);
    } catch (err) {
      console.error("Failed to prefetch keywords:", err);
    } finally {
      prefetchingKeywordsRef.current = false;
    }
  }, [keywords, isKeywordsLoading]);

  // Combined delete keyword action
  const deleteKeyword = useCallback(async (keywordId: number) => {
    const res = await deleteKeywordAction(keywordId);
    if (!res?.error) {
      // Update local state instantly!
      setKeywords((prev) => (prev ? prev.filter((k) => k.id !== keywordId) : null));

      // Optimistically update stats
      setStats((prev) =>
        prev
          ? {
              ...prev,
              keywordCount: Math.max(0, prev.keywordCount - 1),
            }
          : null
      );

      // Invalidate matches cache since changing trackers changes leads
      setMatchesCache({});
      setHasMoreMatches(true);
      setMatchesPage(1);
    }
    return res;
  }, []);

  const refreshKeywords = useCallback(() => {
    fetchKeywords(true);
  }, [fetchKeywords]);

  const refreshStats = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  const refreshMatches = useCallback(() => {
    setMatchesCache({});
    fetchMatches(1, true);
  }, [fetchMatches]);

  return (
    <DashboardContext.Provider
      value={{
        matchesCache,
        keywords,
        stats,
        matchesPage,
        hasMoreMatches,
        isMatchesLoading,
        isKeywordsLoading,
        isStatsLoading,
        tier: initialTier,
        userEmail: initialUserEmail,
        fetchMatches,
        fetchKeywords,
        fetchStats,
        prefetchMatches,
        prefetchKeywords,
        deleteKeyword,
        refreshKeywords,
        refreshStats,
        refreshMatches,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
