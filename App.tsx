
import React, { useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import HODDashboard from './components/HODDashboard';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import StudentDashboard from './components/StudentDashboard';
import { Role } from './types';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [hodSelectedYear, setHodSelectedYear] = useState<number | null>(null); // Default to Overview (null)
  const [studentActiveTab, setStudentActiveTab] = useState<'Dashboard' | 'Upload' | 'Leaderboard'>('Dashboard');
  const [staffActiveTab, setStaffActiveTab] = useState<'MARKS' | 'ATTENDANCE' | 'VERIFICATION'>('MARKS');

  const handleLogin = (role: Role, email: string) => {
    setUserRole(role);
    setUserEmail(email);
    setStudentActiveTab('Dashboard');
    setStaffActiveTab('MARKS');
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserEmail('');
    setHodSelectedYear(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      userRole={userRole} 
      email={userEmail} 
      onLogout={handleLogout}
      selectedYear={hodSelectedYear}
      onYearSelect={setHodSelectedYear}
      studentActiveTab={studentActiveTab}
      onStudentNavigate={setStudentActiveTab}
      staffActiveTab={staffActiveTab}
      onStaffNavigate={setStaffActiveTab}
    >
      <div className="animate-in fade-in duration-500">
        {userRole === 'HOD' && <HODDashboard selectedYear={hodSelectedYear} onYearChange={setHodSelectedYear} />}
        {userRole === 'Admin' && <AdminDashboard />}
        {userRole === 'Staff' && <StaffDashboard currentUserEmail={userEmail} activeTab={staffActiveTab} onTabChange={setStaffActiveTab} />}
        {userRole === 'Student' && <StudentDashboard currentUserEmail={userEmail} activeTab={studentActiveTab} onTabChange={setStudentActiveTab} />}
      </div>
    </Layout>
  );
};

export default App;
