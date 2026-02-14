"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseMatchText, saveMatchData, ParseResult } from "@/actions/ingest";
import { MatchParsed } from "@/types/match";

const SAMPLE_TEXT = `[3월/매치구함]
1. 팀명 : 더블유FC
2. 구장예약여부: O
3. 구장주소 : 서초구
4. 날짜&시간 : 3/16(월) 20:00~22:00
5. 팀 수준 : 아마2(중)
6. 연락처: 010-1234-5678`;

type Step = "input" | "preview" | "done";

export default function AdminIngestPage() {
  const [rawText, setRawText] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Parse with AI
  const handleParse = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await parseMatchText(rawText);
      setParseResult(res);
      if (res.success && res.parsedData) {
        setStep("preview");
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm & Save
  const handleSave = async () => {
    if (!parseResult?.parsedData) return;
    if (!password.trim()) {
      setErrorMessage("비밀번호를 입력해주세요. (숫자)");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await saveMatchData(parseResult.parsedData, rawText, password);
      if (res.success) {
        setStep("done");
        setSuccessMessage(res.message);
        setRawText("");
        setPassword("");
        setParseResult(null);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setParseResult(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleUseSample = () => {
    setRawText(SAMPLE_TEXT);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 text-xs tracking-wider uppercase">
            Admin
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">매치 등록</h1>
          <p className="mt-2 text-muted-foreground">
            카카오톡 매칭 공고 텍스트를 붙여넣으면 자동으로 AI가 분류합니다.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step === "input" ? "font-semibold text-foreground" : ""}>
            ① 텍스트 입력
          </span>
          <span>→</span>
          <span className={step === "preview" ? "font-semibold text-foreground" : ""}>
            ② 파싱 확인
          </span>
          <span>→</span>
          <span className={step === "done" ? "font-semibold text-foreground" : ""}>
            ③ 등록 완료
          </span>
        </div>

        {/* ====== STEP 1: Input ====== */}
        {step === "input" && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">카톡 메시지 입력</CardTitle>
                  <CardDescription>
                    매칭 공고 텍스트를 그대로 붙여넣어주세요.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleUseSample}>
                  샘플 입력
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`예시:\n[3월/매치구함]\n1. 팀명 : 아라치FS\n2. 구장예약여부: O\n3. 구장주소 : 서초구 우면동\n...`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={10}
                className="resize-none font-mono text-sm"
              />

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  🔒 비밀번호 (숫자)
                </Label>
                <Input
                  id="password"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="매치 수정/삭제 시 필요한 숫자 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  등록한 매치를 수정하거나 삭제할 때 이 비밀번호가 필요합니다.
                </p>
              </div>

              <Button
                onClick={handleParse}
                disabled={isLoading || !rawText.trim() || !password.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    파싱 중...
                  </span>
                ) : (
                  "📋 매치 정보 파싱하기"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ====== STEP 2: Preview & Confirm ====== */}
        {step === "preview" && parseResult?.parsedData && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">📋 파싱 결과 확인</CardTitle>
              <CardDescription>
                아래 내용이 맞는지 확인 후 저장해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {parseResult.parsedData.map((match: MatchParsed, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border/50 bg-background/50 p-4 text-sm"
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {match.team_name && (
                        <Badge variant="default">{match.team_name}</Badge>
                      )}
                      {match.region_tag && (
                        <Badge variant="secondary">{match.region_tag}</Badge>
                      )}
                      {match.has_court && (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-600">
                          구장 확보
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      {match.location_raw && <p>📍 {match.location_raw}</p>}
                      {match.match_date && <p>📅 {match.match_date}</p>}
                      {match.match_time && <p>⏰ {match.match_time}</p>}
                      {match.level && <p className="col-span-2 sm:col-span-1">📊 {match.level}</p>}
                      {match.match_type && <p>⚽ {match.match_type}</p>}
                      {match.contact && <p>📞 {match.contact}</p>}
                      {match.cost && <p>💰 {match.cost}</p>}
                    </div>
                    {match.note && (
                      <div className="mt-2 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground whitespace-pre-wrap">
                        📝 {match.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
                  size="lg"
                >
                  {isSaving ? "저장 중..." : "✅ 이대로 등록하기"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  disabled={isSaving}
                >
                  ← 다시 입력
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ====== STEP 3: Done ====== */}
        {step === "done" && successMessage && (
          <Card className="border-border/50 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                ✅ 등록 완료
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{successMessage}</p>
              <div className="flex gap-3">
                <Button onClick={handleReset} size="sm">
                  추가 등록
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/matches">매치 목록 보기</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Card className="mt-4 border-border/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive whitespace-pre-wrap">
                ❌ {errorMessage}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
