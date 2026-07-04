'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { 
    currentUser, loading, users, halaqat, sessions, subscriptions, 
    progressLogs, studentProfiles, evaluations,
    createHalaqa, theme,
    addUser, updateUser, deleteUser, refreshUsers,
    applicants, refreshApplicants, updateApplicantStatus, deleteApplicant
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'halaqat' | 'subscriptions' | 'applicants'>('overview');

  useEffect(() => {
    if (tabParam === 'users' || tabParam === 'halaqat' || tabParam === 'subscriptions' || tabParam === 'overview' || tabParam === 'applicants') {
      setActiveSubTab(tabParam as any);
    }
  }, [tabParam]);

  // New Halaqa Form states
  const [halaqaName, setHalaqaName] = useState('');
  const [halaqaDesc, setHalaqaDesc] = useState('');
  const [halaqaType, setHalaqaType] = useState<'GROUP' | 'INDIVIDUAL'>('GROUP');
  const [halaqaCapacity, setHalaqaCapacity] = useState('10');
  const [teacherId, setTeacherId] = useState('t-profile');
  const [halaqaSuccess, setHalaqaSuccess] = useState(false);

  // User CRUD states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'>('STUDENT');
  const [formIsActive, setFormIsActive] = useState(true);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'>('ALL');

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.push('/auth');
    } else if (currentUser.role !== 'ADMIN') {
      router.push(`/dashboard/${currentUser.role.toLowerCase()}`);
    }
  }, [currentUser, loading]);

  if (loading || !currentUser) return null;

  // ─── LIVE STATS ───────────────────────────────────────────────────────────
  const totalUsers       = users.length;
  const totalStudents    = users.filter(u => u.role === 'STUDENT').length;
  const totalTeachers    = users.filter(u => u.role === 'TEACHER').length;
  const totalParents     = users.filter(u => u.role === 'PARENT').length;
  const totalHalaqat     = halaqat.length;
  const totalSessions    = sessions.length;
  const confirmedLogs    = progressLogs.filter(l => l.status === 'CONFIRMED').length;
  const pendingLogs      = progressLogs.filter(l => l.status === 'PENDING').length;
  const totalLogs        = progressLogs.length;
  const totalRevenue     = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const totalEvals       = evaluations.length;
  const avgScore         = evaluations.length 
    ? Math.round(evaluations.reduce((s, e) => s + (e.score || 0), 0) / evaluations.length) 
    : 0;

  // Teacher payouts: 150 ج.م × 2h per confirmed log (zero if no confirmed logs)
  const teacherHours         = confirmedLogs * 2;
  const teacherPayoutTotal   = teacherHours * 150;
  // Supervisor payouts: 50 ج.م × 2h per confirmed log
  const supervisorHours      = confirmedLogs * 2;
  const supervisorPayoutTotal = supervisorHours * 50;

  // ─── CHART DATA (subscriptions grouped by month) ──────────────────────────
  const MONTH_LABELS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  
  // Aggregate subscription revenue per month (last 6 months up to now)
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: d.getMonth(), year: d.getFullYear(), label: MONTH_LABELS[d.getMonth()] };
  });

  const chartData = last6Months.map(({ month, year, label }) => {
    const revenue = subscriptions
      .filter(s => {
        const d = new Date(s.startDate);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, s) => sum + s.amount, 0);
    return { label, revenue };
  });

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
  const CHART_MAX_PX = 160; // max bar height in pixels

  // ─── HALAQA FORM ─────────────────────────────────────────────────────────
  const handleHalaqaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!halaqaName || !halaqaCapacity) return;
    createHalaqa({
      name: halaqaName,
      description: halaqaDesc,
      type: halaqaType,
      capacity: Number(halaqaCapacity),
      schedule: [{ day: 'السبت', time: '16:00' }, { day: 'الإثنين', time: '16:00' }],
      teacherId
    });
    setHalaqaSuccess(true);
    setHalaqaName('');
    setHalaqaDesc('');
    setTimeout(() => { setHalaqaSuccess(false); setActiveSubTab('overview'); }, 2000);
  };

  // ─── USER CRUD METHODS ──────────────────────────────────────────────────
  const openAddUserModal = () => {
    setEditUserId(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('');
    setFormPhone('');
    setFormRole('STUDENT');
    setFormIsActive(true);
    setUserError('');
    setUserSuccess('');
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: any) => {
    setEditUserId(u.id);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormPassword(''); // leave blank unless updating
    setFormPhone(u.phone || '');
    setFormRole(u.role);
    setFormIsActive(u.isActive);
    setUserError('');
    setUserSuccess('');
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    try {
      if (editUserId) {
        // Edit mode
        await updateUser(editUserId, {
          name: formName,
          username: formUsername,
          password: formPassword || undefined,
          phone: formPhone || undefined,
          role: formRole,
          isActive: formIsActive
        });
        setUserSuccess('تم تحديث بيانات المستخدم بنجاح');
      } else {
        // Add mode
        if (!formPassword) {
          setUserError('الرجاء إدخال كلمة المرور للمستخدم الجديد');
          return;
        }
        await addUser({
          name: formName,
          username: formUsername,
          password: formPassword,
          phone: formPhone || undefined,
          role: formRole,
          isActive: formIsActive
        });
        setUserSuccess('تم إضافة المستخدم بنجاح');
      }
      setTimeout(() => {
        setIsUserModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setUserError(err.message || 'حدث خطأ أثناء حفظ بيانات المستخدم');
    }
  };

  const handleToggleStatus = async (u: any) => {
    try {
      await updateUser(u.id, { isActive: !u.isActive });
    } catch (err: any) {
      alert(err.message || 'خطأ في تبديل حالة المستخدم');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟')) return;
    try {
      await deleteUser(id);
    } catch (err: any) {
      alert(err.message || 'خطأ في حذف المستخدم');
    }
  };


  // ─── ROLE BADGE ───────────────────────────────────────────────────────────
  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
      TEACHER: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
      PARENT: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      STUDENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      SUPERVISOR: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
    };
    const label: Record<string, string> = { ADMIN: 'مدير', TEACHER: 'معلم', PARENT: 'ولي أمر', STUDENT: 'طالب', SUPERVISOR: 'مشرف' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[role] || 'bg-gray-100 text-gray-600'}`}>
        {label[role] || role}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 font-sans pb-12">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-primary dark:text-white">
              {activeSubTab === 'overview'      && 'الإحصائيات الحقيقية للمنصة'}
              {activeSubTab === 'users'         && 'سجل أعضاء المنصة'}
              {activeSubTab === 'applicants'    && 'طلبات التقديم والتسجيل الجديد'}
              {activeSubTab === 'halaqat'       && 'إنشاء وإدارة الحلقات الدراسية'}
              {activeSubTab === 'subscriptions' && 'تقارير الاشتراكات والمدفوعات'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">مدير المنصة • لوحة الإدارة العامة</p>
          </div>
        </header>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* ROW 1: Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '👥', label: 'إجمالي المستخدمين', value: `${totalUsers}`, sub: `${totalStudents} طالب · ${totalTeachers} معلم · ${totalParents} ولي أمر`, color: 'text-primary', bg: 'bg-emerald-500/10' },
                { icon: '🕌', label: 'الحلقات المسجلة', value: `${totalHalaqat} حلقة`, sub: `${totalSessions} جلسة`, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                { icon: '📋', label: 'تقارير التسميع', value: `${totalLogs} تقرير`, sub: `${confirmedLogs} معتمد · ${pendingLogs} بانتظار`, color: 'text-amber-600', bg: 'bg-amber-500/10' },
                { icon: '💰', label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString()} ج.م`, sub: `من ${subscriptions.length} اشتراك`, color: 'text-purple-600', bg: 'bg-purple-500/10' },
              ].map((kpi, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${kpi.bg} flex items-center justify-center text-xl shrink-0`}>{kpi.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 font-medium truncate">{kpi.label}</p>
                    <h3 className={`text-base font-extrabold ${kpi.color} dark:text-white mt-0.5`}>{kpi.value}</h3>
                    <p className="text-[9px] text-gray-400 mt-0.5 truncate">{kpi.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ROW 2: Charts + Activity */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Live Revenue Bar Chart */}
              <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">الإيرادات الشهرية (آخر 6 أشهر)</h3>
                  <span className="text-xs text-gray-400 font-mono">ج.م</span>
                </div>

                {totalRevenue === 0 ? (
                  <div className="h-44 flex items-center justify-center text-gray-400 text-sm font-bold">
                    لا توجد اشتراكات مسجلة حتى الآن
                  </div>
                ) : (
                  <div className="relative h-48">
                    {/* Y-axis labels */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                      {[maxRevenue, Math.round(maxRevenue * 0.5), 0].map((v, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 font-mono w-12 text-left shrink-0">{v.toLocaleString()}</span>
                          <div className="flex-1 border-t border-dashed border-gray-100 dark:border-gray-800" />
                        </div>
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute bottom-6 left-14 right-0 h-[calc(100%-1.5rem)] flex items-end justify-around gap-2">
                      {chartData.map((d, i) => {
                        const heightPx = maxRevenue > 0 ? Math.max(4, Math.round((d.revenue / maxRevenue) * CHART_MAX_PX)) : 4;
                        return (
                          <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[9px] text-gray-400 font-mono">{d.revenue > 0 ? d.revenue.toLocaleString() : ''}</span>
                            <div
                              title={`${d.label}: ${d.revenue} ج.م`}
                              className="w-full max-w-[32px] rounded-t-xl bg-gradient-to-t from-primary to-primary-light hover:opacity-90 cursor-pointer transition-all"
                              style={{ height: `${heightPx}px` }}
                            />
                            <span className="text-[9px] text-gray-500 font-bold">{d.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity Feed */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-3">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-3">آخر نشاطات التسميع</h3>
                {progressLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">لا توجد تقارير مسجلة</p>
                ) : (
                  progressLogs.slice(0, 5).map(log => {
                    const sp = studentProfiles.find(s => s.id === log.studentId);
                    const u  = users.find(u => u.id === sp?.userId);
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-cream dark:bg-gray-800/30 text-xs border border-gray-100 dark:border-gray-800">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.status === 'CONFIRMED' ? 'bg-primary' : 'bg-amber-400'}`} />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{u?.name || 'دارس'}</p>
                          <p className="text-gray-500 mt-0.5">سورة {log.surah} · {log.startAyah}-{log.endAyah}</p>
                          <p className={`mt-0.5 font-bold ${log.status === 'CONFIRMED' ? 'text-primary dark:text-emerald-400' : 'text-amber-500'}`}>
                            {log.status === 'CONFIRMED' ? 'معتمد' : 'بانتظار الاعتماد'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ROW 3: Role Distribution + Payouts + Progress */}
            <div className="grid sm:grid-cols-3 gap-6">

              {/* Role distribution */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">توزيع المستخدمين بالأدوار</h3>
                {[
                  { role: 'طلاب', count: totalStudents,  color: 'bg-emerald-500' },
                  { role: 'معلمون', count: totalTeachers, color: 'bg-blue-500' },
                  { role: 'أولياء أمور', count: totalParents,  color: 'bg-amber-500' },
                  { role: 'مديرون ومشرفون', count: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERVISOR').length, color: 'bg-purple-500' },
                ].map(item => (
                  <div key={item.role} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300 font-bold">{item.role}</span>
                      <span className="text-gray-500 font-mono">{item.count} / {totalUsers}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all`}
                        style={{ width: totalUsers > 0 ? `${Math.round((item.count / totalUsers) * 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Payouts Summary */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">مستحقات الكادر هذا الشهر</h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold">إجمالي مستحقات المحفظين</p>
                    <p className="text-lg font-extrabold text-primary dark:text-emerald-400">{teacherPayoutTotal.toLocaleString()} ج.م</p>
                    <p className="text-[9px] text-gray-400">{teacherHours} ساعة × 150 ج.م</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold">إجمالي مستحقات المشرفين</p>
                    <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{supervisorPayoutTotal.toLocaleString()} ج.م</p>
                    <p className="text-[9px] text-gray-400">{supervisorHours} ساعة × 50 ج.م</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold">إجمالي المصروفات للكادر</p>
                    <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{(teacherPayoutTotal + supervisorPayoutTotal).toLocaleString()} ج.م</p>
                  </div>
                </div>
              </div>

              {/* Reports & Evaluations */}
              <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">حالة التقارير والاختبارات</h3>
                <div className="space-y-3">
                  {[
                    { label: 'تقارير معتمدة',    value: confirmedLogs, total: totalLogs, color: 'bg-emerald-500' },
                    { label: 'تقارير قيد المراجعة', value: pendingLogs,   total: totalLogs, color: 'bg-amber-400' },
                  ].map(item => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-300 font-bold">{item.label}</span>
                        <span className="text-gray-500 font-mono">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: item.total > 0 ? `${Math.round((item.value / item.total) * 100)}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold">إجمالي الاختبارات</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{totalEvals}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold">متوسط الدرجات</span>
                      <span className={`font-mono font-bold ${avgScore >= 90 ? 'text-primary' : avgScore >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                        {avgScore}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold">الحلقات المتاحة</span>
                      <span className="font-mono font-bold text-blue-600">{totalHalaqat}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ USERS TAB ══════════════ */}
        {activeSubTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Control Bar: Search, Filter & Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="ابحث عن اسم، بريد، أو جوال..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute left-3 top-3 text-gray-400 text-xs">🔍</span>
                </div>
                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">جميع الأدوار</option>
                  <option value="ADMIN">المديرين</option>
                  <option value="TEACHER">المعلمين</option>
                  <option value="STUDENT">الطلاب</option>
                  <option value="PARENT">أولياء الأمور</option>
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={openAddUserModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <span>➕</span>
                <span>إضافة مستخدم جديد</span>
              </button>
            </div>

            {/* Users Table Card */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">قائمة الأعضاء المسجلين ({users.filter(u => userRoleFilter === 'ALL' || u.role === userRoleFilter).length})</h3>
                <button
                  onClick={refreshUsers}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold text-gray-500"
                >
                  🔄 تحديث القائمة
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold text-xs">
                      <th className="pb-3">الاسم</th>
                      <th className="pb-3">اسم المستخدم</th>
                      <th className="pb-3">الدور</th>
                      <th className="pb-3">الجوال</th>
                      <th className="pb-3 text-center">الحالة</th>
                      <th className="pb-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users
                      .filter(u => {
                        const searchLower = userSearch.toLowerCase();
                        const matchesSearch = u.name.toLowerCase().includes(searchLower) || 
                                              u.username.toLowerCase().includes(searchLower) ||
                                              (u.phone && u.phone.includes(userSearch));
                        const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                        return matchesSearch && matchesRole;
                      })
                      .map(u => (
                        <tr key={u.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          <td className="py-3.5 font-bold">{u.name}</td>
                          <td className="py-3.5 text-xs font-mono">{u.username}</td>
                          <td className="py-3.5">{roleBadge(u.role)}</td>
                          <td className="py-3.5 text-xs font-mono">{u.phone || '—'}</td>
                          <td className="py-3.5 text-center">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                u.isActive
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-200'
                              }`}
                              title={u.isActive ? 'انقر لإيقاف الحساب' : 'انقر لتنشيط الحساب'}
                            >
                              {u.isActive ? 'نشط' : 'معطل'}
                            </button>
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="p-1 px-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-bold transition-colors"
                              >
                                ✏️ تعديل
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 px-2.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors"
                              >
                                🗑️ حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Dialog Form */}
            {isUserModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                      {editUserId ? '📝 تعديل بيانات العضو' : '➕ إضافة عضو جديد بالمنصة'}
                    </h3>
                    <button
                      onClick={() => setIsUserModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:white text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    {/* Error & Success alerts */}
                    {userError && (
                      <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold">
                        ⚠️ {userError}
                      </div>
                    )}
                    {userSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        ✅ {userSuccess}
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">الاسم بالكامل</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="عبد الله عبد الرحمن"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
                        required
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">اسم المستخدم</label>
                      <input
                        type="text"
                        value={formUsername}
                        onChange={e => setFormUsername(e.target.value)}
                        placeholder="اسم المستخدم"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-right font-mono"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        كلمة المرور {editUserId && '(اتركه فارغاً للاحتفاظ بكلمة المرور الحالية)'}
                      </label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={e => setFormPassword(e.target.value)}
                        placeholder={editUserId ? '••••••••' : 'أدخل كلمة مرور قوية'}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-left"
                        required={!editUserId}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">رقم الجوال (اختياري)</label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={e => setFormPhone(e.target.value)}
                        placeholder="05xxxxxxx"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-left font-mono"
                      />
                    </div>

                    {/* Role & Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">الدور الوظيفي</label>
                        <select
                          value={formRole}
                          onChange={e => setFormRole(e.target.value as any)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none text-right"
                        >
                          <option value="STUDENT">طالب / دارس</option>
                          <option value="TEACHER">معلم / محفظ</option>
                          <option value="PARENT">ولي أمر</option>
                          <option value="ADMIN">مدير النظام</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">حالة الحساب</label>
                        <select
                          value={formIsActive ? 'ACTIVE' : 'INACTIVE'}
                          onChange={e => setFormIsActive(e.target.value === 'ACTIVE')}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xs focus:outline-none text-right"
                        >
                          <option value="ACTIVE">نشط ومفعل</option>
                          <option value="INACTIVE">معطل / موقوف</option>
                        </select>
                      </div>
                    </div>

                    {/* Submit & Close Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-xs shadow-lg hover:scale-[1.01] transition-all"
                      >
                        حفظ البيانات
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUserModalOpen(false)}
                        className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 font-bold text-xs hover:bg-gray-200"
                      >
                        إلغاء الأمر
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ HALAQAT TAB ══════════════ */}
        {activeSubTab === 'halaqat' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            <div className="lg:col-span-2 p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">إنشاء حلقة تحفيظ قرآنية جديدة</h3>
              <form onSubmit={handleHalaqaSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم الحلقة</label>
                  <input type="text" value={halaqaName} onChange={e => setHalaqaName(e.target.value)}
                    placeholder="حلقة همم الأندلس (حفظ الجزء الثلاثين)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع الحلقة</label>
                    <select value={halaqaType} onChange={e => setHalaqaType(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none">
                      <option value="GROUP">حلقة جماعية</option>
                      <option value="INDIVIDUAL">حفظ فردي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">السعة الاستيعابية</label>
                    <input type="number" value={halaqaCapacity} onChange={e => setHalaqaCapacity(e.target.value)}
                      placeholder="15" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none text-center" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تفاصيل الحلقة</label>
                  <textarea rows={3} value={halaqaDesc} onChange={e => setHalaqaDesc(e.target.value)}
                    placeholder="مخصصة للطلاب المبتدئين لضبط مخارج الحروف..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none" />
                </div>
                <button type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg hover:scale-[1.01] transition-all">
                  إطلاق وتأسيس الحلقة
                </button>
                {halaqaSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                    ✅ تم إنشاء حلقة التحفيظ بنجاح!
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">الحلقات المقررة ({totalHalaqat})</h3>
              {halaqat.length === 0
                ? <p className="text-xs text-gray-400 text-center py-8">لا توجد حلقات بعد</p>
                : halaqat.map(h => (
                  <div key={h.id} className="p-4 rounded-2xl bg-cream dark:bg-gray-800/40 text-xs space-y-2 border border-gray-200/50 dark:border-gray-800">
                    <h4 className="font-bold text-gray-900 dark:text-white">{h.name}</h4>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>السعة: {h.capacity}</span>
                      <span>{h.type === 'GROUP' ? 'جماعي' : 'فردي'}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ══════════════ SUBSCRIPTIONS TAB ══════════════ */}
        {activeSubTab === 'subscriptions' && (
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">سجل الاشتراكات المالية</h3>
              <span className="text-xs font-bold text-primary dark:text-emerald-400">{totalRevenue.toLocaleString()} ج.م إجمالي</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold text-xs">
                    <th className="pb-3">معرف الاشتراك</th>
                    <th className="pb-3">المشترك</th>
                    <th className="pb-3">الباقة</th>
                    <th className="pb-3">القيمة</th>
                    <th className="pb-3">التاريخ</th>
                    <th className="pb-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {subscriptions.length === 0
                    ? <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-xs">لا توجد اشتراكات</td></tr>
                    : subscriptions.map(sub => {
                      const subUser = users.find(u => u.id === sub.userId) || { name: 'مستخدم' };
                      return (
                        <tr key={sub.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                          <td className="py-3 font-mono text-xs">{sub.paymentIntentId}</td>
                          <td className="py-3 font-bold">{subUser.name}</td>
                          <td className="py-3 text-xs">{sub.planType === 'once_weekly' ? 'حصة أسبوعياً' : 'حصتين أسبوعياً'}</td>
                          <td className="py-3 font-bold text-primary dark:text-emerald-400">{sub.amount} ج.م</td>
                          <td className="py-3 text-xs">{new Date(sub.startDate).toLocaleDateString('ar-EG')}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 rounded-full text-xs font-bold">مفعلة</span>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════ APPLICANTS TAB ══════════════ */}
        {activeSubTab === 'applicants' && (
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">طلبات التسجيل الجديد للمراجعة والقبول</h3>
              <button
                onClick={refreshApplicants}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold text-gray-500"
              >
                🔄 تحديث الطلبات
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold text-xs">
                    <th className="pb-3">الاسم</th>
                    <th className="pb-3">الباقة</th>
                    <th className="pb-3">الهوية / الجواز</th>
                    <th className="pb-3">الدولة</th>
                    <th className="pb-3">رقم الواتساب</th>
                    <th className="pb-3">تفاصيل الحفظ والأشقاء</th>
                    <th className="pb-3 text-center">الحالة</th>
                    <th className="pb-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">
                        لا توجد طلبات تقديم مسجلة بالخادم حالياً.
                      </td>
                    </tr>
                  ) : (
                    applicants.map(app => (
                      <tr key={app.id} className="text-gray-750 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                        <td className="py-3 font-bold text-xs">
                          {app.name}
                          {app.email && (
                            <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{app.email}</span>
                          )}
                        </td>
                        <td className="py-3 font-medium text-xs">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            app.packageName.includes('الأخوة') 
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' 
                              : app.packageName.includes('الأخوات')
                              ? 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/40 text-primary dark:text-emerald-300'
                          }`}>
                            {app.packageName}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{app.nationalId}</td>
                        <td className="py-3 text-xs text-gray-650 dark:text-gray-400">{app.country}</td>
                        <td className="py-3 text-xs">
                          <a 
                            href={`https://wa.me/${app.whatsapp.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary dark:text-emerald-400 font-semibold hover:underline"
                            dir="ltr"
                          >
                            <span>💬</span>
                            <span>{app.whatsapp}</span>
                          </a>
                        </td>
                        <td className="py-3 max-w-[240px] whitespace-pre-line leading-relaxed text-xs">
                          {app.siblings && (
                            <div className="text-rose-600 dark:text-rose-400">
                              <strong>الأشقاء: </strong>{app.siblings}
                            </div>
                          )}
                          {app.isMemorized ? (
                            <div className="text-emerald-700 dark:text-emerald-450 mt-1">
                              <strong>الحفظ: </strong>{app.memorizedSurahs} ({app.memorizeStart === 'FROM_BAQARAH' ? 'من البقرة' : 'من الناس'})
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">لا يوجد حفظ مسبق</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            app.status === 'APPROVED' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                              : app.status === 'REJECTED' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {app.status === 'APPROVED' ? 'مقبول' : app.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {app.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateApplicantStatus(app.id, 'APPROVED');
                                      alert('تم قبول طلب التسجيل بنجاح! يمكنك الآن تسجيل الدارس كعضو جديد.');
                                    } catch (err: any) {
                                      alert(err.message);
                                    }
                                  }}
                                  className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]"
                                >
                                  قبول ✓
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateApplicantStatus(app.id, 'REJECTED');
                                    } catch (err: any) {
                                      alert(err.message);
                                    }
                                  }}
                                  className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-bold text-[10px]"
                                >
                                  رفض ✕
                                </button>
                              </>
                            )}
                            <button
                              onClick={async () => {
                                if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟')) {
                                  try {
                                    await deleteApplicant(app.id);
                                  } catch (err: any) {
                                    alert(err.message);
                                  }
                                }
                              }}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 text-xs"
                              title="حذف الطلب"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream dark:bg-dark-bg" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
