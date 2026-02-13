export interface Match {
  id: string;
  team_name: string | null;
  has_court: boolean;
  location_raw: string | null;
  region_tag: string | null;
  match_date: string | null;
  match_time: string | null;
  match_type: string | null;
  level: string | null;
  contact: string | null;
  cost: string | null;
  note: string | null;
  original_text: string;
  password?: string;
  created_at: string;
}

export interface MatchParsed {
  team_name?: string | null;
  has_court?: boolean;
  location_raw?: string | null;
  region_tag?: string | null;
  match_date?: string | null;
  match_time?: string | null;
  match_type?: string | null;
  level?: string | null;
  contact?: string | null;
  cost?: string | null;
  note?: string | null;
}

export interface MatchInsert extends MatchParsed {
  original_text: string;
  password: string;
}

export interface MatchFilters {
  regions?: string[];
  hasCourt?: boolean;
  date?: string;
}

export const REGION_OPTIONS = [
  "서울",
  "인천",
  "경기",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;
