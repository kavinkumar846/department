
import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { Trash2, Plus, Search, RefreshCw, BookOpen, Users, Settings, Upload, Save } from 'lucide-react';
import { api } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Users' | 'Allocation' | 'Settings'>('Users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Settings State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New User State
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '', email: '', role: 'Student', year: '1', subject: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    const data = await api.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch Settings
  useEffect(() => {
    if (activeTab === 'Settings') {
        const load = async () => {
            const settings = await api.getInstitutionSettings();
            if (settings.logoUrl) setLogoPreview(settings.logoUrl);
        };
        load();
    }
  }, [activeTab]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    await api.updateInstitutionSettings({ logoUrl: logoPreview });
    setIsSaving(false);
    alert('Configuration saved successfully!');
  };

  const handleAddUser = async () => {
    if (newUser.name && newUser.email) {
       await api.createUser(newUser as User);
       fetchUsers();
       setShowAddModal(false);
       setNewUser({ name: '', email: '', role: 'Student', year: '1', subject: '' });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Delete this user?')) {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
           <p className="text-gray-500">Manage users, permissions and system settings.</p>
        </div>
        
        <div className="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            {['Users', 'Allocation', 'Settings'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                        activeTab === tab 
                        ? 'bg-violet-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {tab === 'Users' && <Users className="w-4 h-4" />}
                    {tab === 'Allocation' && <BookOpen className="w-4 h-4" />}
                    {tab === 'Settings' && <Settings className="w-4 h-4" />}
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'Users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchUsers} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        user.role === 'Admin' ? 'bg-pink-100 text-pink-700' :
                                        user.role === 'Staff' ? 'bg-blue-100 text-blue-700' :
                                        user.role === 'HOD' ? 'bg-purple-100 text-purple-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {user.role === 'Student' ? `Year ${user.year}` : user.subject || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'Allocation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(year => {
                  const staff = users.filter(u => u.role === 'Staff' && u.year === year.toString());
                  return (
                      <div key={year} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-gray-900">Year {year} Staff</h3>
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{staff.length}</span>
                          </div>
                          <div className="space-y-3">
                              {staff.map(s => (
                                  <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                          {s.name.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                                          <p className="text-xs text-gray-500">{s.subject}</p>
                                      </div>
                                  </div>
                              ))}
                              {staff.length === 0 && <p className="text-sm text-gray-400 italic">No staff assigned.</p>}
                          </div>
                      </div>
                  )
              })}
          </div>
      )}

      {activeTab === 'Settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Institution Branding</h3>
                  <p className="text-sm text-gray-500 mb-6">Customize the look and feel of your portal.</p>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Logo Section */}
                      <div className="flex-1 space-y-4">
                          <label className="block text-sm font-bold text-gray-700">Institution Logo</label>
                          <div className="flex items-center gap-6">
                              <div className="relative group">
                                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                                      {logoPreview ? (
                                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                      ) : (
                                          <span className="text-xs text-gray-400 font-medium">No Logo</span>
                                      )}
                                  </div>
                              </div>
                              
                              <div className="flex flex-col gap-3">
                                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-violet-200 transition-all shadow-sm group">
                                      <Upload className="w-4 h-4 text-gray-500 group-hover:text-violet-600" />
                                      <span>Upload New Logo</span>
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setLogoPreview(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                      />
                                  </label>
                                  <p className="text-xs text-gray-400">JPG, PNG or SVG. Max 2MB.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Separate Button Section */}
              <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-lg font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isSaving ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : <Save className="w-4 h-4" />}
                      {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
              </div>
          </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add New User</h3>
                  <div className="space-y-4">
                      <input 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" 
                        placeholder="Full Name"
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                      />
                      <input 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" 
                        placeholder="Email"
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                          <select 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                          >
                              <option value="Student">Student</option>
                              <option value="Staff">Staff</option>
                              <option value="Admin">Admin</option>
                          </select>
                          <select 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none"
                            value={newUser.year}
                            onChange={e => setNewUser({...newUser, year: e.target.value})}
                          >
                              {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                          </select>
                      </div>
                      {newUser.role === 'Staff' && (
                          <input 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
                            placeholder="Subject"
                            value={newUser.subject}
                            onChange={e => setNewUser({...newUser, subject: e.target.value})}
                          />
                      )}
                      <div className="flex gap-3 pt-2">
                          <button onClick={handleAddUser} className="flex-1 bg-violet-600 text-white py-2 rounded-lg font-medium hover:bg-violet-700">Create</button>
                          <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
