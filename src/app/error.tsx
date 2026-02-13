"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <span className="text-4xl">⚠️</span>
      <h2 className="mt-4 text-xl font-semibold">오류가 발생했습니다</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {error.message || "페이지를 불러오는 중 문제가 발생했습니다."}
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
