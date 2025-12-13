
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Student, Certificate, Achievement, LeaderboardEntry, Subject, StudentSubjectMark, AchievementCategory, LeaveApplication } from '../types';
import { Save, Upload, Download, Search, CheckCircle, ArrowLeft, Users, BookOpen, Clock, AlertCircle, FileSpreadsheet, ChevronRight, GraduationCap, Settings, Plus, Trash2, X, Briefcase, Trophy, ArrowRight, BarChart2, FileText, ExternalLink, Calendar, Award } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StaffDashboardProps {
  currentUserEmail: string;
  activeTab?: 'MARKS' | 'ATTENDANCE' | 'VERIFICATION' | 'LEAVE';
  onTabChange?: (tab: 'MARKS' | 'ATTENDANCE' | 'VERIFICATION' | 'LEAVE') => void;
}

type ViewState = 'YEAR_SELECT' | 'SUBJECT_SELECT' | 'SUBJECT_DETAILS' | 'ATTENDANCE_YEAR_SELECT' | 'ATTENDANCE_DETAILS' | 'VERIFICATION' | 'LEADERBOARD' | 'LEAVE_YEAR_SELECT' | 'LEAVE_REQUESTS';

const StaffDashboard: React.FC<StaffDashboardProps> = ({ currentUserEmail, activeTab, onTabChange }) => {
  const [currentView, setCurrentView] = useState<ViewState>('YEAR_SELECT');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<StudentSubjectMark[]>([]);
  const [filteredMarks, setFilteredMarks] = useState<StudentSubjectMark[]>([]);
  const [attendanceStudents, setAttendanceStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manage Subjects State
  const [showManageSubjects, setShowManageSubjects] = useState(false);
  const [newSubjectForm, setNewSubjectForm] = useState({ name: '', code: '', staffName: '' });
  
  // Other Tab Data
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<'YEAR' | 'SUBJECT'>('YEAR'); // Track context
  const [leaderboardMetric, setLeaderboardMetric] = useState<'ACADEMIC' | 'ACHIEVEMENTS'>('ACADEMIC');
  const [pendingLeaves, setPendingLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attendanceFileInputRef = useRef<HTMLInputElement>(null);

  // Sync prop with internal state
  useEffect(() => {
    if (activeTab === 'VERIFICATION') {
      setCurrentView('VERIFICATION');
    } else if (activeTab === 'ATTENDANCE') {
      setCurrentView('ATTENDANCE_YEAR_SELECT');
    } else if (activeTab === 'LEAVE') {
      setCurrentView('LEAVE_YEAR_SELECT');
    } else if (activeTab === 'MARKS') {
       if (currentView === 'VERIFICATION' || currentView.startsWith('ATTENDANCE') || currentView.startsWith('LEAVE')) {
          setCurrentView('YEAR_SELECT');
       }
    }
  }, [activeTab]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const aData = await api.getAllPendingAchievements();
      setPendingAchievements(aData);
      
      const cats = await api.getAchievementCategories();
      setCategories(cats);

      setLoading(false);
    };
    init();
  }, [currentUserEmail]);

  // Fetch Subjects when Year is selected (Marks Flow)
  useEffect(() => {
    if (selectedYear && (currentView === 'SUBJECT_SELECT' || showManageSubjects)) {
      const fetchSubjects = async () => {
        const data = await api.getSubjectsByYear(selectedYear);
        setSubjects(data);
      };
      fetchSubjects();
    }
  }, [selectedYear, currentView, showManageSubjects]);

  // Fetch Marks when Subject is selected
  useEffect(() => {
    if (selectedSubject && currentView === 'SUBJECT_DETAILS') {
      const fetchMarks = async () => {
        const data = await api.getMarksForSubject(selectedSubject.id);
        setMarks(data);
        setFilteredMarks(data);
      };
      fetchMarks();
    }
  }, [selectedSubject, currentView]);

  // Fetch Students for Attendance
  useEffect(() => {
    if (selectedYear && currentView === 'ATTENDANCE_DETAILS') {
        const fetchStudents = async () => {
            setLoading(true);
            const all = await api.getStudents();
            const filtered = all.filter(s => s.year === selectedYear);
            setAttendanceStudents(filtered);
            setLoading(false);
        };
        fetchStudents();
    }
  }, [selectedYear, currentView]);

  // Re-fetch leaderboard when metric changes and View specific data fetching
  useEffect(() => {
      if (currentView === 'LEADERBOARD' && leaderboardType === 'YEAR') {
          loadLeaderboard();
      }
      if (currentView === 'LEAVE_REQUESTS') {
          const fetchLeaves = async () => {
              const leaves = await api.getPendingLeaves(selectedYear || undefined);
              setPendingLeaves(leaves);
          };
          fetchLeaves();
      }
  }, [leaderboardMetric, currentView, selectedYear]);

  // Search Filter (Marks)
  useEffect(() => {
    if (currentView === 'SUBJECT_DETAILS' && marks.length > 0) {
      const lower = searchTerm.toLowerCase();
      setFilteredMarks(marks.filter(m => 
        m.studentName.toLowerCase().includes(lower) || 
        m.rollNo.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, marks, currentView]);

  // --- Actions ---

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setCurrentView('SUBJECT_SELECT');
  };

  const handleAttendanceYearSelect = (year: string) => {
    setSelectedYear(year);
    setCurrentView('ATTENDANCE_DETAILS');
  };

  const handleLeaveYearSelect = (year: string) => {
    setSelectedYear(year);
    setCurrentView('LEAVE_REQUESTS');
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('SUBJECT_DETAILS');
  };

  const handleMarkChange = (studentId: number, field: keyof StudentSubjectMark, value: string) => {
    const numVal = parseFloat(value) || 0;
    setMarks(prev => prev.map(m => {
      if (m.studentId === studentId) {
        const updated = { ...m, [field]: numVal };
        updated.total = updated.test1 + updated.test2 + updated.assignment;
        return updated;
      }
      return m;
    }));
  };

  const handleAttendanceChange = (studentId: number, value: string) => {
      const numVal = Math.min(100, Math.max(0, parseFloat(value) || 0));
      setAttendanceStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: numVal } : s));
  };

  const saveMarks = async () => {
    if (selectedSubject) {
      await api.updateSubjectMarks(selectedSubject.id, marks);
      alert('Marks updated successfully!');
    }
  };

  const saveAttendance = async () => {
      setLoading(true);
      await Promise.all(attendanceStudents.map(s => api.updateStudent(s.id, { attendance: s.attendance })));
      setLoading(false);
      alert('Attendance updated successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      // Map Excel data to Marks structure
      const updatedMarks = [...marks];
      let matchCount = 0;

      data.forEach(row => {
        const targetIndex = updatedMarks.findIndex(m => m.rollNo === row.roll_no || m.rollNo === row['Roll No']);
        if (targetIndex >= 0) {
          matchCount++;
          const current = updatedMarks[targetIndex];
          current.test1 = row.test1 || row['Test 1'] || current.test1;
          current.test2 = row.test2 || row['Test 2'] || current.test2;
          current.assignment = row.assignment || row['Assignment'] || current.assignment;
          current.total = current.test1 + current.test2 + current.assignment;
          updatedMarks[targetIndex] = current;
        }
      });

      setMarks(updatedMarks);
      setFilteredMarks(updatedMarks); 
      alert(`Processed file. Updated marks for ${matchCount} students. Click 'Save Changes' to commit.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleAttendanceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const updatedStudents = [...attendanceStudents];
      let matchCount = 0;

      data.forEach(row => {
        // Try to match roll number column
        const rollNo = row.roll_no || row['Roll No'] || row['rollNo'] || row['Roll_No'];
        // Try to match attendance column
        const attendanceVal = row.attendance || row['Attendance'] || row['Attendance %'] || row['attendance %'];

        if (rollNo && attendanceVal !== undefined) {
            const targetIndex = updatedStudents.findIndex(s => s.rollNo === rollNo);
            if (targetIndex >= 0) {
                matchCount++;
                let numVal = parseFloat(attendanceVal);
                // Handle if excel has decimals for percentage (e.g. 0.9 for 90%) - heuristic check
                if (numVal <= 1 && numVal > 0 && attendanceVal < 2) numVal = numVal * 100;
                
                numVal = Math.min(100, Math.max(0, Math.round(numVal)));
                updatedStudents[targetIndex] = { ...updatedStudents[targetIndex], attendance: numVal };
            }
        }
      });

      setAttendanceStudents(updatedStudents);
      alert(`Processed file. Updated attendance for ${matchCount} students. Click 'Save Attendance' to commit.`);
      if (attendanceFileInputRef.current) attendanceFileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const verifyAchievement = async (id: number, status: 'approved' | 'rejected', points: number) => {
      await api.verifyAchievement(id, status, points);
      setPendingAchievements(pendingAchievements.filter(a => a.id !== id));
  };

  const handleLeaveAction = async (id: number, status: 'Approved' | 'Rejected') => {
      await api.updateLeaveStatus(id, status);
      setPendingLeaves(prev => prev.filter(l => l.id !== id));
  };

  const loadLeaderboard = async () => {
      setLeaderboardType('YEAR');
      let lb = [];
      if (leaderboardMetric === 'ACHIEVEMENTS') {
          lb = await api.getAchievementLeaderboard(selectedYear || '1');
      } else {
          lb = await api.getLeaderboard(selectedYear || '1');
      }
      setLeaderboard(lb);
  };

  const loadSubjectLeaderboard = async () => {
      if (!selectedSubject) return;
      setLeaderboardType('SUBJECT');
      const lb = await api.getSubjectLeaderboard(selectedSubject.id);
      setLeaderboard(lb);
  };
  
  // Subject Management
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSubjectForm.name.trim();
    const code = newSubjectForm.code.trim();
    
    if(selectedYear && name && code) {
        await api.createSubject({
            name: name,
            code: code,
            staffName: newSubjectForm.staffName.trim() || 'Unassigned',
            year: selectedYear,
            staffId: 0,
            totalStudents: 0,
            lastUpdated: new Date().toISOString().split('T')[0]
        });
        const data = await api.getSubjectsByYear(selectedYear);
        setSubjects(data);
        setNewSubjectForm({ name: '', code: '', staffName: '' });
    }
  };

  const handleDeleteSubject = async (id: number) => {
      if(window.confirm('Are you sure you want to delete this subject?')) {
          setSubjects(prev => prev.filter(s => s.id !== id));
          await api.deleteSubject(id);
          const data = await api.getSubjectsByYear(selectedYear!);
          setSubjects(data);
      }
  }

  // --- RENDERERS ---

  const renderYearGrid = (onClick: (year: string) => void, title: string, subtitle: string, icon: any) => {
    const years = [
        { id: 1, label: 'First Year', icon: GraduationCap },
        { id: 2, label: 'Second Year', icon: BookOpen },
        { id: 3, label: 'Third Year', icon: Briefcase },
        { id: 4, label: 'Fourth Year', icon: Trophy },
    ];
    
    return (
      <div className="space-y-10 animate-in fade-in bg-[#f0f2f5] p-6">
        <div className="flex justify-between items-end max-w-[1250px] mx-auto w-full">
          <div>
            <h1 className="text-3xl font-extrabold text-[#002147]">Staff Portal</h1>
            <p className="text-gray-500 mt-2">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-[30px] w-full">
          {years.map(y => (
             <button 
                key={y.id}
                onClick={() => onClick(y.id.toString())}
                className="group relative bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col text-left w-[290px] h-[230px]"
            >
                <div className="mb-6">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-300">
                        <y.icon className="w-7 h-7" />
                    </div>
                </div>

                <div className="mb-auto">
                    <h3 className="text-[20px] font-bold text-gray-900 mb-1.5 leading-tight">{y.label}</h3>
                    <p className="text-[14px] text-gray-400 font-medium leading-relaxed">{title}</p>
                </div>

                <div className="text-purple-600 text-[15px] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all mt-auto">
                    Select Year <ArrowRight className="w-4 h-4" />
                </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (currentView === 'YEAR_SELECT') {
      return (
          <>
            {renderYearGrid(handleYearSelect, 'Manage subjects & marks', 'Select an academic year to manage subjects and students.', GraduationCap)}
            <div className="flex justify-center -mt-8 pb-12">
               {/* Verification Card as a separate entry below grid in main view */}
               <button 
                    onClick={() => {
                        setCurrentView('VERIFICATION');
                        onTabChange?.('VERIFICATION');
                    }}
                    className="flex items-center gap-3 bg-white px-8 py-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="relative">
                         <CheckCircle className="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition-colors" />
                         {pendingAchievements.length > 0 && (
                             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                         )}
                    </div>
                    <div className="text-left">
                         <p className="font-bold text-gray-900">Pending Approvals</p>
                         <p className="text-xs text-gray-500">{pendingAchievements.length} items waiting</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 ml-2" />
               </button>
            </div>
          </>
      );
  }

  if (currentView === 'ATTENDANCE_YEAR_SELECT') {
      return renderYearGrid(handleAttendanceYearSelect, 'Update student attendance', 'Select an academic year to update attendance records.', Calendar);
  }

  if (currentView === 'LEAVE_YEAR_SELECT') {
      return renderYearGrid(handleLeaveYearSelect, 'Manage Leave Requests', 'Select an academic year to view and approve leave applications.', Clock);
  }

  if (currentView === 'LEAVE_REQUESTS') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-4">
                  <button 
                      onClick={() => setCurrentView('LEAVE_YEAR_SELECT')} 
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">Year {selectedYear} Leave Requests</h1>
              </div>

              {pendingLeaves.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                      <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No pending leave requests for Year {selectedYear}.</p>
                  </div>
              ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                              <tr>
                                  <th className="px-6 py-4">Student</th>
                                  <th className="px-6 py-4">Leave Date</th>
                                  <th className="px-6 py-4">Reason</th>
                                  <th className="px-6 py-4">Applied On</th>
                                  <th className="px-6 py-4 text-center">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {pendingLeaves.map((leave) => (
                                  <tr key={leave.id} className="hover:bg-gray-50/50">
                                      <td className="px-6 py-4">
                                          <div>
                                              <p className="font-semibold text-gray-900">{leave.studentName}</p>
                                              <p className="text-xs text-gray-500">{leave.rollNo}</p>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 font-medium text-gray-900">{leave.leaveDate}</td>
                                      <td className="px-6 py-4 text-gray-600">{leave.reason}</td>
                                      <td className="px-6 py-4 text-sm text-gray-500">{leave.appliedOn}</td>
                                      <td className="px-6 py-4 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                              <button 
                                                  onClick={() => handleLeaveAction(leave.id, 'Approved')}
                                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-bold hover:bg-green-200 transition-colors"
                                              >
                                                  Approve
                                              </button>
                                              <button 
                                                  onClick={() => handleLeaveAction(leave.id, 'Rejected')}
                                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-bold hover:bg-red-200 transition-colors"
                                              >
                                                  Reject
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      );
  }

  if (currentView === 'ATTENDANCE_DETAILS') {
      return (
        <div className="space-y-6 animate-in fade-in h-full flex flex-col">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView('ATTENDANCE_YEAR_SELECT')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Attendance - Year {selectedYear}</h1>
                  <p className="text-gray-500">Update overall attendance percentage for students.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={attendanceFileInputRef} 
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={handleAttendanceFileUpload}
                />
                <button 
                    onClick={() => attendanceFileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg font-medium hover:bg-green-50 shadow-sm transition-colors"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Upload Excel
                </button>
                <button 
                    onClick={saveAttendance}
                    className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 shadow-sm transition-colors"
                    disabled={loading}
                >
                    <Save className="w-4 h-4" /> Save Attendance
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Current Attendance (%)</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{student.rollNo}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{student.name}</td>
                      <td className="px-6 py-3">
                        <input 
                          type="number" 
                          min="0" max="100"
                          className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg focus:border-violet-500 outline-none transition-colors"
                          value={student.attendance}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-3">
                         {student.attendance < 75 ? (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center w-fit gap-1">
                                <AlertCircle className="w-3 h-3" /> Low Attendance
                            </span>
                         ) : (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center w-fit gap-1">
                                <CheckCircle className="w-3 h-3" /> Good
                            </span>
                         )}
                      </td>
                    </tr>
                  ))}
                  {attendanceStudents.length === 0 && (
                     <tr>
                        <td colSpan={4} className="text-center py-12 text-gray-400">No students found for this year.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      );
  }

  if (currentView === 'SUBJECT_SELECT') {
    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('YEAR_SELECT')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Year {selectedYear} Subjects</h1>
                <p className="text-gray-500">Select a subject to manage marks.</p>
              </div>
            </div>
            
            <div className="flex gap-2">
                <button 
                  onClick={() => setShowManageSubjects(true)}
                  className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition-colors"
                >
                  <Settings className="w-4 h-4" /> Manage Subjects
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <button 
              key={subject.id}
              onClick={() => handleSubjectSelect(subject)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-violet-500 transition-all text-left flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                  {subject.code}
                </div>
                <Users className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{subject.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{subject.staffName}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {subject.totalStudents} Students</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {subject.lastUpdated}</span>
              </div>
            </button>
          ))}
          {subjects.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
               No subjects found for this year.
             </div>
          )}
        </div>

        {/* Manage Subjects Modal */}
        {showManageSubjects && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Manage Year {selectedYear} Subjects</h2>
                        <button onClick={() => setShowManageSubjects(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 space-y-8">
                        {/* Add New */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2"><Plus className="w-4 h-4"/> Add New Subject</h3>
                            <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input 
                                    placeholder="Subject Code (e.g. CS101)" 
                                    className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-violet-500"
                                    value={newSubjectForm.code}
                                    onChange={e => setNewSubjectForm({...newSubjectForm, code: e.target.value})}
                                    required
                                />
                                <input 
                                    placeholder="Subject Name" 
                                    className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-violet-500"
                                    value={newSubjectForm.name}
                                    onChange={e => setNewSubjectForm({...newSubjectForm, name: e.target.value})}
                                    required
                                />
                                <input 
                                    placeholder="Staff Name" 
                                    className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-violet-500"
                                    value={newSubjectForm.staffName}
                                    onChange={e => setNewSubjectForm({...newSubjectForm, staffName: e.target.value})}
                                />
                                <button type="submit" className="md:col-span-3 bg-violet-600 text-white py-2 rounded-lg font-medium hover:bg-violet-700">Add Subject</button>
                            </form>
                        </div>

                        {/* Existing List */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Existing Subjects</h3>
                            <div className="space-y-3">
                                {subjects.map(sub => (
                                    <div key={sub.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm group hover:border-violet-200 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{sub.code || 'N/A'}</span>
                                                <span className="font-semibold text-gray-900">{sub.name || 'Untitled'}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Handled by: {sub.staffName}</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSubject(sub.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                                            title="Delete Subject"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {subjects.length === 0 && <p className="text-gray-400 text-sm italic text-center">No subjects found.</p>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                        <button onClick={() => setShowManageSubjects(false)} className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-100">Close</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  if (currentView === 'SUBJECT_DETAILS') {
    return (
      <div className="space-y-6 animate-in fade-in h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('SUBJECT_SELECT')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedSubject?.name}</h1>
              <p className="text-gray-500">{selectedSubject?.code} • Year {selectedSubject?.year} • {selectedSubject?.staffName}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => { loadSubjectLeaderboard(); setCurrentView('LEADERBOARD'); }}
              className="flex items-center gap-2 bg-white text-orange-700 border border-orange-200 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 shadow-sm transition-colors"
            >
              <Trophy className="w-4 h-4" /> View Subject Rank
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg font-medium hover:bg-green-50 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" /> Upload Excel
            </button>
            <button 
              onClick={saveMarks}
              className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{marks.length}</p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">Class Avg</p>
              <p className="text-2xl font-bold text-violet-600">
                  {marks.length > 0 ? Math.round(marks.reduce((acc, m) => acc + m.total, 0) / marks.length) : 0}%
              </p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">
                  {marks.length > 0 ? Math.round((marks.filter(m => m.total >= 50).length / marks.length) * 100) : 0}%
              </p>
           </div>
        </div>

        {/* Table Toolbar */}
        <div className="bg-white rounded-t-xl border-b border-gray-100 p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
               type="text" 
               placeholder="Search by name or roll no..." 
               className="flex-1 outline-none text-sm text-gray-700"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Marks Table */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-4 py-4 text-center w-24">Test 1 (50)</th>
                <th className="px-4 py-4 text-center w-24">Test 2 (50)</th>
                <th className="px-4 py-4 text-center w-24">Assign (20)</th>
                <th className="px-6 py-4 text-center font-bold">Total (100)</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMarks.map((mark) => (
                <tr key={mark.studentId} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{mark.rollNo}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{mark.studentName}</td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-violet-500 outline-none transition-colors"
                      value={mark.test1}
                      onChange={(e) => handleMarkChange(mark.studentId, 'test1', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-violet-500 outline-none transition-colors"
                      value={mark.test2}
                      onChange={(e) => handleMarkChange(mark.studentId, 'test2', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-violet-500 outline-none transition-colors"
                      value={mark.assignment}
                      onChange={(e) => handleMarkChange(mark.studentId, 'assignment', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-3 text-center font-bold text-gray-800">
                    {mark.total}
                  </td>
                  <td className="px-6 py-3 text-center">
                     {mark.total < 50 ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Fail</span>
                     ) : (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Pass</span>
                     )}
                  </td>
                </tr>
              ))}
              {filteredMarks.length === 0 && (
                 <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No students found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Reuse Verification & Leaderboard logic (simplified for space, reusing existing components logic conceptually)
  if (currentView === 'VERIFICATION') {
     return (
        <div className="space-y-6 animate-in fade-in">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setCurrentView('YEAR_SELECT');
                    onTabChange?.('MARKS');
                  }} 
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
             </div>
             {pendingAchievements.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                      <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">All caught up! No pending verifications.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {pendingAchievements.map(ach => {
                          const category = categories.find(c => c.id === ach.category_id);
                          const pointsToAward = category ? category.points : 0;
                          
                          return (
                          <div key={ach.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                              <div>
                                  <div className="flex items-center justify-between mb-3">
                                      <span className="bg-violet-50 text-violet-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                          {ach.category_name}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            <Trophy className="w-3 h-3" /> {pointsToAward} pts
                                        </span>
                                        <span className="text-xs text-gray-400">{ach.achievement_date}</span>
                                      </div>
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">{ach.title}</h3>
                                  <p className="text-sm text-gray-600 mb-4">
                                      {ach.student_name} ({ach.roll_no}) {ach.student_year && (
                                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                              Year {ach.student_year}
                                          </span>
                                      )}
                                  </p>
                                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                      {ach.description}
                                  </p>
                                  
                                  {/* Proof File Display */}
                                  <div className="flex items-center gap-4 p-4 bg-[#F0F7FF] rounded-xl border border-[#E0EAFF] mb-6">
                                      <div className="w-10 h-10 bg-[#DBEAFE] text-[#1D4ED8] rounded-full flex items-center justify-center shrink-0">
                                          <FileText className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Proof Document</p>
                                          <p className="text-sm font-bold text-gray-900 truncate" title={ach.proof_file}>{ach.proof_file || 'No file attached'}</p>
                                      </div>
                                      {ach.proof_file && (
                                          <a 
                                            href={`https://placehold.co/600x800/png?text=${encodeURIComponent(ach.title + ' - Proof')}`} 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-[#1D4ED8] hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Open Document"
                                          >
                                              <ExternalLink className="w-5 h-5" />
                                          </a>
                                      )}
                                  </div>
                              </div>
                              <div className="flex gap-3">
                                  <button 
                                    onClick={() => verifyAchievement(ach.id, 'approved', pointsToAward)}
                                    className="flex-1 bg-violet-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
                                  >
                                      Approve ({pointsToAward} pts)
                                  </button>
                                  <button 
                                    onClick={() => verifyAchievement(ach.id, 'rejected', 0)}
                                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                                  >
                                      Reject
                                  </button>
                              </div>
                          </div>
                      )})}
                  </div>
              )}
        </div>
     );
  }

  if (currentView === 'LEADERBOARD') {
     const backAction = leaderboardType === 'SUBJECT' ? 'SUBJECT_DETAILS' : 'SUBJECT_SELECT';
     const title = leaderboardType === 'SUBJECT' 
        ? `${selectedSubject?.name} Rankings` 
        : `Year ${selectedYear} ${leaderboardMetric === 'ACADEMIC' ? 'Academic' : 'Achievement'} Rankings`;

     return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView(backAction)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                </div>
                
                {leaderboardType === 'YEAR' && (
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <button
                            onClick={() => setLeaderboardMetric('ACADEMIC')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                                leaderboardMetric === 'ACADEMIC' 
                                ? 'bg-violet-100 text-violet-700 shadow-sm' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <BookOpen className="w-4 h-4" /> Academic
                        </button>
                        <button
                            onClick={() => setLeaderboardMetric('ACHIEVEMENTS')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                                leaderboardMetric === 'ACHIEVEMENTS' 
                                ? 'bg-amber-100 text-amber-700 shadow-sm' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Award className="w-4 h-4" /> Achievements
                        </button>
                    </div>
                )}
             </div>
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4 text-right">
                                    {leaderboardMetric === 'ACADEMIC' ? 'Total Marks' : 'Total Points'}
                                th>
                                <th className="px-6 py-4 text-center">Badges</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                idx === 1 ? 'bg-gray-100 text-gray-700' :
                                                idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                'text-gray-500'
                                            }`}>
                                                {student.rank}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{student.student_name}</div>
                                            <div className="text-xs text-gray-500">{student.roll_no}</div>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${leaderboardMetric === 'ACADEMIC' ? 'text-violet-600' : 'text-amber-600'}`}>
                                            {student.total_points}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {idx < 3 && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leaderboardMetric === 'ACADEMIC' ? 'bg-violet-100 text-violet-800' : 'bg-amber-100 text-amber-800'}`}>
                                                    <Trophy className="w-3 h-3 mr-1" /> Elite
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No leaderboard data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
           </div>
        </div>
     )
  }

  return null;
};

export default StaffDashboard;
