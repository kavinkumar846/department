import React, { useState, useEffect } from 'react';
import { Upload, FileText, TrendingUp, Calendar, Trophy, Medal, Star, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { Achievement, AchievementCategory, LeaderboardEntry, StudentSubjectMark } from '../types';

interface StudentDashboardProps {
  currentUserEmail: string;
  activeTab?: 'Dashboard' | 'Upload' | 'Leaderboard';
  onTabChange?: (tab: 'Dashboard' | 'Upload' | 'Leaderboard') => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUserEmail, activeTab: propsActiveTab, onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'Dashboard' | 'Upload' | 'Leaderboard'>('Dashboard');
  const activeTab = propsActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  const [studentData, setStudentData] = useState<any>(null);
  const [subjectMarks, setSubjectMarks] = useState<StudentSubjectMark[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [uploadForm, setUploadForm] = useState({ category_id: '', title: '', description: '', date: '' });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        const data = await api.getStudentProfile(currentUserEmail);
        setStudentData(data || { name: 'Student', rollNo: 'N/A', year: '1', internal1: 0, internal2: 0, attendance: 0, cgpa: 0 });
        
        if (data) {
           const marks = await api.getStudentSubjectPerformance(currentUserEmail);
           setSubjectMarks(marks);
        }

        const cats = await api.getAchievementCategories();
        setCategories(cats);
        
        const achs = await api.getStudentAchievements(currentUserEmail);
        setAchievements(achs);

        if (data && data.year) {
            const lb = await api.getLeaderboard(data.year);
            setLeaderboard(lb);
        }
        
        setLoading(false);
    };
    init();
  }, [currentUserEmail]);

  const handleUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!uploadedFile) return;
      await api.uploadAchievement({ ...uploadForm, category_id: parseInt(uploadForm.category_id), proof_file: uploadedFile });
      alert('Uploaded! Pending approval.');
      setUploadForm({ category_id: '', title: '', description: '', date: '' });
      setUploadedFile(null);
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Welcome, {studentData.name}</h1>
           <p className="text-gray-500">{studentData.rollNo} • Year {studentData.year} • Computer Science</p>
        </div>
        
        <div className="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            {['Dashboard', 'Upload', 'Leaderboard'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === tab 
                        ? 'bg-violet-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'Dashboard' && (
          <div className="space-y-8">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">Year</p>
                       <p className="text-2xl font-bold text-gray-900">{studentData.year}</p>
                     </div>
                     <BookOpen className="w-8 h-8 text-blue-200" />
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">Subjects</p>
                       <p className="text-2xl font-bold text-gray-900">{subjectMarks.length}</p>
                     </div>
                     <FileText className="w-8 h-8 text-violet-200" />
                  </div>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">Attendance</p>
                       <p className="text-2xl font-bold text-gray-900">{studentData.attendance}%</p>
                     </div>
                     <Calendar className="w-8 h-8 text-green-200" />
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">CGPA</p>
                       <p className="text-2xl font-bold text-gray-900">{studentData.cgpa}</p>
                     </div>
                     <TrendingUp className="w-8 h-8 text-orange-200" />
                  </div>
              </div>

              {/* Subject Cards */}
              <div>
                 <h2 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h2>
                 {subjectMarks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 italic">
                       No subjects found for current year.
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {subjectMarks.map((sub, idx) => (
                          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                             <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                                <div>
                                   <h3 className="font-bold text-gray-900 text-lg mb-1">{sub.subjectName}</h3>
                                   <p className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded">Marks Updated</p>
                                </div>
                                <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center font-bold text-sm">
                                   {Math.round((sub.total / sub.maxTotal) * 100)}%
                                </div>
                             </div>
                             <div className="p-5">
                                <div className="space-y-3">
                                   <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">Test 1</span>
                                      <span className="font-semibold text-gray-900">{sub.test1} / 50</span>
                                   </div>
                                   <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">Test 2</span>
                                      <span className="font-semibold text-gray-900">{sub.test2} / 50</span>
                                   </div>
                                   <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">Assignment</span>
                                      <span className="font-semibold text-gray-900">{sub.assignment} / 20</span>
                                   </div>
                                   <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                      <span className="font-bold text-gray-700">Total</span>
                                      <span className="font-bold text-violet-600 text-lg">{sub.total} / {sub.maxTotal}</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Achievements Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Achievements</h3>
                  <div className="space-y-4">
                      {achievements.slice(0, 3).map(ach => (
                          <div key={ach.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center">
                                  <Medal className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="font-semibold text-gray-900 text-sm">{ach.title}</p>
                                  <p className="text-xs text-gray-500">{ach.category_name}</p>
                              </div>
                              <span className={`ml-auto text-xs px-2 py-1 rounded font-bold ${ach.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                 {ach.status}
                              </span>
                          </div>
                      ))}
                      {achievements.length === 0 && <p className="text-gray-400 text-sm italic">No achievements yet.</p>}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Upload' && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">Upload Achievement</h3>
                          <p className="text-sm text-gray-500">Submit proofs for points.</p>
                      </div>
                  </div>

                  <form onSubmit={handleUpload} className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                              <select 
                                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-500"
                                  value={uploadForm.category_id}
                                  onChange={e => setUploadForm({...uploadForm, category_id: e.target.value})}
                              >
                                  <option value="">Select...</option>
                                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name} ({c.points}pts)</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                              <input 
                                  type="date" 
                                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-500"
                                  value={uploadForm.date}
                                  onChange={e => setUploadForm({...uploadForm, date: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input 
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-500"
                              placeholder="e.g. Hackathon Winner"
                              value={uploadForm.title}
                              onChange={e => setUploadForm({...uploadForm, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea 
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-violet-500"
                              rows={3}
                              placeholder="Describe your achievement..."
                              value={uploadForm.description}
                              onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                          />
                      </div>

                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-violet-300 transition-all relative">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setUploadedFile(e.target.files?.[0]?.name || null)} />
                          <Upload className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="text-sm font-medium text-gray-600">{uploadedFile || "Click to upload proof document"}</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 5MB</p>
                      </div>

                      <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-lg font-bold hover:bg-violet-700 shadow-sm">
                          Submit for Verification
                      </button>
                  </form>
              </div>
          </div>
      )}

      {activeTab === 'Leaderboard' && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <h3 className="font-bold text-gray-900 text-lg">Year {studentData.year} Leaderboard</h3>
                    </div>
                    <p className="text-gray-500 text-sm">Compete with your peers and earn recognition.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4 text-right">Points</th>
                                <th className="px-6 py-4 text-center">Badges</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((entry, idx) => (
                                    <tr 
                                        key={idx} 
                                        className={`transition-colors ${
                                            entry.roll_no === studentData.rollNo ? 'bg-violet-50' : 'hover:bg-gray-50/50'
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                idx === 1 ? 'bg-gray-100 text-gray-700' :
                                                idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                'text-gray-500'
                                            }`}>
                                                {entry.rank}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className={`font-semibold ${entry.roll_no === studentData.rollNo ? 'text-violet-700' : 'text-gray-900'}`}>
                                                    {entry.student_name} {entry.roll_no === studentData.rollNo && '(You)'}
                                                </div>
                                                <div className="text-xs text-gray-500">{entry.roll_no}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-violet-600">{entry.total_points}</td>
                                        <td className="px-6 py-4 text-center">
                                            {idx < 3 && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                                                    <Star className="w-3 h-3 mr-1" /> Elite
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
      )}
    </div>
  );
};

export default StudentDashboard;
