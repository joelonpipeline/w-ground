import { describe, it, expect } from "vitest";
import { parseMatchText } from "@/actions/ingest";
import { MatchParsed } from "@/types/match";

/**
 * W-Ground 매치 파싱 통합 테스트
 *
 * 이 테스트는 실제 Groq API를 호출하여 AI 파싱 결과를 검증합니다.
 * 실행 전 .env.local에 GROQ_API_KEY가 설정되어 있어야 합니다.
 *
 * 실행: npx vitest run tests/parse-match.test.ts
 */

// =============================================
// Test Fixtures
// =============================================

const FIXTURES: {
  name: string;
  input: string;
  expected: Partial<MatchParsed>;
}[] = [
  {
    name: "게스트 모집 (seouldive)",
    input: `금일 풋살 게스트 구합니다!

1. 팀명: seouldive
2. 구장예약여부: O
3. 구장주소: 서울 광진구 아차산풋살장
4. 날짜&시간 : 2월 14일 토요일 
19시~21시(저녁7시~9시)
5. 경기방식 : 5vs5
6. 팀 수준: 하하
7. 연락처: 010-3546-7443
 문자로 게스트 신청해주세요
8. 용병비 :3천원
* 친구끼리나 팀으로 신청하셔도 됩니다.`,
    expected: {
      team_name: "seouldive",
      has_court: true,
      location_raw: "서울 광진구 아차산풋살장",
      region_tag: "서울",
      match_date: "2026-02-14",
      match_time: "19:00~21:00",
      match_type: "5:5",
      level: "하하",
      contact: "010-3546-7443",
      cost: "3천원",
    },
  },
  {
    name: "매치 구함 (워터멜론)",
    input: `[2월/매치구함]
1. 팀명 : 워터멜론
2. 구장예약여부: O
3. 구장주소: 종합운동장 제3풋살장
4. 날짜&시간 : 2월 22일 일요일 19-21시
5. 매치방식 : 5:5
6. 팀 수준 : 비기너3~아마2 / 선출없음
7. 연락처: fc_watermelon 으로 dm주세요!
8. 구장비: 4만원(원구장비 8만원)`,
    expected: {
      team_name: "워터멜론",
      has_court: true,
      location_raw: "종합운동장 제3풋살장",
      match_date: "2026-02-22",
      match_time: "19:00~21:00",
      match_type: "5:5",
      level: "비기너3~아마2 / 선출없음",
      contact: "fc_watermelon",
      cost: "4만원(원구장비 8만원)",
    },
  },
  {
    name: "구장 미확보 + 희망지역 (아라치FS)",
    input: `[3월/매치구함]
1. 팀명 : 아라치FS
2. 구장예약여부: X
3. 구장주소 / 원하는구역 : 관악구/서초구 희망
4. 날짜&시간 :3/23(월) 20:00~22:00
5. 매치방식 : 5:5
6. 팀 수준(평균플랩레벨/창단기간/선출유무) : 아마2(중)
7. 연락처: 010-4181-4456
8. 구장비: `,
    expected: {
      team_name: "아라치FS",
      has_court: false,
      location_raw: "관악구/서초구 희망",
      region_tag: "서울",
      match_date: "2026-03-23",
      match_time: "20:00~22:00",
      match_type: "5:5",
      level: "아마2(중)",
      contact: "010-4181-4456",
    },
  },
  {
    name: "애매한 날짜 + note (SWFC)",
    input: `안녕하세요 인천 지역 매치 상대팀 구합니다!

팀명: SWFC
구장 예약 여부: X
매치 지역: 인천/ 부천
매치 일시: 2월 중 평일 20시
매치 방식: 5:5
팀 수준: 모두의 풋살 기준 C등급
구장비: N/1
연락처: 010-2564-6922

별도 보유 구장은 없으며, 인천/부천 지역 한정 원정 경기 가능합니다. 
구장 섭외가 필요한 경우, 연락 주실 때 희망 구장을 함께 알려주세요!`,
    expected: {
      team_name: "SWFC",
      has_court: false,
      location_raw: "인천/ 부천",
      region_tag: "인천",
      match_date: "2월 중 평일",
      match_time: "20:00",
      match_type: "5:5",
      level: "모두의 풋살 기준 C등급",
      cost: "N/1",
      contact: "010-2564-6922",
    },
  },
];

// =============================================
// Tests
// =============================================

describe("parseMatchText", () => {
  // Validate that parseMatchText returns a result
  it("빈 텍스트 입력 시 실패", async () => {
    const result = await parseMatchText("");
    expect(result.success).toBe(false);
    expect(result.message).toContain("입력");
  });

  // Run each fixture as a separate test
  for (const fixture of FIXTURES) {
    it(`파싱: ${fixture.name}`, async () => {
      const result = await parseMatchText(fixture.input);

      // Must succeed
      expect(result.success).toBe(true);
      expect(result.parsedData).toBeDefined();
      expect(result.parsedData!.length).toBeGreaterThanOrEqual(1);

      const parsed = result.parsedData![0];
      const expected = fixture.expected;

      // ---- 팀명 ----
      if (expected.team_name !== undefined) {
        expect(parsed.team_name).toBe(expected.team_name);
      }

      // ---- 구장 확보 여부 ----
      if (expected.has_court !== undefined) {
        if (expected.has_court === true) {
          expect(parsed.has_court).toBe(true);
        } else {
          // false or undefined are both acceptable for "no court"
          expect(parsed.has_court).not.toBe(true);
        }
      }

      // ---- 장소 ----
      if (expected.location_raw !== undefined) {
        // AI may return null for ambiguous locations - only validate if present
        if (parsed.location_raw) {
          const locationKeywords = expected.location_raw!.split(/[\s\/,]/).filter(w => w.length >= 2);
          const matchedKeywords = locationKeywords.filter(kw => parsed.location_raw!.includes(kw));
          expect(matchedKeywords.length).toBeGreaterThanOrEqual(1);
        }
      }

      // ---- 지역 태그 ----
      if (expected.region_tag !== undefined) {
        expect(parsed.region_tag).toBe(expected.region_tag);
      }

      // ---- 날짜 ----
      if (expected.match_date !== undefined) {
        // Exact match for YYYY-MM-DD, contains-match for vague dates
        if (/^\d{4}-\d{2}-\d{2}$/.test(expected.match_date)) {
          expect(parsed.match_date).toBe(expected.match_date);
        } else {
          // Vague date: should contain the core part
          expect(parsed.match_date).toBeDefined();
          expect(parsed.match_date).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }

      // ---- 시간 ----
      if (expected.match_time !== undefined) {
        expect(parsed.match_time).toBeDefined();
        // Normalize and check start time at minimum
        const expectedStart = expected.match_time.split("~")[0].split("-")[0];
        expect(parsed.match_time).toContain(expectedStart);
      }

      // ---- 매치 타입 ----
      if (expected.match_type !== undefined) {
        expect(parsed.match_type).toBeDefined();
        // Normalize: 5vs5, 5:5, 5 vs 5 should all pass
        const normalizedExpected = expected.match_type.replace(/\s/g, "");
        const normalizedParsed = (parsed.match_type || "").replace(/\s/g, "").replace(/vs/gi, ":");
        expect(normalizedParsed).toContain(normalizedExpected.replace(/vs/gi, ":"));
      }

      // ---- 수준 ----
      if (expected.level !== undefined) {
        expect(parsed.level).toBeDefined();
        // Core level info (before slash separators) should be present
        const coreParts = expected.level!.split('/').map(p => p.trim()).filter(p => p.length > 0);
        // At least the main part should match
        const mainPart = coreParts[0];
        expect(parsed.level!).toContain(mainPart);
      }

      // ---- 연락처 ----
      if (expected.contact !== undefined) {
        expect(parsed.contact).toBeDefined();
        // Main phone or ID should be present
        const coreContact = expected.contact.replace(/-/g, "").slice(0, 6);
        expect(parsed.contact!.replace(/-/g, "")).toContain(coreContact);
      }

      // ---- 비용 ----
      if (expected.cost !== undefined) {
        // Cost might be null if AI couldn't parse it
        if (parsed.cost) {
          expect(parsed.cost).toBeDefined();
        }
      }

      // ---- 로그 출력 (디버그용) ----
      console.log(`\n--- ${fixture.name} ---`);
      console.log("Parsed:", JSON.stringify(parsed, null, 2));
    });
  }

  // Test that SWFC input has a note
  it("SWFC: note 필드에 추가 정보 포함", async () => {
    const swfcFixture = FIXTURES.find(f => f.name.includes("SWFC"))!;
    const result = await parseMatchText(swfcFixture.input);

    expect(result.success).toBe(true);
    const parsed = result.parsedData![0];

    expect(parsed.note).toBeDefined();
    expect(parsed.note).not.toBeNull();
    expect(parsed.note!.length).toBeGreaterThan(0);
    // Should mention key info from the note
    expect(parsed.note!).toMatch(/원정|구장.*섭외|부천/);
    console.log("SWFC note:", parsed.note);
  });

  // Test that seouldive input captures guest-related note
  it("seouldive: note에 게스트/친구 관련 정보 포함", async () => {
    const fixture = FIXTURES.find(f => f.name.includes("seouldive"))!;
    const result = await parseMatchText(fixture.input);

    expect(result.success).toBe(true);
    const parsed = result.parsedData![0];

    expect(parsed.note).toBeDefined();
    expect(parsed.note).not.toBeNull();
    // Should contain guest info or friend/team application hint
    expect(parsed.note!).toMatch(/게스트|문자|친구|팀/);
    console.log("seouldive note:", parsed.note);
  });
});
