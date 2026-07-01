'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import DashboardLayout from '@/components/DashboardLayout';

export default function TeacherDashboard() {
  const router = useRouter();
  const { 
    currentUser, loading, logout, halaqat, sessions, users, studentProfiles,
    attendance, evaluations, createSession, submitAttendance,
    addEvaluation, updateProfile, theme, toggleTheme
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sessions' | 'evaluations' | 'settings'>('overview');
  const [activeJitsiSession, setActiveJitsiSession] = useState<string | null>(null);

  // Scheduling states
  const [selectedHalaqaId, setSelectedHalaqaId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionStart, setSessionStart] = useState('');
  const [sessionEnd, setSessionEnd] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Attendance states
  const [activeAttendanceSessionId, setActiveAttendanceSessionId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; notes: string }>>({});
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  // Evaluation states
  const [evalStudentId, setEvalStudentId] = useState('');
  const [evalScore, setEvalScore] = useState('');
  const [evalMistakes, setEvalMistakes] = useState('0');
  const [evalHesitations, setEvalHesitations] = useState('0');
  const [evalTajweed, setEvalTajweed] = useState<'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'NEED_WORK'>('EXCELLENT');
  const [evalType, setEvalType] = useState<'DAILY' | 'TEST' | 'EXAM'>('DAILY');
  const [evalNotes, setEvalNotes] = useState('');
  const [evalSuccess, setEvalSuccess] = useState(false);

  // Settings states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.push('/auth');
    } else if (currentUser.role !== 'TEACHER') {
      router.push(`/dashboard/${currentUser.role.toLowerCase()}`);
    } else {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
      setBio('الشيخ الفاضل معلم قرآن كريم مجاز.');
    }
  }, [currentUser, loading]);

  // Set default selected Halaqa
  useEffect(() => {
    if (halaqat.length > 0) {
      setSelectedHalaqaId(halaqat[0].id);
    }
  }, [halaqat]);

  if (loading || !currentUser) return null;

  // Filter entities
  const teacherProfileId = 't-profile'; // Mock linked teacher profile ID
  const teacherHalaqat = halaqat.filter(h => h.teacherId === teacherProfileId);
  const teacherHalaqatIds = teacherHalaqat.map(h => h.id);
  const teacherSessions = sessions.filter(s => teacherHalaqatIds.includes(s.halaqaId));
  
  // Total students count
  const totalStudentsCount = 1; // Seeded 1 student

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHalaqaId || !sessionTitle || !sessionStart || !sessionEnd) return;
    
    createSession(selectedHalaqaId, sessionTitle, sessionDesc, sessionStart, sessionEnd);
    setScheduleSuccess(true);
    setSessionTitle('');
    setSessionDesc('');
    setSessionStart('');
    setSessionEnd('');
    setTimeout(() => {
      setScheduleSuccess(false);
      setActiveSubTab('overview');
    }, 2000);
  };

  const startAttendanceMarking = (sessionId: string) => {
    setActiveAttendanceSessionId(sessionId);
    // Initialize default attendance
    const records: typeof attendanceRecords = {};
    studentProfiles.forEach(sp => {
      records[sp.id] = { status: 'PRESENT', notes: '' };
    });
    setAttendanceRecords(records);
    setActiveSubTab('sessions');
  };

  const handleAttendanceCheckboxChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleAttendanceNotesChange = (studentId: string, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAttendanceSessionId) return;

    const recordsArray = Object.keys(attendanceRecords).map(studentId => ({
      studentId,
      status: attendanceRecords[studentId].status,
      notes: attendanceRecords[studentId].notes
    }));

    submitAttendance(activeAttendanceSessionId, recordsArray);
    setAttendanceSuccess(true);
    setTimeout(() => {
      setAttendanceSuccess(false);
      setActiveAttendanceSessionId(null);
      setActiveSubTab('overview');
    }, 2000);
  };

  const handleEvalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalStudentId || !evalScore) return;

    addEvaluation({
      studentId: evalStudentId,
      evaluatorId: teacherProfileId,
      score: Number(evalScore),
      mistakesCount: Number(evalMistakes),
      hesitationsCount: Number(evalHesitations),
      tajweedGrade: evalTajweed,
      type: evalType,
      notes: evalNotes
    });

    setEvalSuccess(true);
    setEvalStudentId('');
    setEvalScore('');
    setEvalMistakes('0');
    setEvalHesitations('0');
    setEvalNotes('');
    setTimeout(() => {
      setEvalSuccess(false);
      setActiveSubTab('overview');
    }, 2000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(name, phone, bio);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200">
        
        {/* Horizontal Tab Navigation */}
        <div className="flex gap-2 pb-4 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => { setActiveSubTab('overview'); setActiveAttendanceSessionId(null); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'overview' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            📊 لوحة التحكم والطلاب
          </button>
          <button
            onClick={() => { setActiveSubTab('sessions'); setActiveAttendanceSessionId(null); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'sessions' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🗓️ جدولة الحصص المباشرة
          </button>
          <button
            onClick={() => { setActiveSubTab('evaluations'); setActiveAttendanceSessionId(null); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'evaluations' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            📝 رصد التقييمات والشهادات
          </button>
          <button
            onClick={() => { setActiveSubTab('settings'); setActiveAttendanceSessionId(null); setActiveJitsiSession(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === 'settings' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            ⚙️ الملف الشخصي
          </button>
        </div>

        {/* Top bar with quick actions */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-extrabold text-primary dark:text-white">
              {activeSubTab === 'overview' && 'لوحة متابعة وإدارة الحلقات والطلاب'}
              {activeSubTab === 'sessions' && (activeAttendanceSessionId ? 'رصد حضور وغياب الحصة المباشرة' : 'جدولة حصص جديدة')}
              {activeSubTab === 'evaluations' && 'تقييم تسميع الطلاب والامتحانات'}
              {activeSubTab === 'settings' && 'تعديل بيانات المعلم'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">معلم حلقة قرآن • رحيق القرآن</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              {theme === 'dark' ? <Icons.Sun size={18} className="text-amber-500" /> : <Icons.Moon size={18} className="text-primary" />}
            </button>
          </div>
        </header>

        {/* Embedded Jitsi Stream Video */}
        {activeJitsiSession && (
          <div className="mb-8 rounded-3xl bg-black overflow-hidden shadow-2xl border border-gray-800">
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <span className="font-bold text-sm">📺 أنت تقوم بإلقاء الحصة المباشرة الآن</span>
              <button 
                onClick={() => setActiveJitsiSession(null)} 
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                إنهاء البث التفاعلي
              </button>
            </div>
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
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center text-2xl">👥</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">عدد طلابك الكلي</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalStudentsCount} طلاب نشطين</h3>
                </div>
              </div>
              
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-gold flex items-center justify-center text-2xl">🕌</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">حلقاتك التعليمية</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{teacherHalaqat.length} حلقات مسجلة</h3>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl">💻</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">الحصص المكتملة</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {teacherSessions.filter(s => s.status === 'COMPLETED').length} حصة منتهية
                  </h3>
                </div>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left side: teacher's Halaqa listing */}
              <div className="lg:col-span-2 space-y-8">
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">حلقاتك النشطة وتفاصيلها</h3>
                  
                  <div className="space-y-4">
                    {teacherHalaqat.map(halaqa => (
                      <div key={halaqa.id} className="p-5 rounded-2xl bg-cream dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-800 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{halaqa.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{halaqa.description}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-primary dark:text-emerald-400 text-xs font-bold">
                            {halaqa.type === 'GROUP' ? 'حلقة جماعية' : 'فردي'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                          <span>👥 السعة: {halaqa.studentsCount} / {halaqa.capacity} طالب</span>
                          <span>📅 الجدولة: {halaqa.schedule.map(s => `${s.day} (${s.time})`).join('، ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* List of Active Sessions Scheduled */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">جدول الحصص المجدولة وطاقم الإدارة</h3>
                  <div className="space-y-4">
                    {teacherSessions.map(session => (
                      <div key={session.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">{session.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">الحالة: {session.status === 'SCHEDULED' ? 'مجدولة' : 'مكتملة'}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {session.status === 'SCHEDULED' && session.liveUrl && (
                            <>
                              <button
                                onClick={() => setActiveJitsiSession(session.liveUrl!)}
                                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:shadow-md transition-all"
                              >
                                <Icons.Video size={12} /> بدء البث
                              </button>
                              
                              <button
                                onClick={() => startAttendanceMarking(session.id)}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                              >
                                📝 حضور الطلاب
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side: student list directory */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">قائمة طلابك</h3>
                <div className="space-y-4">
                  {studentProfiles.map(student => {
                    const studentUser = users.find(u => u.id === student.userId);
                    if (!studentUser) return null;
                    return (
                      <div key={student.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-lg flex items-center justify-center font-bold">👦</div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{studentUser.name}</h4>
                            <p className="text-xs text-gray-500">{studentUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setEvalStudentId(student.id); setActiveSubTab('evaluations'); }}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-primary dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-primary hover:text-white dark:hover:bg-emerald-950 transition-all"
                        >
                          تقييم التسميع
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule session Tab / Attendance markings */}
        {activeSubTab === 'sessions' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            {activeAttendanceSessionId ? (
              // Attendance Submission
              <form onSubmit={handleAttendanceSubmit} className="space-y-6">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">رصد الغياب والحضور للطلاب</h3>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {studentProfiles.map(student => {
                    const studentUser = users.find(u => u.id === student.userId);
                    const record = attendanceRecords[student.id] || { status: 'PRESENT', notes: '' };
                    if (!studentUser) return null;

                    return (
                      <div key={student.id} className="py-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-gray-950 dark:text-white">{studentUser.name}</h4>
                          
                          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setAttendanceRecords(prev => ({
                                ...prev,
                                [student.id]: { ...record, status: 'PRESENT' }
                              }))}
                              className={`px-3 py-1.5 rounded-lg transition-all ${record.status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500'}`}
                            >
                              حاضر
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttendanceRecords(prev => ({
                                ...prev,
                                [student.id]: { ...record, status: 'ABSENT' }
                              }))}
                              className={`px-3 py-1.5 rounded-lg transition-all ${record.status === 'ABSENT' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500'}`}
                            >
                              غائب
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttendanceRecords(prev => ({
                                ...prev,
                                [student.id]: { ...record, status: 'LATE' }
                              }))}
                              className={`px-3 py-1.5 rounded-lg transition-all ${record.status === 'LATE' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500'}`}
                            >
                              متأخر
                            </button>
                          </div>
                        </div>

                        <input 
                          type="text"
                          value={record.notes}
                          onChange={(e) => setAttendanceRecords(prev => ({
                            ...prev,
                            [student.id]: { ...record, notes: e.target.value }
                          }))}
                          placeholder="ملاحظات الحضور أو عذر الغياب..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  حفظ وإرسال كشف الحضور
                </button>

                {attendanceSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                    ✅ تم تسجيل كشف الحضور والغياب للطلاب بنجاح!
                  </div>
                )}
              </form>
            ) : (
              // Schedule new Class Session
              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">جدولة حصة بث مباشر جديدة</h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اختر الحلقة</label>
                  <select
                    value={selectedHalaqaId}
                    onChange={(e) => setSelectedHalaqaId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                  >
                    {teacherHalaqat.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان الحصة</label>
                  <input 
                    type="text" 
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="تسميع الورد الأول وأحكام المد المنفصل"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تاريخ ووقت بدء الحصة</label>
                  <input 
                    type="datetime-local" 
                    value={sessionStart}
                    onChange={(e) => setSessionStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">وقت الانتهاء التقديري</label>
                  <input 
                    type="datetime-local" 
                    value={sessionEnd}
                    onChange={(e) => setSessionEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الوصف / محاور الحصة (اختياري)</label>
                  <textarea 
                    rows={3}
                    value={sessionDesc}
                    onChange={(e) => setSessionDesc(e.target.value)}
                    placeholder="مراجعة سورة البقرة من الآية 1 إلى 20 وشرح التجويد..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  جدولة الحصة وتفعيل البث المشترك
                </button>

                {scheduleSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                    ✅ تم جدولة الحصة وإرسال إشعار فوري لجميع الطلاب المقيدين!
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* Post Evaluation Tab */}
        {activeSubTab === 'evaluations' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">تقييم تسميع وحفظ الطالب ورصد الدرجة</h3>
            
            <form onSubmit={handleEvalSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اختر الطالب</label>
                <select
                  value={evalStudentId}
                  onChange={(e) => setEvalStudentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">-- حدد الطالب من القائمة --</option>
                  {studentProfiles.map(s => {
                    const u = users.find(user => user.id === s.userId);
                    return u ? <option key={s.id} value={s.id}>{u.name}</option> : null;
                  })}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع التقييم</label>
                  <select
                    value={evalType}
                    onChange={(e) => setEvalType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                  >
                    <option value="DAILY">تسميع ورد يومي</option>
                    <option value="TEST">اختبار دوري</option>
                    <option value="EXAM">امتحان نهائي للدورة</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الدرجة النهائية (%100)</label>
                  <input 
                    type="number"
                    max={100}
                    min={0}
                    value={evalScore}
                    onChange={(e) => setEvalScore(e.target.value)}
                    placeholder="95"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary text-center font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">عدد الأخطاء</label>
                  <input 
                    type="number"
                    value={evalMistakes}
                    onChange={(e) => setEvalMistakes(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">عدد مرات التردد</label>
                  <input 
                    type="number"
                    value={evalHesitations}
                    onChange={(e) => setEvalHesitations(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">رتبة التجويد</label>
                  <select
                    value={evalTajweed}
                    onChange={(e) => setEvalTajweed(e.target.value as any)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none"
                  >
                    <option value="EXCELLENT">ممتاز</option>
                    <option value="GOOD">جيد جداً</option>
                    <option value="ACCEPTABLE">مقبول</option>
                    <option value="NEED_WORK">يحتاج لمراجعة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ملاحظات التوجيه والثناء</label>
                <textarea 
                  rows={4}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="حفظ متميز وضبط ممتاز لأحكام الغنن، نرجو مراجعة المد الجائز..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                حفظ وإصدار النتيجة والشهادة تلقائياً
              </button>

              {evalSuccess && (
                <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                  ✅ تم رصد تقييم الطالب بنجاح! وفي حال تخطي الامتحان بنسبة تفوق تم توليد شهادته.
                </div>
              )}
            </form>
          </div>
        )}

        {/* Profile bio configurations */}
        {activeSubTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">إعدادات حساب المعلم وملفه التعريفي</h3>
            
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">السيرة الذاتية والمؤهلات العلمية</label>
                <textarea 
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                تحديث ملف المعلم
              </button>

              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                  ✅ تم تحديث ملفك التعريفي بنجاح!
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
