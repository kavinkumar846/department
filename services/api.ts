
import { supabase } from '../lib/supabase';
import { User, Student, Certificate, YearlyStats, Role, Achievement, AchievementCategory, LeaderboardEntry, Subject, StudentSubjectMark } from '../types';
import { mockAchievements as initialMockAchievements, achievementCategories, mockLeaderboard, initialUsers, initialStudents, initialCertificates, mockSubjects, mockMarks } from './mockData';

// --- In-Memory State for Mock Session ---
let localUsers = [...initialUsers];
let localStudents = [...initialStudents];
let localCertificates = [...initialCertificates];
let localAchievements = [...initialMockAchievements];
let localSubjects = [...mockSubjects];
let localMarks = [...mockMarks];
let localSettings = {
  logoUrl: null as string | null,
  institutionName: 'Dr. N.G.P. INSTITUTE OF TECHNOLOGY'
};

// Listeners for settings changes
type SettingsListener = (settings: typeof localSettings) => void;
const settingsListeners: SettingsListener[] = [];

// Helper to force timeout on Supabase calls to ensure fallback works quickly
const withTimeout = (promise: Promise<any>, ms = 2000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);
};

export const api = {
  // Users
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await withTimeout(
          supabase.from('users').select('*').order('id', { ascending: true })
      );
      if (error) throw error;
      return data as User[];
    } catch (error) {
      console.warn('API: Using local mock users (Timeout or Error)');
      return localUsers;
    }
  },

  async createUser(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      // Try DB first
      const { data, error } = await withTimeout(
          supabase.from('users').insert([user]).select().single()
      );
      if (!error && data) return data as User;
      throw error;
    } catch (error) {
      // Fallback to local state
      const newUser = { ...user, id: Date.now() } as User;
      localUsers.push(newUser);
      return newUser;
    }
  },

  async deleteUser(id: number): Promise<boolean> {
    try {
      const { error } = await withTimeout(supabase.from('users').delete().eq('id', id));
      if (error) throw error;
      return true;
    } catch (error) {
      localUsers = localUsers.filter(u => u.id !== id);
      return true;
    }
  },
  
  async getUserRole(email: string): Promise<Role | null> {
    try {
      const { data, error } = await withTimeout(
          supabase.from('users').select('role').eq('email', email).maybeSingle()
      ); 
      if (!error && data) return data.role as Role;
    } catch (error) {
      // Fall through to local check
    }
    
    // Local fallback
    const localUser = localUsers.find(u => u.email === email);
    return localUser ? localUser.role : null;
  },

  // Students
  async getStudents(): Promise<Student[]> {
    try {
      const { data, error } = await withTimeout(
          supabase.from('students').select('*').order('id', { ascending: true })
      );
      if (error) throw error;
      return data.map((s: any) => ({
        ...s,
        rollNo: s.roll_no || s.rollNo || 'N/A', 
        internal1: s.internal1 || 0,
        internal2: s.internal2 || 0,
        attendance: s.attendance || 0,
        email: s.email
      })) as Student[];
    } catch (error) {
      return localStudents;
    }
  },

  async updateStudent(id: number, updates: Partial<Student>): Promise<boolean> {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.rollNo) { dbUpdates.roll_no = updates.rollNo; delete dbUpdates.rollNo; }
      
      const { error } = await withTimeout(supabase.from('students').update(dbUpdates).eq('id', id));
      if (error) throw error;
      return true;
    } catch (error) {
      localStudents = localStudents.map(s => s.id === id ? { ...s, ...updates } : s);
      return true;
    }
  },
  
  async getStudentProfile(email: string): Promise<any> {
     try {
       const { data, error } = await withTimeout(
           supabase.from('students').select('*').eq('email', email).maybeSingle()
       );
       if (data) return { ...data, rollNo: data.roll_no || data.rollNo };
     } catch (error) {
       // Fall through to local
     }

     // Fallback logic
     const student = localStudents.find(s => s.email === email) || localStudents.find(s => s.name.toLowerCase().includes('arun')); // Fallback for demo
     if (student) return student;

     const user = localUsers.find(u => u.email === email);
     if (user) {
        return {
           name: user.name,
           rollNo: 'N/A',
           year: user.year || '1',
           internal1: 0, internal2: 0, attendance: 0, cgpa: 0
        };
     }
     return null;
  },

  // Subjects & Marks APIs (New)

  async getSubjectsByYear(year: string): Promise<Subject[]> {
    return localSubjects.filter(s => s.year === year);
  },
  
  async createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    // Add random factor to prevent ID collision on fast creates
    const newSubject = { ...subject, id: Date.now() + Math.floor(Math.random() * 1000) };
    localSubjects.push(newSubject);
    return newSubject;
  },

  async deleteSubject(id: number): Promise<boolean> {
    // Use filter to strictly remove the item and update reference
    const initialLen = localSubjects.length;
    localSubjects = localSubjects.filter(s => s.id !== id);
    
    // Cleanup marks
    localMarks = localMarks.filter(m => m.subjectId !== id);
    
    return localSubjects.length < initialLen;
  },

  async getMarksForSubject(subjectId: number): Promise<StudentSubjectMark[]> {
    // Return existing marks, or generate placeholder marks for students in that year who don't have marks yet
    const subject = localSubjects.find(s => s.id === subjectId);
    if (!subject) return [];

    const studentsInYear = localStudents.filter(s => s.year === subject.year);
    
    // Ensure every student has an entry for this subject
    const result: StudentSubjectMark[] = studentsInYear.map(student => {
       const existingMark = localMarks.find(m => m.studentId === student.id && m.subjectId === subjectId);
       if (existingMark) return existingMark;
       
       return {
         studentId: student.id,
         studentName: student.name,
         rollNo: student.rollNo,
         subjectId: subject.id,
         subjectName: subject.name,
         test1: 0,
         test2: 0,
         assignment: 0,
         total: 0,
         maxTotal: 100
       };
    });

    return result;
  },

  async updateSubjectMarks(subjectId: number, marks: StudentSubjectMark[]): Promise<boolean> {
      // In a real DB, this would be a bulk upsert
      marks.forEach(mark => {
          const index = localMarks.findIndex(m => m.studentId === mark.studentId && m.subjectId === subjectId);
          if (index >= 0) {
              localMarks[index] = mark;
          } else {
              localMarks.push(mark);
          }
      });
      return true;
  },

  async getStudentSubjectPerformance(email: string): Promise<StudentSubjectMark[]> {
    const student = await this.getStudentProfile(email);
    if (!student) return [];
    return localMarks.filter(m => m.studentId === student.id);
  },


  // Certificates
  async getCertificates(): Promise<Certificate[]> {
    try {
      const { data, error } = await withTimeout(
          supabase.from('certificates').select('*').order('id', { ascending: false })
      );
      if (error) throw error;
      return data.map((c: any) => ({
          ...c,
          studentName: c.student_name || c.studentName || 'Unknown',
          uploadDate: c.upload_date || c.uploadDate || new Date().toISOString().split('T')[0]
      })) as Certificate[];
    } catch (error) {
      return localCertificates;
    }
  },

  async updateCertificateStatus(id: number, status: 'Approved' | 'Rejected'): Promise<boolean> {
    try {
      const { error } = await withTimeout(
          supabase.from('certificates').update({ status }).eq('id', id)
      );
      if (error) throw error;
      return true;
    } catch (error) {
      localCertificates = localCertificates.map(c => c.id === id ? { ...c, status } : c);
      return true;
    }
  },

  // Yearly Stats
  async getYearlyStats(year: number): Promise<YearlyStats | null> {
    try {
      const { data, error } = await withTimeout(
          supabase.from('yearly_stats').select('data').eq('year', year).maybeSingle()
      );
      if (!error && data) return data.data as YearlyStats;
      throw error;
    } catch (error) {
      return null; 
    }
  },

  // --- Achievement System APIs ---

  async getAchievementCategories(): Promise<AchievementCategory[]> {
    return achievementCategories;
  },

  async getStudentAchievements(email: string): Promise<Achievement[]> {
    return localAchievements;
  },

  async getAllPendingAchievements(): Promise<Achievement[]> {
    const pending = localAchievements.filter(a => a.status === 'pending');
    // Map to include year from student data
    return pending.map(ach => {
        const student = localStudents.find(s => s.id === ach.student_id);
        return {
            ...ach,
            student_year: student?.year || 'N/A'
        }
    });
  },

  async uploadAchievement(data: Partial<Achievement>): Promise<boolean> {
      try {
          const newId = Date.now();
          const newAchievement: Achievement = {
              id: newId,
              student_id: 1, 
              student_name: 'Current Student',
              category_id: data.category_id || 0,
              title: data.title || '',
              description: data.description || '',
              proof_file: data.proof_file || '',
              achievement_date: data.achievement_date || '',
              points_awarded: 0,
              status: 'pending',
              uploaded_at: new Date().toISOString(),
              roll_no: 'CS101',
              category_name: achievementCategories.find(c => c.id === data.category_id)?.category_name || 'General'
          };
          localAchievements = [newAchievement, ...localAchievements];
          return true;
      } catch {
          return false;
      }
  },

  async verifyAchievement(id: number, status: 'approved' | 'rejected', points?: number): Promise<boolean> {
      try {
          localAchievements = localAchievements.map(a => a.id === id ? { ...a, status, points_awarded: points || 0 } : a);
          return true;
      } catch {
          return false;
      }
  },

  async getLeaderboard(year: string): Promise<LeaderboardEntry[]> {
    // 1. Filter students by year
    let targetStudents = localStudents;
    if (year !== 'All' && year !== 'All Years') {
        targetStudents = localStudents.filter(s => s.year === year);
    }

    // 2. Calculate Total Marks for each student from localMarks
    const leaderboardData = targetStudents.map(student => {
        // Find all marks belonging to this student
        const studentMarks = localMarks.filter(m => m.studentId === student.id);
        
        // Sum the totals (Test1 + Test2 + Assignment)
        const totalMarks = studentMarks.reduce((sum, m) => sum + m.total, 0);

        return {
            rank: 0, // Rank assigned after sort
            student_name: student.name,
            roll_no: student.rollNo,
            total_points: totalMarks, // Using total_points to represent Total Academic Marks
            year_level: student.year || '1'
        };
    });

    // 3. Sort by Total Marks Descending
    leaderboardData.sort((a, b) => b.total_points - a.total_points);

    // 4. Assign Rank
    return leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
  },

  async getAchievementLeaderboard(year: string): Promise<LeaderboardEntry[]> {
    let targetStudents = localStudents;
    if (year !== 'All' && year !== 'All Years') {
        targetStudents = localStudents.filter(s => s.year === year);
    }

    const leaderboardData = targetStudents.map(student => {
        // Sum approved achievements
        const studentAchievements = localAchievements.filter(a => 
            a.student_id === student.id && a.status === 'approved'
        );
        const totalPoints = studentAchievements.reduce((sum, a) => sum + a.points_awarded, 0);

        return {
            rank: 0,
            student_name: student.name,
            roll_no: student.rollNo,
            total_points: totalPoints,
            year_level: student.year || '1'
        };
    });

    leaderboardData.sort((a, b) => b.total_points - a.total_points);
    
    return leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
  },

  async getSubjectLeaderboard(subjectId: number): Promise<LeaderboardEntry[]> {
      // 1. Filter marks just for this subject
      const subjectMarks = localMarks.filter(m => m.subjectId === subjectId);
      
      // 2. Sort by Total Score Descending
      subjectMarks.sort((a, b) => b.total - a.total);

      // 3. Map to Leaderboard Entry
      return subjectMarks.map((mark, index) => ({
          rank: index + 1,
          student_name: mark.studentName,
          roll_no: mark.rollNo,
          total_points: mark.total,
          year_level: 'N/A' // Not relevant for single subject
      }));
  },

  // Institution Settings
  async getInstitutionSettings() {
    return localSettings;
  },

  subscribeToSettings(listener: SettingsListener) {
    settingsListeners.push(listener);
    return () => {
      const index = settingsListeners.indexOf(listener);
      if (index > -1) settingsListeners.splice(index, 1);
    };
  },

  async updateInstitutionSettings(settings: { logoUrl: string | null }) {
    localSettings = { ...localSettings, ...settings };
    // Notify listeners
    settingsListeners.forEach(listener => listener(localSettings));
    return true;
  }
};
