"use client";

import { useState } from "react";
import { Match } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const [noteOpen, setNoteOpen] = useState(false);

  // Try to format as a nice date if it's YYYY-MM-DD, otherwise show as-is
  const formattedDate = (() => {
    if (!match.match_date) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(match.match_date)) {
      return new Date(match.match_date + "T00:00:00").toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      });
    }
    return match.match_date;
  })();

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary/80 to-primary/20" />

      <CardHeader className="pb-3 pl-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">
              {match.team_name || "팀명 미정"}
            </h3>
            {match.location_raw && (
              <p className="text-sm text-muted-foreground">
                📍 {match.location_raw}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {match.region_tag && (
              <Badge variant="secondary" className="text-xs">
                {match.region_tag}
              </Badge>
            )}
            {match.has_court ? (
              <Badge className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 text-xs">
                구장 확보 ✓
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                구장 미정
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pl-5 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-base">📅</span>
              <span>{formattedDate}</span>
            </div>
          )}
          {match.match_time && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-base">⏰</span>
              <span>{match.match_time}</span>
            </div>
          )}
          {match.level && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2 sm:col-span-1">
              <span className="text-base">📊</span>
              <span>{match.level}</span>
            </div>
          )}
          {match.match_type && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-base">⚽</span>
              <span>{match.match_type}</span>
            </div>
          )}
          {match.cost && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-base">💰</span>
              <span>{match.cost}</span>
            </div>
          )}
          {match.contact && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-base">📞</span>
              <span>{match.contact}</span>
            </div>
          )}
        </div>

        {/* Collapsible Note */}
        {match.note && (
          <div className="border-t border-border/30 pt-2">
            <button
              onClick={() => setNoteOpen(!noteOpen)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left cursor-pointer"
            >
              <span
                className="transition-transform duration-200 inline-block"
                style={{ transform: noteOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                ▶
              </span>
              <span>📝 추가 정보</span>
            </button>
            {noteOpen && (
              <div className="mt-2 rounded-md bg-muted/30 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {match.note}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
