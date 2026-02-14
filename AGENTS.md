# AGENTS.md — W-Ground 프로젝트 AI 에이전트 가이드

> **⚠️ 이 파일은 AI 에이전트가 작업 시작 전에 반드시 읽고, 작업 종료 후 업데이트해야 합니다.**

---

## 프로젝트 개요

**W-Ground (더블유그라운드)** — 카카오톡 오픈채팅방의 여성 풋살 매칭 정보를 AI로 파싱하여 구조화된 검색을 제공하는 웹 서비스

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14+ (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4, shadcn/ui |
| DB | Supabase (PostgreSQL) |
| AI | Groq API (Llama 4 Maverick) |
| 패키지 매니저 | npm |

## 핵심 규칙

### 1. 테이블 네이밍 규칙
- **모든 Supabase 테이블은 반드시 `w_` prefix**를 붙여야 합니다
- 예시: `w_matches`, `w_users`, `w_teams` 등
- SQL 파일, `.from("w_xxx")` 호출 모두 동일하게 적용

### 2. 프로젝트 구조

```
w-ground/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 랜딩 페이지
│   │   ├── layout.tsx            # 루트 레이아웃 (다크모드)
│   │   ├── error.tsx             # 글로벌 에러 바운더리
│   │   ├── matches/
│   │   │   ├── page.tsx          # 매치 리스트 (필터링)
│   │   │   └── error.tsx         # 매치 에러 바운더리
│   │   └── admin/
│   │       └── ingest/
│   │           └── page.tsx      # 매치 등록 (3-step flow)
│   ├── actions/
│   │   └── ingest.ts             # 서버 액션 (파싱/저장/삭제)
│   ├── components/
│   │   ├── navbar.tsx            # 상단 네비게이션
│   │   ├── match-card.tsx        # 매치 카드 (펼침 노트)
│   │   ├── match-filters.tsx     # 필터 UI
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── supabase.ts           # Supabase 클라이언트
│   │   └── utils.ts              # 유틸리티
│   └── types/
│       └── match.ts              # 타입 정의
├── tests/
│   ├── setup.ts                  # dotenv 로드
│   └── parse-match.test.ts       # AI 파싱 통합 테스트 (4개 fixture)
├── vitest.config.ts              # Vitest 설정
├── .env.local                    # 환경 변수
└── AGENTS.md                     # 이 파일
```

### 3. DB 스키마 (`w_matches`)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| team_name | TEXT | 팀명 |
| has_court | BOOLEAN | 구장 확보 여부 |
| location_raw | TEXT | 원본 장소 |
| region_tag | TEXT | 지역 태그 (서울/경기/인천 등) |
| match_date | TEXT | 날짜 (YYYY-MM-DD 또는 "2월 중 평일" 등 자유 형식) |
| match_time | TEXT | 시간 (예: 20:00~22:00) |
| match_type | TEXT | 매치 형태 (예: 5:5) |
| level | TEXT | 수준 (기준 포함, 예: "모두의 풋살 기준 C등급") |
| contact | TEXT | 연락처 |
| cost | TEXT | 비용 |
| note | TEXT | 추가 정보 (원정 가능 여부 등) |
| original_text | TEXT (NOT NULL) | 원본 카톡 텍스트 |
| password | TEXT (NOT NULL) | 수정/삭제용 비밀번호 (숫자) |
| created_at | TIMESTAMPTZ | 생성일시 |

### 4. 주요 기능 Flow

#### 매치 등록 (3-step)
1. **Step ①** 카톡 텍스트 입력 + 숫자 비밀번호 입력
2. **Step ②** AI 파싱 결과 미리보기 → "이대로 등록" 또는 "다시 입력"
3. **Step ③** 등록 완료 → 추가 등록 또는 매치 목록 이동

#### 매치 삭제
- 비밀번호 검증 후 삭제 (`deleteMatch` 서버 액션)

#### AI 파싱 규칙
- 특정 월/일 → YYYY-MM-DD 형식 (예: "2월 14일" → "2026-02-14")
- 애매한 날짜 → 원문 그대로 보존 (예: "2월 중 평일")
- 팀 수준 → 기준 체계 + 선출 유무 포함 (예: "비기너3~아마2 / 선출없음")
- 매치 타입 → N:N 형식 통일 (예: "5vs5" → "5:5")
- has_court → 반드시 boolean (true/false)
- 추가 정보 → `note` 필드로 자동 추출

### 5. 테스트
```bash
npm test              # 전체 테스트 실행
npm run test:watch    # 개발 모드 (파일 변경 시 자동 재실행)
```
- Vitest 사용
- `tests/parse-match.test.ts`: 4개 카톡 메시지 fixture로 AI 파싱 통합 테스트
- 실제 Groq API 호출 (`.env.local` 필요)

### 6. 환경 변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

---

## 작업 히스토리

### 2026-02-13: 초기 구축
- [x] Next.js 14+ 프로젝트 초기화 (App Router, TypeScript, Tailwind CSS)
- [x] shadcn/ui 설정 및 컴포넌트 설치
- [x] Supabase 클라이언트 설정 (빌드 타임 placeholder 처리)
- [x] `w_matches` 테이블 스키마 설계 (password, note 컬럼 포함)
- [x] Groq AI 파싱 서버 액션 구현 (`parseMatchText`, `saveMatchData`, `deleteMatch`)
- [x] 매치 등록 3-step flow UI 구현
- [x] 매치 리스트 페이지 (지역/구장/날짜 필터)
- [x] 매치 카드 컴포넌트 (펼침/접기 노트)
- [x] 랜딩 페이지 (모바일 최적화, AI 멘션 제거)
- [x] 에러 바운더리 (글로벌 + 매치 페이지)
- [x] 네비게이션 바 (글라스모피즘)
- [x] "데이터 등록" → "매치 등록" 전체 리네이밍
- [x] 테이블 네이밍 w_ prefix 적용

### 2026-02-14: AI 파싱 품질 개선 + 테스트
- [x] Vitest 설치 및 테스트 환경 구성
- [x] 4개 카톡 메시지 fixture로 통합 테스트 작성
- [x] AI 프롬프트 대폭 개선 (날짜/수준/매치타입/has_court 규칙 강화)
- [x] note 필드 추가 (DB/타입/프롬프트/UI)
- [x] 매치 카드에 펼침/접기 note UI 구현
- [x] match_date: DATE → TEXT 변경 (애매한 날짜 지원)
- [x] 7/7 테스트 통과 확인

---

## AI 에이전트 작업 지침

1. **작업 시작 시**: 이 파일을 먼저 읽고 프로젝트 컨텍스트를 파악
2. **테이블 생성 시**: 반드시 `w_` prefix 적용
3. **작업 완료 시**: 이 파일의 "작업 히스토리" 섹션에 날짜와 함께 변경 사항 추가
4. **새 파일 추가 시**: "프로젝트 구조" 섹션 업데이트
5. **DB 스키마 변경 시**: "DB 스키마" 섹션 업데이트
6. **AI 프롬프트 변경 시**: "AI 파싱 규칙" 섹션 업데이트
7. **테스트 추가/변경 시**: `npm test`로 통과 확인 후 커밋
