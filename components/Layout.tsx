
import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Users, UserCog, FileText, CheckCircle, Upload, Calendar } from 'lucide-react';
import { Role } from '../types';
import { api } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  userRole: Role;
  onLogout: () => void;
  email: string;
  selectedYear?: number | null;
  onYearSelect?: (year: number | null) => void;
  studentActiveTab?: 'Dashboard' | 'Upload' | 'Leaderboard';
  onStudentNavigate?: (tab: 'Dashboard' | 'Upload' | 'Leaderboard') => void;
  staffActiveTab?: 'MARKS' | 'ATTENDANCE' | 'VERIFICATION';
  onStaffNavigate?: (tab: 'MARKS' | 'ATTENDANCE' | 'VERIFICATION') => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userRole, 
  onLogout, 
  email, 
  selectedYear, 
  onYearSelect,
  studentActiveTab,
  onStudentNavigate,
  staffActiveTab,
  onStaffNavigate
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
        const settings = await api.getInstitutionSettings();
        if (settings.logoUrl) setLogoUrl(settings.logoUrl);
    };
    fetchSettings();

    // Subscribe to changes
    const unsubscribe = api.subscribeToSettings((newSettings) => {
        setLogoUrl(newSettings.logoUrl);
    });
    return () => unsubscribe();
  }, []);

  const getDisplayName = () => {
    if (userRole === 'HOD') return 'Dr. Ramesh Kumar';
    if (userRole === 'Admin') return 'Admin User';
    if (userRole === 'Staff') return 'Prof. Priya Sharma';
    return email.split('@')[0] || 'Student';
  };

  const NavItem = ({ label, icon: Icon, active = false, onClick }: { label: string; icon: any; active?: boolean; onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-[#0088cc]/10 text-[#0088cc] font-semibold border-r-4 border-[#0088cc]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#002147]'}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100 h-[70px] flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-md text-[#002147]">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3">
              {/* NGP Logo */}
              {logoUrl ? (
                   <img src={logoUrl} alt="Institution Logo" className="w-10 h-10 shrink-0 rounded-full object-cover border-2 border-[#fdb913]" />
              ) : (
                  <div className="w-10 h-10 shrink-0 bg-[#002147] rounded-full border-2 border-[#fdb913] flex items-center justify-center shadow-sm relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                     <span className="text-white font-black text-xs tracking-tighter transform scale-110 relative z-10">NGP</span>
                  </div>
              )}
              <div className="hidden sm:block">
                <h1 className="text-lg font-extrabold text-[#002147] leading-none tracking-tight">NGP iTech</h1>
                <p className="text-[10px] text-[#0088cc] font-bold tracking-widest uppercase mt-0.5">Department Portal</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-[#002147] capitalize">{getDisplayName()}</span>
              <span className="text-xs text-gray-500">{email}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              userRole === 'HOD' ? 'bg-purple-100 text-purple-800' :
              userRole === 'Admin' ? 'bg-pink-100 text-pink-800' :
              userRole === 'Staff' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {userRole}
            </span>
            <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Content Wrapper */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`absolute lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out z-20 flex flex-col h-full`}>
          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
            {userRole === 'HOD' && onYearSelect && (
              <>
                <NavItem 
                    label="Overview" 
                    icon={LayoutDashboard} 
                    active={selectedYear === null}
                    onClick={() => onYearSelect(null)} 
                />
                
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Yearly Analytics
                </div>
                
                <div className="space-y-1">
                    {[1, 2, 3, 4].map(year => (
                        <button
                            key={year}
                            onClick={() => onYearSelect(year)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                                selectedYear === year 
                                ? 'bg-[#0088cc]/10 text-[#0088cc] font-semibold border-r-4 border-[#0088cc]' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#002147]'
                            }`}
                        >
                            <span className={`flex items-center justify-center w-5 h-5 rounded border text-[10px] font-bold ${selectedYear === year ? 'border-[#0088cc] text-[#0088cc]' : 'border-gray-300 text-gray-400'}`}>
                                {year}
                            </span>
                            Year {year}
                        </button>
                    ))}
                </div>
              </>
            )}
            
            {userRole === 'Admin' && (
              <>
                <NavItem label="User Management" icon={Users} active />
                <NavItem label="Staff Allocation" icon={UserCog} />
              </>
            )}
            {userRole === 'Staff' && onStaffNavigate && (
              <>
                <NavItem 
                  label="Upload Marks" 
                  icon={FileText} 
                  active={staffActiveTab === 'MARKS'}
                  onClick={() => onStaffNavigate('MARKS')}
                />
                <NavItem 
                  label="Upload Attendance" 
                  icon={Calendar} 
                  active={staffActiveTab === 'ATTENDANCE'}
                  onClick={() => onStaffNavigate('ATTENDANCE')}
                />
                <NavItem 
                  label="Verify Certificates" 
                  icon={CheckCircle} 
                  active={staffActiveTab === 'VERIFICATION'}
                  onClick={() => onStaffNavigate('VERIFICATION')}
                />
              </>
            )}
            {userRole === 'Student' && onStudentNavigate && (
              <>
                <NavItem 
                  label="My Performance" 
                  icon={LayoutDashboard} 
                  active={studentActiveTab === 'Dashboard'} 
                  onClick={() => onStudentNavigate('Dashboard')} 
                />
                <NavItem 
                  label="Upload Documents" 
                  icon={Upload} 
                  active={studentActiveTab === 'Upload'} 
                  onClick={() => onStudentNavigate('Upload')}
                />
              </>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
             <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest"></p>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#f0f2f5] w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
