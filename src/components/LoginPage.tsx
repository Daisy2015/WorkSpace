import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';

interface LoginPageProps {
  lang: Language;
  onLogin: (username: string) => void;
  onLangChange: (lang: Language) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ lang, onLogin, onLangChange }) => {
  const [username, setUsername] = useState('李明');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(lang === 'zh' ? '用户名不能为空' : 'Username cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate a brief, satisfying login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(username);
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-between p-6 overflow-hidden relative text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Top Header Row with Language switcher */}
      <div className="flex justify-between items-center z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white text-lg">J</span>
          </div>
          <span className="font-bold text-white/90 text-lg tracking-tight">
            JuraWorkSpace
          </span>
        </div>

        <button
          onClick={() => onLangChange(lang === 'zh' ? 'en' : 'zh')}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <i className="fas fa-globe text-white/60"></i>
          {lang === 'zh' ? 'English' : '中文'}
        </button>
      </div>

      {/* Main Login Card Section */}
      <div className="flex-1 flex items-center justify-center z-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black/40 flex flex-col"
        >
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              {lang === 'zh' ? '欢迎回来' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-slate-400">
              {lang === 'zh' 
                ? '以 “最小业务单元” 为边界的智能协同工作空间' 
                : 'Intelligent collaborative workspace built on Minimum Business Units'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {lang === 'zh' ? '用户名 / 邮箱' : 'Username or Email'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <i className="fas fa-user text-sm"></i>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 hover:bg-slate-950/60 focus:bg-slate-950/80 border border-white/5 focus:border-indigo-500/50 rounded-2xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                  placeholder={lang === 'zh' ? '请输入用户名' : 'Enter your username'}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {lang === 'zh' ? '密码' : 'Password'}
                </label>
                <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  {lang === 'zh' ? '忘记密码？' : 'Forgot?'}
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <i className="fas fa-lock text-sm"></i>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 hover:bg-slate-950/60 focus:bg-slate-950/80 border border-white/5 focus:border-indigo-500/50 rounded-2xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                  placeholder={lang === 'zh' ? '请输入密码' : 'Enter your password'}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-400 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl"
              >
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  {lang === 'zh' ? '正在登录...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {lang === 'zh' ? '立即登录' : 'Sign In'}
                  <i className="fas fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </form>

          {/* Prompt/Guide */}
          <div className="mt-8 text-center text-xs text-slate-500 border-t border-white/5 pt-4">
            {lang === 'zh' ? '测试账号已就绪，一键登录即可体验' : 'Demo account ready, click button to sign in'}
          </div>
        </motion.div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-500 z-10 w-full max-w-7xl mx-auto">
        &copy; {new Date().getFullYear()} JuraWorkSpace. {lang === 'zh' ? '智能石油勘探与生产管理工作空间 V2.0' : 'Intelligent Petroleum Exploration & Production Workspace V2.0'}
      </div>
    </div>
  );
};
