'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import DashboardLayout from '@/components/DashboardLayout';

export default function StudentDashboard() {
  const router = useRouter();
  const { 
    currentUser, loading, logout, halaqat, sessions, plans, progressLogs, 
    evaluations, notifications, addProgressLog, markNotificationRead,
    updateProfile, theme, toggleTheme 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'log' | 'certificates' | 'settings'>('overview');
  const [activeJitsiSession, setActiveJitsiSession] = useState<string | null>(null);

  // Form states
  const [logSurah, setLogSurah] = useState('البقرة');
  const [startAyah, setStartAyah] = useState('');
  const [endAyah, setEndAyah] = useState('');
  const [pagesCount, setPagesCount] = useState('');
  const [isRevision, setIsRevision] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // Settings states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Ensure client-side authentication
  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.push('/auth');
    } else if (currentUser.role !== 'STUDENT') {
      router.push(`/dashboard/${currentUser.role.toLowerCase()}`);
    } else {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
    }
  }, [currentUser, loading]);

  if (loading || !currentUser) return null;

  // Derive stats
  const studentProfileId = 's-profile'; // Mock profile ID linked to default student
  const studentLogs = progressLogs.filter(l => l.studentId === studentProfileId);
  const studentEvaluations = evaluations.filter(e => e.studentId === studentProfileId);
  const studentPlans = plans.filter(p => p.studentId === studentProfileId);
  const activePlan = studentPlans.find(p => p.status === 'ACTIVE') || studentPlans[0];
  
  const totalPagesMemorized = studentLogs.filter(l => !l.isRevision).reduce((sum, l) => sum + l.pagesCount, 0);
  const totalPagesRevised = studentLogs.filter(l => l.isRevision).reduce((sum, l) => sum + l.pagesCount, 0);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logSurah || !startAyah || !endAyah || !pagesCount) return;
    
    addProgressLog({
      studentId: studentProfileId,
      planId: activePlan?.id,
      surah: logSurah,
      startAyah: Number(startAyah),
      endAyah: Number(endAyah),
      pagesCount: Number(pagesCount),
      isRevision,
      notes: logNotes
    });

    setLogSuccess(true);
    setStartAyah('');
    setEndAyah('');
    setPagesCount('');
    setLogNotes('');
    setTimeout(() => setLogSuccess(false), 3000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(name, phone);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200">
        
        {/* Horizontal Tab Navigation */}
        <div className="flex gap-2 pb-4 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => { setActiveSubTab('overview'); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'overview' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            📊 لوحة التحكم
          </button>
          <button
            onClick={() => { setActiveSubTab('log'); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'log' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            📖 تسجيل التقدم (التسميع)
          </button>
          <button
            onClick={() => { setActiveSubTab('certificates'); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'certificates' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🏅 شهاداتي وتقييماتي
          </button>
          <button
            onClick={() => { setActiveSubTab('settings'); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'settings' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            ⚙️ إعدادات الحساب
          </button>
        </div>

        {/* Top bar with quick actions */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-extrabold text-primary dark:text-white">
              {activeSubTab === 'overview' && 'لوحة متابعة الحفظ والمراجعة'}
              {activeSubTab === 'log' && 'رصد ورد الحفظ اليومي'}
              {activeSubTab === 'certificates' && 'سجل الدرجات والشهادات'}
              {activeSubTab === 'settings' && 'تعديل الملف الشخصي'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">طالب قرآن • رحيق القرآن</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              {theme === 'dark' ? <Icons.Sun size={18} className="text-amber-500" /> : <Icons.Moon size={18} className="text-primary" />}
            </button>
            
            {/* Notification Bell */}
            <div className="relative group">
              <button className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Icons.Bell size={18} className="text-gray-600 dark:text-gray-300" />
                {notifications.filter(n => n.userId === currentUser.id && !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-4 hidden group-hover:block z-50">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">الإشعارات الواردة</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.filter(n => n.userId === currentUser.id).length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">لا توجد إشعارات حالياً</p>
                  ) : (
                    notifications.filter(n => n.userId === currentUser.id).map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl text-xs space-y-1 cursor-pointer transition-colors ${notif.isRead ? 'bg-gray-50 dark:bg-gray-800/40 text-gray-500' : 'bg-emerald-50 dark:bg-emerald-950/20 text-gray-800 dark:text-emerald-200'}`}
                      >
                        <div className="flex justify-between font-bold">
                          <span>{notif.title}</span>
                          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                        </div>
                        <p>{notif.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Live Classroom Frame Mode */}
        {activeJitsiSession && (
          <div className="mb-8 rounded-3xl bg-black overflow-hidden shadow-2xl border border-gray-800 relative">
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="animate-pulse flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="font-bold text-sm">أنت في بث مباشر تفاعلي الآن</span>
              </div>
              <button 
                onClick={() => setActiveJitsiSession(null)} 
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                مغادرة الحصة
              </button>
            </div>
            {/* Embedded Jitsi Iframe Player */}
            <iframe 
              src={activeJitsiSession} 
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-[500px] border-none"
            ></iframe>
          </div>
        )}

        {/* Overview Tab Content */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center text-2xl">📖</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">إجمالي الصفحات المحفوظة</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalPagesMemorized} صفحة</h3>
                </div>
              </div>
              
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-gold flex items-center justify-center text-2xl">🔄</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">إجمالي الصفحات المراجعة</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalPagesRevised} صفحة</h3>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl">🎯</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">نسبة تقدم الخطة</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">%75</h3>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-2xl">💯</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">متوسط درجات التسميع</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {studentEvaluations.length > 0 ? `${(studentEvaluations.reduce((sum, e) => sum + e.score, 0) / studentEvaluations.length).toFixed(1)}%` : 'لا يوجد'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Layout Main Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Progress & Active Plan */}
              <div className="lg:col-span-2 space-y-8">
                {/* Active Plan Detail */}
                {activePlan && (
                  <div className="p-8 rounded-3xl bg-gradient-to-tr from-primary/10 via-cream to-cream dark:from-emerald-950/20 dark:via-gray-900 dark:to-gray-900 border border-emerald-100 dark:border-emerald-950 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-primary dark:text-emerald-400 text-xs font-bold">الخطة النشطة حالياً</span>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-3">{activePlan.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activePlan.description}</p>
                      </div>
                      <span className="text-3xl">🎯</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-200/50 dark:border-gray-800/50 py-4">
                      <div>
                        <p className="text-xs text-gray-500">سورة المستهدفة</p>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">سورة {activePlan.targetSurah}</h4>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">حفظ لغاية الآية</p>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">الآية {activePlan.targetAyah}</h4>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">الجزء المستهدف</p>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">الجزء {activePlan.targetJuz}</h4>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                        <span>نسبة إنجاز الحفظ الإجمالية في الخطة</span>
                        <span>%75</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-gold rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Chart SVG Demo */}
                <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">تخطيط تقدم التسميع الأسبوعي (صفحات)</h3>
                  
                  {/* Beautiful Clean Native SVG Chart */}
                  <div className="w-full h-48 relative flex items-end justify-between px-2 pt-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="absolute top-0 right-0 text-xs text-gray-500">3 صفحات</div>
                    <div className="absolute top-16 right-0 text-xs text-gray-500">2 صفحة</div>
                    <div className="absolute top-32 right-0 text-xs text-gray-500">1 صفحة</div>

                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="w-4 bg-primary hover:bg-emerald-600 rounded-t-md transition-all cursor-pointer" style={{ height: '120px' }}></div>
                      <span className="text-[10px] text-gray-500">السبت</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="w-4 bg-primary hover:bg-emerald-600 rounded-t-md transition-all cursor-pointer" style={{ height: '40px' }}></div>
                      <span className="text-[10px] text-gray-500">الأحد</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="w-4 bg-primary hover:bg-emerald-600 rounded-t-md transition-all cursor-pointer" style={{ height: '80px' }}></div>
                      <span className="text-[10px] text-gray-500">الإثنين</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="w-4 bg-gray-300 dark:bg-gray-800 rounded-t-md transition-all" style={{ height: '0px' }}></div>
                      <span className="text-[10px] text-gray-500">الثلاثاء</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="w-4 bg-primary hover:bg-emerald-600 rounded-t-md transition-all cursor-pointer" style={{ height: '60px' }}></div>
                      <span className="text-[10px] text-gray-500">الأربعاء</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="w-4 bg-gray-300 dark:bg-gray-800 rounded-t-md transition-all" style={{ height: '0px' }}></div>
                      <span className="text-[10px] text-gray-500">الخميس</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-10">
                      <div className="w-4 bg-primary hover:bg-emerald-600 rounded-t-md transition-all cursor-pointer" style={{ height: '140px' }}></div>
                      <span className="text-[10px] text-gray-500">الجمعة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sessions Schedule & Actions */}
              <div className="space-y-8">
                {/* Live Class Schedule Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📅</span> فصول تفاعلية قادمة
                  </h3>
                  
                  <div className="space-y-4">
                    {sessions.map(s => (
                      <div key={s.id} className="p-4 rounded-2xl bg-cream dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
                        <div>
                          <h4 className="font-bold text-sm text-gray-950 dark:text-white">{s.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <span>⏰</span>
                          <span>اليوم • 4:00 مساءً</span>
                        </div>
                        {s.liveUrl && (
                          <button
                            onClick={() => setActiveJitsiSession(s.liveUrl!)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                          >
                            <Icons.Video size={14} /> انضم للبث المباشر
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Last Recitation Logs */}
                <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">آخر الأوراد المسجلة</h3>
                  <div className="space-y-4">
                    {studentLogs.slice(0, 3).map(log => (
                      <div key={log.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">سورة {log.surah}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">الآيات ({log.startAyah} - {log.endAyah}) • {log.pagesCount} صفحة</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${log.isRevision ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                          {log.isRevision ? 'مراجعة' : 'حفظ'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Register progress Tab */}
        {activeSubTab === 'log' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">تسجيل تسميع أو مراجعة يومية</h3>
            
            <form onSubmit={handleLogSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">السورة الكريمة</label>
                  <input 
                    type="text"
                    value={logSurah}
                    onChange={(e) => setLogSurah(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع الورد</label>
                  <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsRevision(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isRevision ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'}`}
                    >
                      حفظ جديد
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRevision(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isRevision ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'}`}
                    >
                      مراجعة
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">من الآية</label>
                  <input 
                    type="number"
                    value={startAyah}
                    onChange={(e) => setStartAyah(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm text-center"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">إلى الآية</label>
                  <input 
                    type="number"
                    value={endAyah}
                    onChange={(e) => setEndAyah(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">عدد الصفحات</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={pagesCount}
                    onChange={(e) => setPagesCount(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ملاحظات التسميع (اختياري)</label>
                <textarea 
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="ملاحظات حول مستوى الصعوبة أو التجويد..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                تسجيل وحفظ الورد
              </button>

              {logSuccess && (
                <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                  ✅ تم تسجيل تقدم الحفظ وإشعار ولي الأمر والمعلم بنجاح!
                </div>
              )}
            </form>
          </div>
        )}

        {/* Certificates & Grades Tab */}
        {activeSubTab === 'certificates' && (
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-6">سجل تقييمات التسميع والاختبارات</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold">
                      <th className="pb-3">النوع</th>
                      <th className="pb-3">التاريخ</th>
                      <th className="pb-3">الدرجة</th>
                      <th className="pb-3">الأخطاء</th>
                      <th className="pb-3">التجويد</th>
                      <th className="pb-3 text-left">الشهادة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {studentEvaluations.map(e => (
                      <tr key={e.id} className="text-gray-700 dark:text-gray-300">
                        <td className="py-4 font-bold">{e.type === 'EXAM' ? 'اختبار نهاية دورة' : 'تسميع يومي'}</td>
                        <td className="py-4">{new Date(e.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-primary dark:text-emerald-400 font-bold">% {e.score}</span>
                        </td>
                        <td className="py-4">{e.mistakesCount} خطأ / {e.hesitationsCount} تردد</td>
                        <td className="py-4 font-semibold text-gold">{e.tajweedGrade === 'EXCELLENT' ? 'ممتاز' : 'جيد'}</td>
                        <td className="py-4 text-left">
                          {e.score >= 90 ? (
                            <a
                              href={`http://localhost:5000/api/progress/evaluations/certificates/${e.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold/10 text-gold hover:bg-gold hover:text-white text-xs font-bold border border-gold/20 transition-all"
                            >
                              <span>🏆</span> عرض الشهادة
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">لا ينطبق</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeSubTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">إعدادات الحساب والملف الشخصي</h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الاسم بالكامل</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رقم الجوال</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني (غير قابل للتعديل)</label>
                <input 
                  type="email"
                  value={currentUser.email}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/20 text-gray-400 text-sm focus:outline-none"
                  disabled
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                تحديث بيانات الملف الشخصي
              </button>

              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                  ✅ تم تحديث بيانات الملف الشخصي بنجاح!
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
