
export type Role = 'HOD' | 'Admin' | 'Staff' | 'Student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  year: string;
  subject: string;
}

export interface Student {
  id: number;
  name: string;
  email?: string;
  rollNo: string;
  year?: string;
  internal1: number; // Kept for HOD Dashboard (Average)
  internal2: number; // Kept for HOD Dashboard (Average)
  attendance: number;
  cgpa?: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  year: string;
  staffId: number;
  staffName: string;
  totalStudents: number;
  lastUpdated: string;
}

export interface StudentSubjectMark {
  studentId: number;
  studentName: string;
  rollNo: string;
  subjectId: number;
  subjectName: string;
  test1: number;
  test2: number;
  assignment: number;
  total: number;
  maxTotal: number;
}

export interface Certificate {
  id: number;
  studentName: string;
  type: string;
  company: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  uploadDate: string;
}

export interface LeaveApplication {
  id: number;
  studentId: number;
  studentName: string;
  rollNo: string;
  leaveDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

export interface YearlyStats {
  totalStudents: number;
  internal1: { pass: number; fail: number };
  internal2: { pass: number; fail: number };
  attendance: { above75: number; below75: number };
  cgpa: { aPlus: number; a: number; bPlus: number; b: number; c: number; f: number };
  internship?: { completed: number; inProgress: number; notStarted: number };
  placement?: { placed: number; notPlaced: number; higherStudies: number };
}

// Achievement System Types

export interface AchievementCategory {
  id: number;
  category_name: string;
  points: number;
  description: string;
}

export interface Achievement {
  id: number;
  student_id: number;
  student_name?: string;
  roll_no?: string;
  student_year?: string;
  category_id: number;
  category_name?: string;
  title: string;
  description: string;
  proof_file: string;
  achievement_date: string;
  points_awarded: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  student_name: string;
  roll_no: string;
  total_points: number;
  year_level: string;
}