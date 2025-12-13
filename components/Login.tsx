
import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (role: Role, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    api.getInstitutionSettings().then(s => {
        if (s.logoUrl) setLogoUrl(s.logoUrl);
    });
    
    // Subscribe
    const unsubscribe = api.subscribeToSettings((newSettings) => {
        setLogoUrl(newSettings.logoUrl);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const role = await api.getUserRole(email);
      
      if (role) {
        onLogin(role, email);
      } else {
        let demoRole: Role | null = null;
        if (email.includes('hod')) demoRole = 'HOD';
        else if (email.includes('admin')) demoRole = 'Admin';
        else if (email.includes('staff') || email.includes('prof') || email.includes('dr.')) demoRole = 'Staff';
        else if (email.includes('student')) demoRole = 'Student';

        if (demoRole) {
          onLogin(demoRole, email);
        } else {
          setError('User not found. Try a demo email.');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f9fafb]">
      {/* Top Header */}
      <header className="bg-white py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between border-b border-gray-100 z-20 relative shadow-sm">
         <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
            {/* Logo: Added shrink-0 to prevent oval distortion */}
            {logoUrl ? (
                 <img src={logoUrl} alt="Logo" className="w-14 h-14 shrink-0 rounded-full object-cover border-4 border-[#fdb913] shadow-md" />
            ) : (
                <div className="w-14 h-14 shrink-0 rounded-full bg-[#002147] border-4 border-[#fdb913] flex items-center justify-center shadow-md relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                   <span className="text-white font-black text-sm tracking-tighter relative z-10">NGP</span>
                </div>
            )}
            <div>
              <h1 className="text-[#002147] font-extrabold text-lg md:text-xl leading-none tracking-tight">Dr. N.G.P. INSTITUTE OF TECHNOLOGY</h1>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold tracking-wide mt-1">COIMBATORE | APPROVED BY AICTE | AFFILIATED TO ANNA UNIVERSITY</p>
            </div>
         </div>
         {/* Right corner removed */}
      </header>
  
      {/* Main Content */}
      <div className="flex-1 bg-[#002147] relative flex items-center justify-center p-6 md:p-12 overflow-y-auto md:overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#fdb913]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-center relative z-10">
              {/* Left Side Content */}
              <div className="space-y-6 md:space-y-8 text-white lg:pr-12 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 mb-2 mx-auto lg:mx-0">
                      <span className="h-0.5 w-12 bg-[#fdb913]"></span>
                      <span className="text-[#fdb913] font-bold tracking-[0.2em] uppercase text-sm">Official Portal</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                      Department <br />
                      <span className="text-[#00aaff]">Management System</span>
                  </h1>
                  <p className="text-blue-100/80 text-base md:text-lg max-w-lg leading-relaxed mx-auto lg:mx-0">
                      A comprehensive platform for students, staff, and administration to manage academic records, attendance, and resources efficiently.
                  </p>
              </div>
  
              {/* Right Side Login Card */}
              <div className="flex justify-center lg:justify-end pb-8 lg:pb-0">
                  <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/20 w-full max-w-[440px] relative backdrop-blur-sm">
                      {/* Solid Yellow Top Border */}
                      <div className="absolute top-0 left-0 w-full h-2 bg-[#fdb913] rounded-t-3xl"></div>
                      
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-[#002147] mb-2">Sign In</h2>
                        <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
                      </div>
  
                      {error && (
                          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                              {error}
                          </div>
                      )}
  
                      <form onSubmit={handleSubmit} className="space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Email Address</label>
                              <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium"
                                  placeholder="e.g. student@college.edu"
                                  required
                              />
                          </div>
  
                          <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs text-[#002147] font-bold hover:underline">Forgot?</a>
                              </div>
                              <input
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium"
                                  placeholder="••••••••"
                                  required
                              />
                          </div>
  
                          <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold hover:bg-[#003366] transition-all shadow-lg shadow-[#002147]/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 uppercase tracking-wide text-sm"
                          >
                              {isLoading ? (
                                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              ) : (
                                  "Login"
                              )}
                          </button>
                      </form>
  
                      <div className="mt-8 pt-6 border-t border-gray-100">
                           <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase tracking-wider text-center">Available Demo Accounts</p>
                           <div className="flex flex-wrap justify-center gap-2">
                               {['student', 'staff', 'hod', 'admin'].map(role => (
                                   <button
                                      key={role}
                                      onClick={() => { setEmail(`${role}@college.edu`); setPassword('demo'); }}
                                      className="px-3 py-1.5 bg-gray-50 hover:bg-[#002147] text-gray-500 hover:text-white rounded-lg text-xs font-bold border border-gray-200 hover:border-[#002147] transition-all capitalize"
                                   >
                                      {role}
                                   </button>
                               ))}
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Login;
