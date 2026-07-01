'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';

interface TeacherFinanceRow {
  id: string;
  name: string;
  baseHours: number;
  email: string;
  status: 'مدفوع' | 'قيد الانتظار';
}

interface SupervisorFinanceRow {
  id: string;
  name: string;
  baseHours: number;
  email: string;
  status: 'مدفوع' | 'قيد الانتظار';
}

export default function FinancesPage() {
  const { theme, progressLogs, currentUser } = useApp();
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // 1. Hourly Rates State
  const [teacherHourlyRate, setTeacherHourlyRate] = useState(150);
  const [supervisorHourlyRate, setSupervisorHourlyRate] = useState(50);

  // 2. Month Filter State
  const [selectedMonth, setSelectedMonth] = useState('يونيو 2026');

  // 3. User lists (Tutors and Supervisors) loaded from CRUD or defaults
  const [teachersList, setTeachersList] = useState<TeacherFinanceRow[]>([]);
  const [supervisorsList, setSupervisorsList] = useState<SupervisorFinanceRow[]>([]);

  // Load staff records and local payment statuses
  useEffect(() => {
    // Teachers — load from CRUD only (no fake fallback)
    const savedTeachers = localStorage.getItem('tahfez_teachers_crud');
    const tData = savedTeachers ? JSON.parse(savedTeachers) : [];
    
    const tRows: TeacherFinanceRow[] = tData.map((t: any) => ({
      id: t.id,
      name: t.name,
      baseHours: 0, // starts at 0; incremented via confirmed reports
      email: t.email || '',
      status: 'قيد الانتظار' as const
    }));
    
    const savedTStatus = localStorage.getItem(`tahfez_fin_t_${selectedMonth}`);
    if (savedTStatus) {
      setTeachersList(JSON.parse(savedTStatus));
    } else {
      setTeachersList(tRows);
      if (tRows.length > 0) localStorage.setItem(`tahfez_fin_t_${selectedMonth}`, JSON.stringify(tRows));
    }

    // Supervisors — load from CRUD only (no fake fallback)
    const savedSupervisors = localStorage.getItem('tahfez_supervisors_crud');
    const sData = savedSupervisors ? JSON.parse(savedSupervisors) : [];

    const sRows: SupervisorFinanceRow[] = sData.map((s: any) => ({
      id: s.id,
      name: s.name,
      baseHours: 0,
      email: s.email || '',
      status: 'قيد الانتظار' as const
    }));

    const savedSStatus = localStorage.getItem(`tahfez_fin_s_${selectedMonth}`);
    if (savedSStatus) {
      setSupervisorsList(JSON.parse(savedSStatus));
    } else {
      setSupervisorsList(sRows);
      if (sRows.length > 0) localStorage.setItem(`tahfez_fin_s_${selectedMonth}`, JSON.stringify(sRows));
    }
  }, [selectedMonth]);

  // Save changes to localStorage
  const updateTeacherStatus = (id: string) => {
    const updated = teachersList.map(t => 
      t.id === id ? { ...t, status: t.status === 'مدفوع' ? 'قيد الانتظار' as const : 'مدفوع' as const } : t
    );
    setTeachersList(updated);
    localStorage.setItem(`tahfez_fin_t_${selectedMonth}`, JSON.stringify(updated));
  };

  const updateSupervisorStatus = (id: string) => {
    const updated = supervisorsList.map(s => 
      s.id === id ? { ...s, status: s.status === 'مدفوع' ? 'قيد الانتظار' as const : 'مدفوع' as const } : s
    );
    setSupervisorsList(updated);
    localStorage.setItem(`tahfez_fin_s_${selectedMonth}`, JSON.stringify(updated));
  };

  // Every confirmed report = 2 hours for the first teacher & first supervisor
  // (distributed equally if multiple teachers/supervisors)
  const confirmedLogsCount = progressLogs.filter(log => log.status === 'CONFIRMED').length;
  const pendingLogsCount = progressLogs.filter(log => log.status === 'PENDING').length;

  const getTeacherHours = (row: TeacherFinanceRow) => {
    // Each teacher earns 2h per confirmed report, split equally
    const perTeacher = teachersList.length > 0 ? Math.round((confirmedLogsCount * 2) / teachersList.length) : 0;
    return row.baseHours + perTeacher;
  };

  const getSupervisorHours = (row: SupervisorFinanceRow) => {
    const perSupervisor = supervisorsList.length > 0 ? Math.round((confirmedLogsCount * 2) / supervisorsList.length) : 0;
    return row.baseHours + perSupervisor;
  };

  // Sum total payouts
  const calculatedTeacherTotal = teachersList.reduce((sum, t) => sum + (getTeacherHours(t) * teacherHourlyRate), 0);
  const calculatedSupervisorTotal = supervisorsList.reduce((sum, s) => sum + (getSupervisorHours(s) * supervisorHourlyRate), 0);
  
  const totalPaid = teachersList.filter(t => t.status === 'مدفوع').reduce((sum, t) => sum + (getTeacherHours(t) * teacherHourlyRate), 0) +
                    supervisorsList.filter(s => s.status === 'مدفوع').reduce((sum, s) => sum + (getSupervisorHours(s) * supervisorHourlyRate), 0);

  const totalPending = teachersList.filter(t => t.status === 'قيد الانتظار').reduce((sum, t) => sum + (getTeacherHours(t) * teacherHourlyRate), 0) +
                       supervisorsList.filter(s => s.status === 'قيد الانتظار').reduce((sum, s) => sum + (getSupervisorHours(s) * supervisorHourlyRate), 0);

  const handleRequestPayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3000);
  };

  const role = currentUser?.role || 'ADMIN';

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors font-sans pb-12">
        
        {/* Hero Section */}
        <section className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">الماليات والحسابات العامة</h2>
            <p className="text-sm text-gray-500 max-w-xl">إدارة الرواتب وتوزيع المستحقات بالساعة وتتبع مدفوعات المعلمين والمشرفين.</p>
          </div>
          
          {/* Month Selector Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400">الشهر المستهدف:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold focus:outline-none"
            >
              <option value="يونيو 2026">يونيو 2026</option>
              <option value="مايو 2026">مايو 2026</option>
              <option value="أبريل 2026">أبريل 2026</option>
            </select>
          </div>
        </section>

        {/* TOP PANEL: HOURLY RATE CONFIGURATION */}
        <section className="mb-8 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-md space-y-6">
          <h3 className="font-extrabold text-sm text-primary dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚙️</span> لوحة تحديد سعر أجر الساعة (كادر الإدارة)
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="p-4 rounded-2xl bg-cream/40 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 space-y-3">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">أجر الساعة للمحفظ (المعلم) *</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={teacherHourlyRate}
                  onChange={(e) => setTeacherHourlyRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:outline-none focus:border-primary"
                  placeholder="150"
                />
                <span className="text-xs font-bold text-gray-500 shrink-0">ج.م / ساعة</span>
              </div>
              <p className="text-[10px] text-gray-400">يتم ضرب القيمة في مجموع ساعات العمل المحتسبة للمعلم شهرياً.</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream/40 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 space-y-3">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">أجر الساعة للمشرف *</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={supervisorHourlyRate}
                  onChange={(e) => setSupervisorHourlyRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:outline-none focus:border-primary"
                  placeholder="50"
                />
                <span className="text-xs font-bold text-gray-500 shrink-0">ج.م / ساعة</span>
              </div>
              <p className="text-[10px] text-gray-400">يتم ضرب القيمة في مجموع ساعات المراجعة والاعتماد المحتسبة للمشرف.</p>
            </div>
          </div>
        </section>

        {/* STATS SUMMARY CARD */}
        <section className="grid sm:grid-cols-3 gap-6 mb-8 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs text-gray-500 font-bold">إجمالي المصروفات لـ {selectedMonth} (مدفوع)</p>
            <h3 className="text-2xl font-extrabold text-primary dark:text-emerald-400 mt-1">{totalPaid.toLocaleString()} ج.م</h3>
            <p className="text-[10px] text-gray-400 mt-1">تشمل الحوالات البنكية المكتملة</p>
          </div>
          
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs text-gray-500 font-bold">المستحقات المعلقة (بانتظار الصرف)</p>
            <h3 className="text-2xl font-extrabold text-amber-500 mt-1">{totalPending.toLocaleString()} ج.م</h3>
            <p className="text-[10px] text-gray-400 mt-1">بانتظار تأكيد الإدارة أو صرفها يدوياً</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold">الحساب الجاري المعتمد</p>
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">
                {role === 'TEACHER' ? `${(24 + confirmedLogsCount * 2) * teacherHourlyRate} ج.م` : role === 'SUPERVISOR' ? `${(16 + confirmedLogsCount * 2) * supervisorHourlyRate} ج.م` : 'إدارة الحسابات الإجمالية'}
              </h4>
            </div>
            <button 
              onClick={handleRequestPayout}
              className="w-full mt-2 py-2 bg-gradient-to-r from-gold to-amber-600 text-white font-bold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-all"
            >
              تقديم طلب صرف مستحقات
            </button>
          </div>
        </section>

        {payoutSuccess && (
          <div className="p-4 mb-6 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
            ✅ تم تقديم طلب صرف مستحقاتك بنجاح! سيقوم مشرف المالية بمراجعته وتحويل المبلغ لحسابك البنكي خلال 48 ساعة.
          </div>
        )}

        {/* TWO SEPARATED FINANCIAL SECTIONS */}
        <div className="space-y-12">
          
          {/* SECTION 1: TUTORS (TEACHERS) FINANCES */}
          <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <span>👳‍♂️</span> مستحقات وحسابات الساعات للمحفظين (المعلمين)
              </h3>
              <span className="text-xs font-bold text-gray-400">سعر الساعة الحالي: {teacherHourlyRate} ج.م</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold text-xs">
                    <th className="pb-3">المحفظ المستلم</th>
                    <th className="pb-3">ساعات العمل المحتسبة</th>
                    <th className="pb-3">أجر الساعة</th>
                    <th className="pb-3">إجمالي الأجر المستحق</th>
                    <th className="pb-3">الشهر المستهدف</th>
                    <th className="pb-3">حالة الدفع</th>
                    {role === 'ADMIN' && <th className="pb-3 text-center">الإجراءات والتحويل</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {teachersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-500 font-bold">لا يوجد معلمون مسجلون.</td>
                    </tr>
                  ) : (
                    teachersList.map(t => {
                      const hours = getTeacherHours(t);
                      const salary = hours * teacherHourlyRate;
                      const isPaid = t.status === 'مدفوع';
                      
                      return (
                        <tr key={t.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                          <td className="py-4 font-bold">
                            <p className="text-gray-950 dark:text-white">{t.name}</p>
                            <p className="text-[10px] text-gray-500 font-normal mt-0.5">{t.email}</p>
                          </td>
                          <td className="py-4 font-mono font-bold">
                            <span>{hours} ساعة</span>
                            {t.id === 't-1' && confirmedLogsCount > 0 && (
                              <span className="text-[9px] text-primary dark:text-emerald-400 block font-normal mt-0.5">
                                (+{confirmedLogsCount * 2} ساعة بونص تقارير معتمدة)
                              </span>
                            )}
                          </td>
                          <td className="py-4 font-mono">{teacherHourlyRate} ج.م</td>
                          <td className="py-4 font-mono font-bold text-primary dark:text-emerald-400">{salary.toLocaleString()} ج.م</td>
                          <td className="py-4 font-bold text-gray-500">{selectedMonth}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                              isPaid 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          {role === 'ADMIN' && (
                            <td className="py-4 text-center">
                              <button
                                onClick={() => updateTeacherStatus(t.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] shadow-sm hover:scale-105 transition-all ${
                                  isPaid 
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' 
                                    : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                                }`}
                              >
                                {isPaid ? '⚙️ تعليق الصرف' : '💰 صرف المستحقات'}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 2: SUPERVISORS FINANCES */}
          <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <span>👥</span> مستحقات وحسابات الساعات لمشرفي الحلقات والعموم
              </h3>
              <span className="text-xs font-bold text-gray-400">سعر الساعة الحالي: {supervisorHourlyRate} ج.م</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold text-xs">
                    <th className="pb-3">المشرف المستلم</th>
                    <th className="pb-3">ساعات التدقيق والإشراف</th>
                    <th className="pb-3">أجر الساعة</th>
                    <th className="pb-3">إجمالي الأجر المستحق</th>
                    <th className="pb-3">الشهر المستهدف</th>
                    <th className="pb-3">حالة الدفع</th>
                    {role === 'ADMIN' && <th className="pb-3 text-center">الإجراءات والتحويل</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {supervisorsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-500 font-bold">لا يوجد مشرفون مسجلون.</td>
                    </tr>
                  ) : (
                    supervisorsList.map(s => {
                      const hours = getSupervisorHours(s);
                      const salary = hours * supervisorHourlyRate;
                      const isPaid = s.status === 'مدفوع';

                      return (
                        <tr key={s.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                          <td className="py-4 font-bold">
                            <p className="text-gray-950 dark:text-white">{s.name}</p>
                            <p className="text-[10px] text-gray-500 font-normal mt-0.5">{s.email}</p>
                          </td>
                          <td className="py-4 font-mono font-bold">
                            <span>{hours} ساعة</span>
                            {s.id === 'sup-1' && confirmedLogsCount > 0 && (
                              <span className="text-[9px] text-primary dark:text-emerald-400 block font-normal mt-0.5">
                                (+{confirmedLogsCount * 2} ساعة بونص تقارير مؤكدة)
                              </span>
                            )}
                          </td>
                          <td className="py-4 font-mono">{supervisorHourlyRate} ج.م</td>
                          <td className="py-4 font-mono font-bold text-primary dark:text-emerald-400">{salary.toLocaleString()} ج.م</td>
                          <td className="py-4 font-bold text-gray-500">{selectedMonth}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                              isPaid 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          {role === 'ADMIN' && (
                            <td className="py-4 text-center">
                              <button
                                onClick={() => updateSupervisorStatus(s.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] shadow-sm hover:scale-105 transition-all ${
                                  isPaid 
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' 
                                    : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                                }`}
                              >
                                {isPaid ? '⚙️ تعليق الصرف' : '💰 صرف المستحقات'}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
