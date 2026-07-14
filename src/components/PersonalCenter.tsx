import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface PersonalCenterProps {
  lang: Language;
  onExit: () => void;
  onLangChange?: (lang: Language) => void;
  onSavePreferences?: (preferences: { theme: string; aiStyle: string; mbuStrategy: string }) => void;
}

export const PersonalCenter: React.FC<PersonalCenterProps> = ({ lang, onExit, onLangChange, onSavePreferences }) => {
  // --- Profile Fields ---
  const [name, setName] = useState('李明');
  const [position, setPosition] = useState('高级钻井地质专家');
  const [department, setDepartment] = useState('勘探开发研究院 - 地质研究所');
  const [employeeId, setEmployeeId] = useState('CN-2024098');
  const [email, setEmail] = useState('ming.li@juradata.com');
  const [phone, setPhone] = useState('+86 138-1234-5678');
  const [avatar, setAvatar] = useState<string | null>(null);

  const registerTime = '2024-01-15 09:00';
  const lastLoginTime = '2026-07-01 23:15';

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Initial values to detect changes for personal info manual save
  const [initialProfile, setInitialProfile] = useState({
    name: '李明',
    position: '高级钻井地质专家',
    department: '勘探开发研究院 - 地质研究所',
    employeeId: 'CN-2024098',
    email: 'ming.li@juradata.com',
    phone: '+86 138-1234-5678',
    avatar: null as string | null
  });

  // --- Password Fields ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // --- Preferences (Auto-save) ---
  const [theme, setTheme] = useState(() => localStorage.getItem('personal-theme') || 'light');
  const [aiStyle, setAiStyle] = useState(() => localStorage.getItem('personal-ai-style') || 'standard');
  const [mbuStrategy, setMbuStrategy] = useState(() => localStorage.getItem('personal-mbu-strategy') || 'adaptive');

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Global Change/Unsaved Detection
  const hasProfileChanges = 
    name !== initialProfile.name ||
    position !== initialProfile.position ||
    department !== initialProfile.department ||
    employeeId !== initialProfile.employeeId ||
    email !== initialProfile.email ||
    phone !== initialProfile.phone ||
    avatar !== initialProfile.avatar;

  const hasPasswordChanges = currentPassword !== '' || newPassword !== '' || confirmPassword !== '';

  const showGlobalUnsavedHint = hasProfileChanges;

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Auto-save Preferences to LocalStorage and apply Theme
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('personal-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    triggerToast(lang === 'zh' ? '主题模式已自动保存并生效' : 'Theme mode auto-saved and applied');
  };

  const handleAiStyleChange = (newStyle: string) => {
    setAiStyle(newStyle);
    localStorage.setItem('personal-ai-style', newStyle);
    triggerToast(lang === 'zh' ? 'AI回答风格已自动更新' : 'AI response style auto-saved');
  };

  const handleMbuStrategyChange = (newStrategy: string) => {
    setMbuStrategy(newStrategy);
    localStorage.setItem('personal-mbu-strategy', newStrategy);
    triggerToast(lang === 'zh' ? 'MBU策略偏好已自动生效' : 'MBU strategy preference auto-saved');
  };

  // Manual save for Personal Info
  const handleSaveProfile = () => {
    setInitialProfile({
      name,
      position,
      department,
      employeeId,
      email,
      phone,
      avatar
    });
    setIsEditingProfile(false);
    triggerToast(lang === 'zh' ? '个人信息保存成功' : 'Profile saved successfully');
  };

  // Manual save for Password
  const handleSavePassword = () => {
    // Validation
    if (!currentPassword) {
      setPasswordError(lang === 'zh' ? '请输入当前密码' : 'Please enter current password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(lang === 'zh' ? '新密码长度必须不少于 8 位' : 'New password must be at least 8 characters');
      return;
    }
    // Check digits + letter
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasDigit) {
      setPasswordError(lang === 'zh' ? '新密码必须包含数字和字母' : 'New password must contain both letters and numbers');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(lang === 'zh' ? '两次输入的新密码不一致' : 'Passwords do not match');
      return;
    }

    // Success
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast(lang === 'zh' ? '密码修改成功' : 'Password changed successfully');
  };

  // Global Save Button Action
  const handleGlobalSave = () => {
    let savedSomething = false;

    if (hasProfileChanges) {
      handleSaveProfile();
      savedSomething = true;
    }

    if (hasPasswordChanges) {
      // If user filled password, validate and save
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError(lang === 'zh' ? '请完整填写所有密码字段' : 'Please fill out all password fields');
        triggerToast(lang === 'zh' ? '保存失败，密码信息未完整填写' : 'Save failed: incomplete password info', 'error');
        return;
      }
      handleSavePassword();
      savedSomething = true;
    }

    if (!savedSomething) {
      triggerToast(lang === 'zh' ? '所有个性化配置已经是最新的' : 'All preferences are already up to date');
    }
  };

  // Avatar Upload Simulation
  const handleAvatarClick = () => {
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    ];
    // Cycle or pick a random avatar
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setAvatar(randomAvatar);
    triggerToast(lang === 'zh' ? '头像上传成功' : 'Avatar uploaded successfully');
  };

  // Check password rules live
  const newPasswordLenValid = newPassword.length >= 8;
  const newPasswordLetterAndNumValid = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);

  return (
    <div className="flex-1 h-full bg-slate-50 flex flex-col overflow-hidden relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border text-sm font-semibold transition-all ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-rose-500'}`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Section */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-user-cog text-blue-600 text-base" />
              {lang === 'zh' ? '个人中心' : 'Personal Center'}
            </h1>
            <p className="text-xs text-slate-400">
              {lang === 'zh' ? '管理您的个人信息、账号安全与 AI 个性化策略配置' : 'Manage your profile, security, and AI response preferences'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showGlobalUnsavedHint && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 font-medium animate-pulse">
              <i className="fas fa-exclamation-triangle mr-1" />
              {lang === 'zh' ? '有未保存的信息' : 'Unsaved information'}
            </span>
          )}
          <button
            onClick={handleGlobalSave}
            className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              showGlobalUnsavedHint 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/40'
            }`}
          >
            <i className="fas fa-save" />
            {lang === 'zh' ? '保存配置' : 'Save Configurations'}
          </button>
        </div>
      </header>

      {/* Single Scrollable Panel Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          
          {/* ① PROFILE CARD - Top Left */}
          <section className="md:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md h-fit">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <h2 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '个人信息区' : 'Profile Details'}</h2>
              </div>
              <button
                onClick={() => {
                  if (isEditingProfile) {
                    // Save action
                    handleSaveProfile();
                  } else {
                    setIsEditingProfile(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                  isEditingProfile 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <i className={`fas ${isEditingProfile ? 'fa-check' : 'fa-edit'}`} />
                {isEditingProfile ? (lang === 'zh' ? '保存资料' : 'Save Profile') : (lang === 'zh' ? '编辑资料' : 'Edit Profile')}
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-6 items-center">
                {/* Avatar area */}
                <div className="flex flex-col items-center gap-2">
                  <div 
                    onClick={handleAvatarClick}
                    className="group relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-black border-4 border-white shadow-md transition-transform active:scale-95"
                    title={lang === 'zh' ? '点击上传/更换头像' : 'Click to change avatar'}
                  >
                    {avatar ? (
                      <img referrerPolicy="no-referrer" src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{name.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-bold">
                      <i className="fas fa-camera text-base mb-1 animate-none" />
                      {lang === 'zh' ? '更换头像' : 'Change'}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{lang === 'zh' ? '支持 JPG/PNG 格式' : 'Supports JPG/PNG'}</span>
                </div>

                {/* Fields details */}
                <div className="flex-1 flex flex-col gap-4 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'zh' ? '姓名' : 'Full Name'}</label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                      />
                    ) : (
                      <div className="text-sm font-bold text-slate-700">{name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'zh' ? '工号' : 'Employee ID'}</label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={employeeId} 
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" 
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700 font-mono">{employeeId}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'zh' ? '职位' : 'Job Title'}</label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={position} 
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700">{position}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'zh' ? '所属组织' : 'Organization / Department'}</label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" 
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700">{department}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'zh' ? '账号邮箱' : 'Email Address'}</label>
                    {isEditingProfile ? (
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" 
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700 font-mono">{email}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'zh' ? '手机号码' : 'Phone Number'}</label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono" 
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700 font-mono">{phone}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{lang === 'zh' ? '账户密码' : 'Account Password'}</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700 font-mono">••••••••</span>
                      <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      >
                        <i className="fas fa-key text-[10px]" />
                        {lang === 'zh' ? '修改密码' : 'Change Password'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-[11px] text-slate-400 font-medium">
                    <div>
                      <span>{lang === 'zh' ? '注册时间：' : 'Register Time: '}</span>
                      <span className="text-slate-600 font-mono">{registerTime}</span>
                    </div>
                    <div className="text-right">
                      <span>{lang === 'zh' ? '最近登录：' : 'Last Login: '}</span>
                      <span className="text-slate-600 font-mono">{lastLoginTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ② PREFERENCES SECTION - To the right and bottom */}
          <section className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                <h2 className="text-sm font-bold text-slate-800">{lang === 'zh' ? '个性化配置区' : 'Preferences'}</h2>
              </div>
            </div>

            <div className="p-6 space-y-6 divide-y divide-slate-100">
              
              {/* Language Preference */}
              <div className="pb-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i className="fas fa-language text-slate-400" />
                      {lang === 'zh' ? '界面语言（Language Preference）' : 'Language Preference'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'zh' ? '选择您偏好的系统显示语言（实时保存）' : 'Select your preferred display language (Auto-saved)'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {lang === 'zh' ? '自动保存' : 'Auto Save'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      if (onLangChange) onLangChange('zh');
                      triggerToast(lang === 'zh' ? '系统显示语言已切换为中文' : 'System display language switched to Chinese');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      lang === 'zh' 
                        ? 'border-blue-500 bg-blue-50/30 text-blue-800 shadow-sm ring-2 ring-blue-500/20' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      lang === 'zh' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      中
                    </div>
                    <div>
                      <div className="text-xs font-bold">简体中文</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">中文（简体）界面显示</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (onLangChange) onLangChange('en');
                      triggerToast(lang === 'zh' ? 'Language switched to English' : 'Language switched to English');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      lang === 'en' 
                        ? 'border-blue-500 bg-blue-50/30 text-blue-800 shadow-sm ring-2 ring-blue-500/20' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      lang === 'en' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      EN
                    </div>
                    <div>
                      <div className="text-xs font-bold">English</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">English interface display</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Theme Mode */}
              <div className="py-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i className="fas fa-adjust text-slate-400" />
                      {lang === 'zh' ? '主题模式（Theme Mode）' : 'Theme Mode'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'zh' ? '选择您偏好的系统界面风格（实时保存）' : 'Select your preferred visual style (Auto-saved)'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {lang === 'zh' ? '自动保存' : 'Auto Save'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      theme === 'light' 
                        ? 'border-blue-500 bg-blue-50/30 text-blue-800 shadow-sm ring-2 ring-blue-500/20' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                      theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <i className="fas fa-sun" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{lang === 'zh' ? '☀️ 浅色模式（默认）' : '☀️ Light Mode (Default)'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{lang === 'zh' ? '明亮、清晰，适合白天办公' : 'Bright and clean for daytime usage'}</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-blue-500 bg-blue-50/30 text-blue-800 shadow-sm ring-2 ring-blue-500/20' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                      theme === 'dark' ? 'bg-indigo-900 text-indigo-400' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <i className="fas fa-moon" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{lang === 'zh' ? '🌙 深色模式' : '🌙 Dark Mode'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{lang === 'zh' ? '低眩光暗黑，保护夜间视力' : 'Dimmable layout to reduce eye strain'}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* AI Response Style */}
              <div className="py-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i className="fas fa-robot text-slate-400" />
                      {lang === 'zh' ? 'AI 回答风格（AI Response Style）' : 'AI Response Style'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'zh' ? '设定大模型智能助手的推理和输出颗粒度' : 'Configure the output grain and tone of your AI assistant'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {lang === 'zh' ? '自动保存' : 'Auto Save'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'concise',
                      title: lang === 'zh' ? '简洁' : 'Concise',
                      desc: lang === 'zh' ? '关键词式回答 / 直达结论' : 'Direct conclusions with keyword points',
                      tooltip: lang === 'zh' ? '过滤冗余词汇，最快速地提供精准技术结论。' : 'Skip explanations, delivering the immediate facts first.'
                    },
                    {
                      id: 'standard',
                      title: lang === 'zh' ? '标准（默认）' : 'Standard (Default)',
                      desc: lang === 'zh' ? '结构化回答 + 适中解释' : 'Structured logic with decent details',
                      tooltip: lang === 'zh' ? '遵循标准的学术/工程格式回答，兼顾可读性与严谨度。' : 'Industrial-standard documentation with balanced reasoning.'
                    },
                    {
                      id: 'detailed',
                      title: lang === 'zh' ? '详细' : 'Detailed',
                      desc: lang === 'zh' ? '深度解释 + 补充上下文' : 'Deep breakdown and expanded contexts',
                      tooltip: lang === 'zh' ? '提供全面的公式、地质机理说明及边缘引用，适合深度撰稿。' : 'Complete scientific theories, background and citation.'
                    }
                  ].map((style) => (
                    <div 
                      key={style.id}
                      onClick={() => handleAiStyleChange(style.id)}
                      className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        aiStyle === style.id 
                          ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900 ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {/* Info Tooltip Indicator */}
                      <div className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 group-hover:block transition-all">
                        <i className="fas fa-info-circle text-xs" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl z-20 font-medium normal-case leading-relaxed">
                          {style.tooltip}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${aiStyle === style.id ? 'bg-emerald-500' : 'bg-transparent border border-slate-300'}`} />
                        <span className="text-xs font-bold">{style.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{style.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* MBU Strategy Preference */}
              <div className="pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <i className="fas fa-project-diagram text-slate-400" />
                      {lang === 'zh' ? 'MBU策略偏好（MBU Strategy Preference）' : 'MBU Strategy Preference'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'zh' ? '设定系统推荐和组织成果包在 MBU 边界上的规则策略' : 'Determine rule strategies for MBU boundaries in results'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {lang === 'zh' ? '自动保存' : 'Auto Save'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'strict',
                      title: lang === 'zh' ? '严格匹配' : 'Strict Matching',
                      desc: lang === 'zh' ? '严格按照MBU模板输出' : 'Strict MBU framework outputs',
                      hover: lang === 'zh' ? '严格对齐4D（业务域/工作域/对象域/专业域）标准结构。' : 'Forces alignment to the strict 4D MBU metadata structure.'
                    },
                    {
                      id: 'adaptive',
                      title: lang === 'zh' ? '自适应（默认）' : 'Adaptive (Default)',
                      desc: lang === 'zh' ? '根据上下文调整结构' : 'Context-aware dynamic layouts',
                      hover: lang === 'zh' ? '根据具体的会话和资源动态推荐最合适的结构单元。' : 'Intelligently customizes structured templates based on search density.'
                    },
                    {
                      id: 'creative',
                      title: lang === 'zh' ? '创新增强' : 'Creative Enhancement',
                      desc: lang === 'zh' ? '在MBU基础上自动扩展' : 'Automatic extrapolation beyond MBU',
                      hover: lang === 'zh' ? '突破传统MBU边界，探索并生成相关的交叉学科见解。' : 'Suggests novel interdisciplinary correlations outside original boundaries.'
                    }
                  ].map((strat) => (
                    <div 
                      key={strat.id}
                      onClick={() => handleMbuStrategyChange(strat.id)}
                      className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        mbuStrategy === strat.id 
                          ? 'border-indigo-500 bg-indigo-50/20 text-indigo-900 ring-2 ring-indigo-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {/* Hover details */}
                      <div className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                        <i className="fas fa-question-circle text-xs" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl z-20 font-medium leading-relaxed">
                          {strat.hover}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${mbuStrategy === strat.id ? 'bg-indigo-500' : 'bg-transparent border border-slate-300'}`} />
                        <span className="text-xs font-bold">{strat.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{strat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* PAGE FOOTER */}
          <footer className="md:col-span-3 text-center py-4 text-slate-400 text-xs">
            <div>JuraWorkSpace Client v2.8.4-build.20260701</div>
            <div className="text-[10px] mt-1 text-slate-300">© 2026 JuraData Inc. All Rights Reserved.</div>
          </footer>

        </div>
      </div>
      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsPasswordModalOpen(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 z-50"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-violet-600 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-800">
                    {lang === 'zh' ? '修改账户密码' : 'Change Password'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <i className="fas fa-times" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{lang === 'zh' ? '当前密码' : 'Current Password'}</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={lang === 'zh' ? '请输入当前密码' : 'Enter current password'}
                      className="w-full pl-3 pr-10 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-mono" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{lang === 'zh' ? '新密码' : 'New Password'}</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-mono" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{lang === 'zh' ? '确认新密码' : 'Confirm New Password'}</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-mono" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>

                {/* Password Validation Specs */}
                {newPassword && (
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-slate-500">{lang === 'zh' ? '新密码实时校验：' : 'Live Validation: '}</span>
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className={`flex items-center gap-1.5 ${newPasswordLenValid ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                        <i className={`fas ${newPasswordLenValid ? 'fa-check-circle text-emerald-500' : 'fa-circle'}`} />
                        {lang === 'zh' ? '长度不少于 8 位' : 'Length ≥ 8 characters'}
                      </span>
                      <span className={`flex items-center gap-1.5 ${newPasswordLetterAndNumValid ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                        <i className={`fas ${newPasswordLetterAndNumValid ? 'fa-check-circle text-emerald-500' : 'fa-circle'}`} />
                        {lang === 'zh' ? '必须包含数字和字母' : 'Must contain both letters and numbers'}
                      </span>
                    </div>
                  </div>
                )}

                {passwordError && (
                  <div className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
                    <i className="fas fa-exclamation-circle" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    if (!currentPassword) {
                      setPasswordError(lang === 'zh' ? '请输入当前密码' : 'Please enter current password');
                      return;
                    }
                    if (newPassword.length < 8) {
                      setPasswordError(lang === 'zh' ? '新密码长度必须不少于 8 位' : 'New password must be at least 8 characters');
                      return;
                    }
                    const hasLetter = /[a-zA-Z]/.test(newPassword);
                    const hasDigit = /[0-9]/.test(newPassword);
                    if (!hasLetter || !hasDigit) {
                      setPasswordError(lang === 'zh' ? '新密码必须包含数字和字母' : 'New password must contain both letters and numbers');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setPasswordError(lang === 'zh' ? '两次输入的新密码不一致' : 'Passwords do not match');
                      return;
                    }

                    setPasswordError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setIsPasswordModalOpen(false);
                    triggerToast(lang === 'zh' ? '密码修改成功' : 'Password changed successfully');
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shadow-violet-100"
                >
                  {lang === 'zh' ? '确认修改' : 'Confirm Change'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
