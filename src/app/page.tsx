import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <div className="relative mx-auto w-full max-w-lg text-center">
        {/* Glow effect */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative">
          <span className="text-5xl">⚽</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              W-Ground
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">더블유그라운드</p>

          <p className="mx-auto mt-5 max-w-sm text-sm sm:text-base text-muted-foreground leading-relaxed">
            흩어진 여성 풋살 매칭 공고를 한 곳에서.
            <br />
            <span className="font-medium text-foreground">
              지역, 날짜, 구장
            </span>
            으로 원하는 매치를 바로 찾으세요.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-3">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 px-8"
              asChild
            >
              <Link href="/matches">매치 찾기 →</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/admin/ingest">매치 등록</Link>
            </Button>
          </div>

          {/* Feature pills */}
          <div className="mt-8 grid grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-2">
              <span>🗺️</span> 지역별 필터
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-2">
              <span>📅</span> 날짜별 검색
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-2">
              <span>🏟️</span> 구장 확보 확인
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-2">
              <span>⚡</span> 빠른 검색
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
