"use server";

import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";
import { MatchParsed, MatchInsert } from "@/types/match";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `당신은 여성 풋살 카카오톡 오픈채팅방의 매칭 공고 텍스트를 분석하는 AI입니다.
입력된 텍스트에서 풋살 매칭 정보를 추출하여 지정된 JSON 스키마로 반환하세요.

하나의 텍스트에 여러 매칭 공고가 포함될 수 있습니다. 각각을 별도 객체로 분리해주세요.

반드시 아래 JSON 스키마의 배열로 반환하세요. JSON 외의 텍스트는 포함하지 마세요.

[
  {
    "team_name": "팀명 (string, 없으면 null)",
    "has_court": "구장 예약 여부 (boolean). 반드시 true 또는 false 중 하나. O/예/완료 → true, X/아니오/미정/없음 → false. 절대 null이나 undefined 불가",
    "location_raw": "원본 장소 정보 (string, 없으면 null)",
    "region_tag": "지역 태그 - 반드시 다음 중 하나: 서울/인천/경기/부산/대구/대전/광주/울산/세종/강원/충북/충남/전북/전남/경북/경남/제주 (string, 판단 불가 시 null)",
    "match_date": "경기 일자 (string, 아래 규칙 참조)",
    "match_time": "경기 시간 (string, 예: '20:00~22:00' 또는 '20:00', 없으면 null)",
    "match_type": "매치 형태 (string). 반드시 'N:N' 형식으로 통일 (예: '5vs5' → '5:5', '6대6' → '6:6'). 없으면 null",
    "level": "팀 수준 - 원문의 모든 정보를 그대로 포함 (string). 기준 체계, 선출 유무, 창단 기간 등 전부 포함. 없으면 null",
    "contact": "연락처 또는 SNS ID (string, 없으면 null)",
    "cost": "비용 정보 (string, 없으면 null). 원문 그대로 보존",
    "note": "위 필드에 포함되지 않는 추가 정보 (string). 게스트 신청 방법, 원정 가능 여부, 구장 섭외 요청, 특별 조건 등. 없으면 null"
  }
]

=== match_date 파싱 규칙 (매우 중요) ===
특정 월/일이 명시된 경우 → 반드시 YYYY-MM-DD 형식:
- "2월 14일" → "${new Date().getFullYear()}-02-14"
- "2월 22일 일요일" → "${new Date().getFullYear()}-02-22"
- "3/23(월)" → "${new Date().getFullYear()}-03-23"
- "3월 16일" → "${new Date().getFullYear()}-03-16"
- 연도가 없으면 현재 연도 ${new Date().getFullYear()} 사용

범위/조건만 있는 경우 → 원문 그대로:
- "2월 중 평일" → "2월 중 평일"
- "이번주 토요일" → "이번주 토요일"
- "협의 가능" → "협의 가능"

날짜와 시간이 합쳐져 있으면 → 분리:
- "2월 14일 19시~21시" → match_date: "${new Date().getFullYear()}-02-14", match_time: "19:00~21:00"
- "2월 중 평일 20시" → match_date: "2월 중 평일", match_time: "20:00"

=== 지역 판단 기준 ===
- 서초구, 강남구, 마포구, 종로구, 광진구, 관악구 등 서울 내 구 → "서울"
- 수원, 성남, 고양, 용인 등 경기도 시 → "경기"
- 인천시, 부평구 등 → "인천"
- 부천시 → "경기" (경기도 소속)
- 해당 지역명이 없으면 null

=== 팀 수준 파싱 규칙 ===
- "모두의 풋살 기준 C등급" → level: "모두의 풋살 기준 C등급"
- "비기너3~아마2 / 선출없음" → level: "비기너3~아마2 / 선출없음"
- "아마2(중)" → level: "아마2(중)"
- "하하" → level: "하하"
- 기준 체계, 선출 유무, 기타 부가 정보 반드시 원문 그대로 포함

=== match_type 통일 ===
- "5vs5" → "5:5"
- "5 vs 5" → "5:5"
- "5대5" → "5:5"

=== has_court 주의 ===
- 반드시 boolean (true/false). null 불가
- 구장예약여부가 O → true, X나 미정이나 언급없음 → false`;

// =============================================
// Step 1: Parse only (no DB save)
// =============================================
export interface ParseResult {
  success: boolean;
  message: string;
  parsedData?: MatchParsed[];
}

export async function parseMatchText(rawText: string): Promise<ParseResult> {
  if (!rawText.trim()) {
    return { success: false, message: "텍스트를 입력해주세요." };
  }

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key") {
    return {
      success: false,
      message: "GROQ_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.",
    };
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `다음 카카오톡 메시지에서 풋살 매칭 정보를 추출해주세요:\n\n${rawText}`,
        },
      ],
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.1,
      max_tokens: 4096,
    });

    const responseText = chatCompletion.choices[0]?.message?.content;
    if (!responseText) {
      return { success: false, message: "AI로부터 응답을 받지 못했습니다." };
    }

    let parsedMatches: MatchParsed[];
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      const parsed = JSON.parse(jsonStr);
      parsedMatches = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return {
        success: false,
        message: `AI 응답을 JSON으로 파싱하는데 실패했습니다.\n\n응답 원본:\n${responseText}`,
      };
    }

    return {
      success: true,
      message: `${parsedMatches.length}개의 매칭 정보가 파싱되었습니다. 확인 후 저장해주세요.`,
      parsedData: parsedMatches,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return { success: false, message: `처리 중 오류 발생: ${errorMessage}` };
  }
}

// =============================================
// Step 2: Save confirmed data to DB
// =============================================
export interface SaveResult {
  success: boolean;
  message: string;
}

export async function saveMatchData(
  matches: MatchParsed[],
  originalText: string,
  password: string
): Promise<SaveResult> {
  if (!password || password.length === 0) {
    return { success: false, message: "비밀번호를 입력해주세요." };
  }

  const matchesToInsert: MatchInsert[] = matches.map((match) => ({
    ...match,
    original_text: originalText,
    password,
  }));

  const { error } = await supabase.from("w_matches").insert(matchesToInsert);

  if (error) {
    return { success: false, message: `데이터베이스 저장 실패: ${error.message}` };
  }

  return {
    success: true,
    message: `${matches.length}개의 매칭 정보가 성공적으로 등록되었습니다.`,
  };
}

// =============================================
// Delete match (with password verification)
// =============================================
export async function deleteMatch(
  matchId: string,
  password: string
): Promise<SaveResult> {
  const { data, error: fetchError } = await supabase
    .from("w_matches")
    .select("password")
    .eq("id", matchId)
    .single();

  if (fetchError || !data) {
    return { success: false, message: "매치를 찾을 수 없습니다." };
  }

  if (data.password !== password) {
    return { success: false, message: "비밀번호가 일치하지 않습니다." };
  }

  const { error } = await supabase.from("w_matches").delete().eq("id", matchId);

  if (error) {
    return { success: false, message: `삭제 실패: ${error.message}` };
  }

  return { success: true, message: "매치가 삭제되었습니다." };
}
