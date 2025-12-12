
import { User, Student, Certificate, YearlyStats, AchievementCategory, Achievement, LeaderboardEntry, Subject, StudentSubjectMark } from '../types';

export const generateMockData = (year: number): YearlyStats => {
  const baseData: Record<number, YearlyStats> = {
    1: {
      totalStudents: 120,
      internal1: { pass: 95, fail: 25 },
      internal2: { pass: 105, fail: 15 },
      attendance: { above75: 85, below75: 35 },
      cgpa: { aPlus: 15, a: 25, bPlus: 35, b: 25, c: 15, f: 5 }
    },
    2: {
      totalStudents: 115,
      internal1: { pass: 100, fail: 15 },
      internal2: { pass: 108, fail: 7 },
      attendance: { above75: 95, below75: 20 },
      cgpa: { aPlus: 20, a: 30, bPlus: 30, b: 20, c: 12, f: 3 }
    },
    3: {
      totalStudents: 110,
      internal1: { pass: 102, fail: 8 },
      internal2: { pass: 105, fail: 5 },
      attendance: { above75: 98, below75: 12 },
      internship: { completed: 75, inProgress: 25, notStarted: 10 },
      cgpa: { aPlus: 25, a: 35, bPlus: 25, b: 15, c: 8, f: 2 }
    },
    4: {
      totalStudents: 105,
      internal1: { pass: 100, fail: 5 },
      internal2: { pass: 103, fail: 2 },
      attendance: { above75: 100, below75: 5 },
      internship: { completed: 95, inProgress: 8, notStarted: 2 },
      placement: { placed: 78, notPlaced: 20, higherStudies: 7 },
      cgpa: { aPlus: 30, a: 40, bPlus: 20, b: 10, c: 4, f: 1 }
    }
  };
  return baseData[year];
};

export const initialUsers: User[] = [
  { id: 1, name: 'Dr. Rajesh Kumar', email: 'rajesh@college.edu', role: 'Staff', year: '1', subject: 'Mathematics' },
  { id: 2, name: 'Prof. Priya Sharma', email: 'priya@college.edu', role: 'Staff', year: '2', subject: 'Physics' },
  { id: 3, name: 'Dr. Amit Patel', email: 'amit@college.edu', role: 'Staff', year: '3', subject: 'Data Structures' },
  { id: 4, name: 'Arun Kumar', email: 'arun@student.edu', role: 'Student', year: '1', subject: '-' },
  { id: 5, name: 'Sneha Reddy', email: 'sneha@student.edu', role: 'Student', year: '2', subject: '-' }
];

export const initialStudents: Student[] = [
  // Year 1
  { id: 1, name: 'Arun Kumar', email: 'arun@student.edu', rollNo: 'CS101', year: '1', internal1: 85, internal2: 90, attendance: 92, cgpa: 8.5 },
  { id: 2, name: 'Sneha Reddy', email: 'sneha@student.edu', rollNo: 'CS102', year: '1', internal1: 78, internal2: 82, attendance: 88, cgpa: 8.2 },
  { id: 3, name: 'Rahul Verma', rollNo: 'CS103', year: '1', internal1: 92, internal2: 95, attendance: 95, cgpa: 9.0 },
  { id: 4, name: 'Priya Singh', rollNo: 'CS104', year: '1', internal1: 70, internal2: 75, attendance: 80, cgpa: 7.5 },
  { id: 5, name: 'Karthik Raj', rollNo: 'CS105', year: '1', internal1: 88, internal2: 85, attendance: 90, cgpa: 8.8 },
  
  // Year 2
  { id: 6, name: 'Emily Davis', rollNo: 'CS201', year: '2', internal1: 88, internal2: 91, attendance: 94, cgpa: 8.9 },
  { id: 7, name: 'Michael Brown', rollNo: 'CS202', year: '2', internal1: 65, internal2: 70, attendance: 76, cgpa: 6.8 },
  
  // Year 3
  { id: 8, name: 'Sarah Jones', rollNo: 'CS301', year: '3', internal1: 95, internal2: 96, attendance: 98, cgpa: 9.5 },
  { id: 9, name: 'David Wilson', rollNo: 'CS302', year: '3', internal1: 82, internal2: 85, attendance: 89, cgpa: 8.0 },
  
  // Year 4
  { id: 10, name: 'James White', rollNo: 'CS401', year: '4', internal1: 90, internal2: 92, attendance: 95, cgpa: 9.1 },
  { id: 11, name: 'Linda Green', rollNo: 'CS402', year: '4', internal1: 88, internal2: 89, attendance: 91, cgpa: 8.7 },
  { id: 12, name: 'Robert Black', rollNo: 'CS403', year: '4', internal1: 75, internal2: 78, attendance: 82, cgpa: 7.8 }
];

// --- New Subject & Detailed Marks Data ---

export const mockSubjects: Subject[] = [
  // Year 1
  { id: 101, name: 'Mathematics I', code: 'MAT101', year: '1', staffId: 1, staffName: 'Dr. Rajesh Kumar', totalStudents: 60, lastUpdated: '2025-05-15' },
  { id: 102, name: 'Physics', code: 'PHY101', year: '1', staffId: 2, staffName: 'Prof. Priya Sharma', totalStudents: 60, lastUpdated: '2025-05-14' },
  { id: 103, name: 'Prog. in C', code: 'CS101', year: '1', staffId: 3, staffName: 'Dr. Amit Patel', totalStudents: 60, lastUpdated: '2025-05-10' },
  
  // Year 2
  { id: 201, name: 'Data Structures', code: 'CS201', year: '2', staffId: 3, staffName: 'Dr. Amit Patel', totalStudents: 55, lastUpdated: '2025-05-12' },
  { id: 202, name: 'OOPs', code: 'CS202', year: '2', staffId: 1, staffName: 'Prof. John Doe', totalStudents: 55, lastUpdated: '2025-05-11' },
  { id: 203, name: 'Operating Sys.', code: 'CS203', year: '2', staffId: 2, staffName: 'Prof. Jane Doe', totalStudents: 55, lastUpdated: '2025-05-13' },

  // Year 3
  { id: 301, name: 'DBMS', code: 'CS301', year: '3', staffId: 1, staffName: 'Dr. Rajesh Kumar', totalStudents: 50, lastUpdated: '2025-05-15' },
  { id: 302, name: 'Networks', code: 'CS302', year: '3', staffId: 2, staffName: 'Prof. Priya Sharma', totalStudents: 50, lastUpdated: '2025-05-14' },

  // Year 4
  { id: 401, name: 'Cloud Computing', code: 'CS401', year: '4', staffId: 3, staffName: 'Dr. Amit Patel', totalStudents: 45, lastUpdated: '2025-05-12' },
  { id: 402, name: 'AI & ML', code: 'CS402', year: '4', staffId: 1, staffName: 'Prof. John Doe', totalStudents: 45, lastUpdated: '2025-05-10' }
];

export const mockMarks: StudentSubjectMark[] = [
  // Marks for Arun (Year 1)
  { studentId: 1, studentName: 'Arun Kumar', rollNo: 'CS101', subjectId: 101, subjectName: 'Mathematics I', test1: 45, test2: 48, assignment: 10, total: 93, maxTotal: 100 },
  { studentId: 1, studentName: 'Arun Kumar', rollNo: 'CS101', subjectId: 102, subjectName: 'Physics', test1: 40, test2: 42, assignment: 9, total: 81, maxTotal: 100 },
  { studentId: 1, studentName: 'Arun Kumar', rollNo: 'CS101', subjectId: 103, subjectName: 'Prog. in C', test1: 42, test2: 45, assignment: 10, total: 87, maxTotal: 100 },

  // Marks for Sneha (Year 1)
  { studentId: 2, studentName: 'Sneha Reddy', rollNo: 'CS102', subjectId: 101, subjectName: 'Mathematics I', test1: 35, test2: 40, assignment: 8, total: 73, maxTotal: 100 },
  { studentId: 2, studentName: 'Sneha Reddy', rollNo: 'CS102', subjectId: 102, subjectName: 'Physics', test1: 45, test2: 46, assignment: 10, total: 91, maxTotal: 100 },

  // Marks for Emily (Year 2)
  { studentId: 6, studentName: 'Emily Davis', rollNo: 'CS201', subjectId: 201, subjectName: 'Data Structures', test1: 44, test2: 45, assignment: 10, total: 89, maxTotal: 100 },
  { studentId: 6, studentName: 'Emily Davis', rollNo: 'CS201', subjectId: 202, subjectName: 'OOPs', test1: 40, test2: 42, assignment: 9, total: 81, maxTotal: 100 },
];

export const initialCertificates: Certificate[] = [
  { id: 1, studentName: 'Arun Kumar', type: 'Internship', company: 'TCS', status: 'Pending', uploadDate: '2024-12-01' },
  { id: 2, studentName: 'Sneha Reddy', type: 'Placement', company: 'Infosys', status: 'Pending', uploadDate: '2024-12-02' },
  { id: 3, studentName: 'Rahul Verma', type: 'Internship', company: 'Wipro', status: 'Approved', uploadDate: '2024-11-28' }
];

// --- Achievement System Mock Data ---

export const achievementCategories: AchievementCategory[] = [
  { id: 1, category_name: 'Paper Presentation', points: 20, description: 'Presented research paper at conference' },
  { id: 2, category_name: 'Hackathon Winner', points: 25, description: 'Won a hackathon competition' },
  { id: 3, category_name: 'Hackathon Participation', points: 10, description: 'Participated in hackathon' },
  { id: 4, category_name: 'Certification', points: 15, description: 'Completed NPTEL/Coursera certification' },
  { id: 5, category_name: 'Workshop/Seminar', points: 5, description: 'Attended workshop or seminar' },
  { id: 6, category_name: 'Internship', points: 20, description: 'Completed internship program' },
  { id: 7, category_name: 'Competition Winner', points: 25, description: 'Won competitive event' },
  { id: 8, category_name: 'Competition Participation', points: 10, description: 'Participated in competition' }
];

export const mockAchievements: Achievement[] = [
  { 
    id: 1, 
    student_id: 1, 
    student_name: 'Arun Kumar',
    roll_no: 'CS101',
    category_id: 1, 
    category_name: 'Paper Presentation',
    title: 'AI in Healthcare', 
    description: 'Presented at IEEE Conference', 
    proof_file: 'cert_ieee_2024.pdf', 
    achievement_date: '2024-10-15', 
    points_awarded: 20, 
    status: 'approved', 
    uploaded_at: '2024-10-16' 
  },
  { 
    id: 2, 
    student_id: 1, 
    student_name: 'Arun Kumar',
    roll_no: 'CS101',
    category_id: 2, 
    category_name: 'Hackathon Winner',
    title: 'Smart City Hackathon', 
    description: 'First prize in smart traffic system', 
    proof_file: 'hackathon_win.jpg', 
    achievement_date: '2024-11-20', 
    points_awarded: 0, 
    status: 'pending', 
    uploaded_at: '2024-11-21' 
  },
  {
    id: 3,
    student_id: 2,
    student_name: 'Sneha Reddy',
    roll_no: 'CS102',
    category_id: 4,
    category_name: 'Certification',
    title: 'AWS Cloud Practitioner',
    description: 'Completed AWS certification',
    proof_file: 'aws_cert.pdf',
    achievement_date: '2024-09-10',
    points_awarded: 15,
    status: 'approved',
    uploaded_at: '2024-09-11'
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, student_name: 'Michael Chen', roll_no: 'CS405', total_points: 150, year_level: '4' },
  { rank: 2, student_name: 'Arun Kumar', roll_no: 'CS101', total_points: 125, year_level: '1' },
  { rank: 3, student_name: 'Sarah Jones', roll_no: 'CS302', total_points: 115, year_level: '3' },
  { rank: 4, student_name: 'Rahul Verma', roll_no: 'CS103', total_points: 110, year_level: '1' },
  { rank: 5, student_name: 'Emily Davis', roll_no: 'CS204', total_points: 105, year_level: '2' },
  { rank: 6, student_name: 'Sneha Reddy', roll_no: 'CS102', total_points: 95, year_level: '1' },
  { rank: 7, student_name: 'David Wilson', roll_no: 'CS310', total_points: 90, year_level: '3' },
  { rank: 8, student_name: 'Karthik Raj', roll_no: 'CS105', total_points: 65, year_level: '1' },
  { rank: 9, student_name: 'Priya Singh', roll_no: 'CS104', total_points: 40, year_level: '1' },
  { rank: 10, student_name: 'James Brown', roll_no: 'CS401', total_points: 35, year_level: '4' }
];
