"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { REGION_OPTIONS } from "@/types/match";

export function MatchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeRegions = searchParams.getAll("region");
  const hasCourtParam = searchParams.get("hasCourt");
  const dateParam = searchParams.get("date");

  const [selectedRegions, setSelectedRegions] = useState<string[]>(activeRegions);
  const [hasCourt, setHasCourt] = useState(hasCourtParam === "true");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam + "T00:00:00") : undefined
  );

  const applyFilters = (
    regions: string[],
    court: boolean,
    date: Date | undefined
  ) => {
    const params = new URLSearchParams();
    regions.forEach((r) => params.append("region", r));
    if (court) params.set("hasCourt", "true");
    if (date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      params.set("date", `${yyyy}-${mm}-${dd}`);
    }
    router.push(`/matches?${params.toString()}`);
  };

  const toggleRegion = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    setSelectedRegions(newRegions);
    applyFilters(newRegions, hasCourt, selectedDate);
  };

  const toggleCourt = (checked: boolean) => {
    setHasCourt(checked);
    applyFilters(selectedRegions, checked, selectedDate);
  };

  const selectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    applyFilters(selectedRegions, hasCourt, date);
  };

  const clearAll = () => {
    setSelectedRegions([]);
    setHasCourt(false);
    setSelectedDate(undefined);
    router.push("/matches");
  };

  const hasActiveFilters = selectedRegions.length > 0 || hasCourt || selectedDate;

  return (
    <div className="space-y-4 rounded-xl border border-border/40 bg-card/80 p-4 backdrop-blur-sm">
      {/* Region Filter */}
      <div>
        <Label className="mb-2 block text-sm font-medium text-muted-foreground">
          🗺️ 지역
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {REGION_OPTIONS.map((region) => (
            <Badge
              key={region}
              variant={selectedRegions.includes(region) ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:bg-primary/80 hover:text-primary-foreground"
              onClick={() => toggleRegion(region)}
            >
              {region}
            </Badge>
          ))}
        </div>
      </div>

      {/* Court Toggle & Date Picker Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Court Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="court-toggle"
            checked={hasCourt}
            onCheckedChange={toggleCourt}
          />
          <Label htmlFor="court-toggle" className="text-sm cursor-pointer">
            🏟️ 구장 확보만
          </Label>
        </div>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-left font-normal"
            >
              📅{" "}
              {selectedDate
                ? selectedDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "날짜 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={selectDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕ 필터 초기화
          </Button>
        )}
      </div>
    </div>
  );
}
