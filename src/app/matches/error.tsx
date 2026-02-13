"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MatchesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <span className="text-4xl">⚠️</span>
      <h2 className="mt-4 text-xl font-semibold">매치 정보를 불러올 수 없습니다</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        데이터베이스 연결을 확인해주세요. .env.local 파일에 Supabase 정보가 올바르게 설정되어 있는지 확인하세요.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          다시 시도
        </Button>
        <Button asChild size="sm">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </div>
  );
}
