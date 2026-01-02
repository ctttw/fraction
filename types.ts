export interface SchoolData {
  id: number;
  school: string;
  department: string;
  score: number; // 積分
  points: string; // 積點 (Stored as string because of '未知')
  region: 'Taichung' | 'Nantou'; // Derived from name usually
}

export type SortField = 'school' | 'score' | 'points';
export type SortOrder = 'asc' | 'desc';