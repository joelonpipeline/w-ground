import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Match, MatchFilters as MatchFiltersType } from "@/types/match";
import { MatchCard } from "@/components/match-card";
import { MatchFilters } from "@/components/match-filters";

interface PageProps {
  searchParams: Promise<{
    region?: string | string[];
    hasCourt?: string;
    date?: string;
  }>;
}

async function fetchMatches(filters: MatchFiltersType): Promise<Match[]> {
  let query = supabase
    .from("w_matches")
    .select("*")
    .order("match_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters.regions && filters.regions.length > 0) {
    query = query.in("region_tag", filters.regions);
  }

  if (filters.hasCourt) {
    query = query.eq("has_court", true);
  }

  if (filters.date) {
    query = query.eq("match_date", filters.date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching matches:", error);
    return [];
  }

  return (data as Match[]) || [];
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const regions = params.region
    ? Array.isArray(params.region)
      ? params.region
      : [params.region]
    : [];
  const hasCourt = params.hasCourt === "true";
  const date = params.date;

  const matches = await fetchMatches({ regions, hasCourt, date });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">⚽ 매칭 리스트</h1>
          <p className="mt-1 text-muted-foreground">
            원하는 조건의 풋살 매치를 찾아보세요
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted" />}>
          <MatchFilters />
        </Suspense>

        {/* Results Count */}
        <div className="my-4 text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{matches.length}</span>개의 매치
        </div>

        {/* Match Cards */}
        {matches.length > 0 ? (
          <div className="grid gap-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-4 text-lg font-semibold">매칭 정보가 없습니다</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              필터를 변경하거나 관리자에게 데이터를 등록해주세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
