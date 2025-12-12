
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, BookOpen, CheckCircle, Briefcase, TrendingUp, Award, Download, Filter, Star, AlertCircle, Mail, ArrowLeft, GraduationCap, ChevronRight, Trophy, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { generateMockData } from '../services/mockData';
import { YearlyStats, LeaderboardEntry, Student } from '../types';
import * as XLSX from 'xlsx';

const COLORS = {
    primary: '#7c3aed',
    secondary: '#ddd6fe',
    success: '#10b981',
    warning: '#f59e0b',
    background: '#f9fafb'
};

interface HODDashboardProps {
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

const HODDashboard: React.FC<HODDashboardProps> = ({ selectedYear, onYearChange }) => {
  const [activeTab, setActiveTab] = useState<'Analytics' | 'Leaderboards' | 'TopPerformers'>('Analytics');
  const [data, setData] = useState<YearlyStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<string>('All');

  // Fetch Overall Leaderboard for Overview Page
  useEffect(() => {
      if (!selectedYear) {
          const fetchOverall = async () => {
              const lb = await api.getLeaderboard('All');
              setOverallLeaderboard(lb);
          };
          fetchOverall();
      }
  }, [selectedYear]);

  // Fetch Data for Specific Year Page
  useEffect(() => {
    if (selectedYear) {
        const loadStats = async () => {
            const stats = await api.getYearlyStats(selectedYear);
            setData(stats || generateMockData(selectedYear));
        };
        loadStats();

        const fetchLeaderboard = async () => {
            const lbData = await api.getLeaderboard(activeTab === 'TopPerformers' ? 'All' : selectedYear.toString());
            setLeaderboard(lbData);
        };
        fetchLeaderboard();

        const fetchStudents = async () => {
            const all = await api.getStudents();
            setStudents(all.filter(s => s.year === selectedYear.toString()));
        }
        fetchStudents();
    }
  }, [selectedYear, activeTab]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (selectedYear && data) {
        // --- Year Dashboard Export ---
        
        // 1. Summary Sheet
        const summaryData = [
            ["Metric", "Value"],
            ["Total Students", data.totalStudents],
            ["Avg Attendance", `${Math.round((data.attendance.above75 / data.totalStudents) * 100)}%`],
            ["Pass Rate", `${Math.round((data.internal2.pass / data.totalStudents) * 100)}%`],
            ["Completed Internships", data.internship?.completed || 0]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // 2. Student Directory Sheet
        if (students.length > 0) {
            const studentRows = students.map(s => ({
                "Roll No": s.rollNo,
                "Name": s.name,
                "Attendance %": s.attendance,
                "Internal 1": s.internal1,
                "Internal 2": s.internal2,
                "Avg Marks": Math.round((s.internal1 + s.internal2) / 2),
                "Status": (s.attendance < 75 || s.internal1 < 50) ? "At Risk" : "Good"
            }));
            const wsStudents = XLSX.utils.json_to_sheet(studentRows);
            XLSX.utils.book_append_sheet(wb, wsStudents, "Student Directory");
        }

        XLSX.writeFile(wb, `Year_${selectedYear}_Report.xlsx`);
    } else {
        // --- Overview Export ---
        const filtered = overallLeaderboard.filter(l => 
            leaderboardFilter === 'All' ? true : l.year_level === leaderboardFilter
        );
        
        const lbRows = filtered.map(l => ({
            "Rank": l.rank,
            "Student Name": l.student_name,
            "Roll No": l.roll_no,
            "Year": l.year_level,
            "Total Points": l.total_points
        }));

        const wsLb = XLSX.utils.json_to_sheet(lbRows);
        XLSX.utils.book_append_sheet(wb, wsLb, "Leaderboard");
        
        XLSX.writeFile(wb, `Department_Overview_${leaderboardFilter === 'All' ? 'All_Years' : `Year_${leaderboardFilter}`}.xlsx`);
    }
  };

  // --- OVERVIEW VIEW (Big Buttons) ---
  if (!selectedYear) {
      const years = [
          { id: 1, label: 'First Year', watermark: '1', icon: GraduationCap },
          { id: 2, label: 'Second Year', watermark: '2', icon: BookOpen },
          { id: 3, label: 'Third Year', watermark: '3', icon: Briefcase },
          { id: 4, label: 'Fourth Year', watermark: '4', icon: Trophy },
      ];

      const filteredLeaderboard = overallLeaderboard.filter(l => 
          leaderboardFilter === 'All' ? true : l.year_level === leaderboardFilter
      );

      return (
          <div id="dashboard-content" className="space-y-10 animate-in fade-in duration-500 bg-[#f0f2f5] p-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="text-center md:text-left">
                      <h1 className="text-3xl font-extrabold text-[#002147]">Department Analytics</h1>
                      <p className="text-gray-500 mt-2">Select an academic year to view detailed performance metrics</p>
                  </div>
                  <button 
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg font-medium hover:bg-green-50 shadow-sm transition-colors"
                  >
                      <FileSpreadsheet className="w-4 h-4" /> Export Excel
                  </button>
              </div>

              {/* Big Buttons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {years.map((y) => (
                      <button 
                          key={y.id}
                          onClick={() => onYearChange(y.id)}
                          className="relative w-full max-w-[260px] aspect-square text-left bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col justify-between mx-auto"
                      >
                          {/* Watermark Number */}
                          <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[9rem] font-bold text-gray-50 leading-none select-none z-0 pointer-events-none group-hover:text-gray-100 transition-colors duration-300">
                              {y.watermark}
                          </div>

                          <div className="relative z-10 flex flex-col h-full justify-between">
                              {/* Icon */}
                              <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                  <y.icon className="w-6 h-6" />
                              </div>

                              {/* Text */}
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{y.label}</h3>
                                <p className="text-gray-400 text-xs font-medium">View academic report</p>
                              </div>

                              {/* Link */}
                              <div className="text-violet-600 font-bold text-xs flex items-center gap-2">
                                  View Dashboard <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                              </div>
                          </div>
                      </button>
                  ))}
              </div>

              {/* Overall Leaderboard */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-12">
                  <div className="p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                              <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-gray-900">Department Leaderboard</h3>
                              <p className="text-sm text-gray-500">Top students across all academic years</p>
                          </div>
                      </div>
                      
                      {/* Filter Button */}
                      <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 hover:border-violet-300 transition-colors">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select 
                            value={leaderboardFilter}
                            onChange={(e) => setLeaderboardFilter(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer pr-2"
                        >
                            <option value="All">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-8 py-5">Rank</th>
                                <th className="px-8 py-5">Student Name</th>
                                <th className="px-8 py-5">Year</th>
                                <th className="px-8 py-5 text-center">Score</th>
                                <th className="px-8 py-5 text-center">Total Points</th>
                                <th className="px-8 py-5 text-center">Badge</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLeaderboard.length > 0 ? (
                                filteredLeaderboard.slice(0, 5).map((student, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                                student.rank === 1 ? 'bg-[#fef9c3] text-[#a16207]' :
                                                student.rank === 2 ? 'bg-[#f3f4f6] text-[#4b5563]' :
                                                student.rank === 3 ? 'bg-[#ffedd5] text-[#c2410c]' :
                                                'bg-white border border-gray-200 text-gray-400'
                                            }`}>
                                                {student.rank}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-bold uppercase">
                                                    {student.student_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{student.student_name}</div>
                                                    <div className="text-xs text-gray-400">{student.roll_no}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-gray-500 font-medium">
                                                Year {student.year_level}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {/* Visual Score Bar just for aesthetics in table */}
                                            <div className="w-24 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(student.total_points, 100)}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center font-bold text-violet-600 text-lg">{student.total_points}</td>
                                        <td className="px-8 py-5 text-center">
                                            {student.rank <= 3 ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                                                    <Star className="w-3 h-3 mr-1 fill-current" /> Top 3
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">Member</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No students found for this filter</td></tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      );
  }

  // --- DETAIL VIEW (Specific Year) ---
  
  // Chart Data Preparation
  const passData = data ? [
    { name: 'Pass', value: data.internal2.pass, color: COLORS.primary },
    { name: 'Fail', value: data.internal2.fail, color: '#e5e7eb' }
  ] : [];

  const internal1Data = data ? [
    { name: 'Pass', value: data.internal1.pass, color: '#10b981' },
    { name: 'Fail', value: data.internal1.fail, color: '#ef4444' }
  ] : [];

  const internal2Data = data ? [
    { name: 'Pass', value: data.internal2.pass, color: '#8b5cf6' },
    { name: 'Fail', value: data.internal2.fail, color: '#ef4444' }
  ] : [];

  const cgpaData = data ? [
    { name: 'A+', value: data.cgpa.aPlus }, { name: 'A', value: data.cgpa.a },
    { name: 'B+', value: data.cgpa.bPlus }, { name: 'B', value: data.cgpa.b },
    { name: 'C', value: data.cgpa.c }, { name: 'F', value: data.cgpa.f }
  ] : [];

  const StatCard = ({ title, value, icon: Icon }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="p-3 bg-violet-50 rounded-lg text-violet-600">
            <Icon className="w-5 h-5" />
        </div>
    </div>
  );

  return (
    <div id="dashboard-content" className="space-y-8 animate-in slide-in-from-right duration-300 bg-[#f0f2f5] p-2">
      
      {/* Header & Navigation */}
      <div>
        <button 
            onClick={() => onYearChange(null)}
            className="flex items-center text-sm text-gray-500 hover:text-[#002147] mb-4 font-medium transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Overview
        </button>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Year {selectedYear} Dashboard</h1>
                <p className="text-gray-500">Detailed performance analytics and student records.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                <button 
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg font-medium hover:bg-green-50 shadow-sm transition-colors"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Export Excel
                </button>
                <div className="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                    {['Analytics', 'Leaderboards', 'TopPerformers'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === tab 
                                ? 'bg-violet-600 text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {tab === 'TopPerformers' ? 'Top Performers' : tab}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {/* Content Area */}
      {activeTab === 'Analytics' && (
        <div className="space-y-8">
            {/* Stats Grid */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Students" value={data.totalStudents} icon={Users} />
                    <StatCard title="Avg Attendance" value={`${Math.round((data.attendance.above75 / data.totalStudents) * 100)}%`} icon={CheckCircle} />
                    <StatCard title="Pass Rate" value={`${Math.round((data.internal2.pass / data.totalStudents) * 100)}%`} icon={BookOpen} />
                    <StatCard title="Internships" value={data.internship?.completed || 'N/A'} icon={Briefcase} />
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CGPA Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">CGPA Distribution</h3>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cgpaData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pass/Fail Donut */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-800 mb-4 self-start w-full">Overall Performance</h3>
                    <div className="w-48 h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={passData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={5}
                                >
                                    {passData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-gray-900">
                                {data && Math.round((data.internal2.pass / data.totalStudents) * 100)}%
                            </span>
                            <span className="text-xs text-gray-500 uppercase font-medium">Passing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Internal Assessment Charts */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Internal 1 Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <h3 className="font-bold text-gray-800 mb-2 self-start">Internal Assessment 1</h3>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={internal1Data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {internal1Data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-2">
                             <span className="text-2xl font-bold text-gray-900">
                                {Math.round((data.internal1.pass / data.totalStudents) * 100)}%
                            </span>
                            <span className="text-xs text-gray-500 block uppercase font-medium">Pass Rate</span>
                        </div>
                    </div>

                    {/* Internal 2 Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <h3 className="font-bold text-gray-800 mb-2 self-start">Internal Assessment 2</h3>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={internal2Data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {internal2Data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="text-center mt-2">
                             <span className="text-2xl font-bold text-gray-900">
                                {Math.round((data.internal2.pass / data.totalStudents) * 100)}%
                            </span>
                            <span className="text-xs text-gray-500 block uppercase font-medium">Pass Rate</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Directory for Selected Year */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Student Directory - Year {selectedYear}</h3>
                    <button className="text-sm text-violet-600 font-medium hover:underline">View All Details</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Roll No</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Attendance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Avg Marks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length > 0 ? students.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{s.rollNo}</td>
                                    <td className="px-6 py-4 text-gray-600">{s.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                <div 
                                                    className={`h-1.5 rounded-full ${s.attendance < 75 ? 'bg-red-500' : 'bg-green-500'}`} 
                                                    style={{ width: `${s.attendance}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{s.attendance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {s.attendance < 75 || s.internal1 < 50 ? (
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center w-fit gap-1">
                                                <AlertCircle className="w-3 h-3" /> At Risk
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center w-fit gap-1">
                                                <CheckCircle className="w-3 h-3" /> Good
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-700">
                                        {Math.round((s.internal1 + s.internal2) / 2)}%
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400 italic">No students found for Year {selectedYear}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {(activeTab === 'Leaderboards' || activeTab === 'TopPerformers') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                        {activeTab === 'TopPerformers' ? 'Department Top Performers' : `Year ${selectedYear} Leaderboard`}
                    </h3>
                    <p className="text-gray-500 text-sm">Based on accumulated achievement points</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Year</th>
                            <th className="px-6 py-4 text-right">Points</th>
                            <th className="px-6 py-4 text-center">Status</th>
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
                                        <div>
                                            <div className="font-semibold text-gray-900">{student.student_name}</div>
                                            <div className="text-xs text-gray-500">{student.roll_no}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{student.year_level}</td>
                                    <td className="px-6 py-4 text-right font-bold text-violet-600">{student.total_points}</td>
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
                            <tr><td colSpan={5} className="text-center py-8 text-gray-400">No data available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;
