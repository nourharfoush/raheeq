'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminSettingsPage() {
  const { theme } = useApp();
  
  // Backup simulation states
  const [backupStatus, setBackupStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Restore simulation states
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [restoredFile, setRestoredFile] = useState('');
  const [selectedSettingTab, setSelectedSettingTab] = useState<'general' | 'backup'>('general');

  // Mock list of database backups on the server
  const [backupsArchive, setBackupsArchive] = useState([
    { id: 'b-1', filename: 'tahfez_backup_2026_06_30.json', size: '540 KB', date: '2026-06-30 08:30' },
    { id: 'b-2', filename: 'tahfez_backup_2026_06_29.json', size: '512 KB', date: '2026-06-29 08:30' },
    { id: 'b-3', filename: 'tahfez_backup_2026_06_28.json', size: '498 KB', date: '2026-06-28 08:30' }
  ]);

  const triggerBackup = () => {
    setBackupStatus('running');
    setTimeout(() => {
      setBackupStatus('done');
      // Append new backup to archive simulation
      const newBackup = {
        id: 'b-' + Date.now(),
        filename: `tahfez_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_auto.json`,
        size: '545 KB',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      setBackupsArchive(prev => [newBackup, ...prev]);
    }, 2000);
  };

  const triggerRestoreFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreStatus('running');
    setRestoredFile(file.name);
    setTimeout(() => { setRestoreStatus('done'); }, 2000);
  };

  const triggerRestoreFromArchive = (filename: string) => {
    setRestoreStatus('running');
    setRestoredFile(filename);
    setTimeout(() => { setRestoreStatus('done'); }, 2000);
  };

  const handlePlatformReset = () => {
    const keys = ['t_users','t_student_profiles','t_teacher_profiles','t_halaqat',
                   't_sessions','t_attendance','t_plans','t_progress','t_evaluations',
                   't_subscriptions','t_notifications','t_current_user',
                   'tahfez_teachers_crud','tahfez_supervisors_crud','tahfez_general_supervisors_crud'];
    keys.forEach(k => localStorage.removeItem(k));
    Object.keys(localStorage).filter(k => k.startsWith('tahfez_fin_')).forEach(k => localStorage.removeItem(k));
    setResetConfirm(false);
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors font-sans pb-12">
        {/* Hero Section */}
        <section className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">بوابة التحكم والضبط التقني</h2>
          <p className="text-sm text-gray-500 max-w-xl mt-1">إعدادات النظام، والنسخ الاحتياطي لقاعدة البيانات، وآليات الاستعادة والتهيئة.</p>
        </section>

        {/* Main settings container */}
        <section className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-250">
          {/* Left Side menu */}
          <div className="md:col-span-1 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-2 h-fit font-sans">
            <h4 className="font-bold text-xs text-gray-400 mb-4 uppercase tracking-wider">الخيارات العامة</h4>
            <button 
              onClick={() => setSelectedSettingTab('general')}
              className={`w-full text-right px-4 py-3 font-bold rounded-xl text-xs transition-all ${
                selectedSettingTab === 'general' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-primary dark:text-emerald-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              ⚙️ تهيئة خادم المقارئ والتسجيل
            </button>
            <button 
              onClick={() => setSelectedSettingTab('backup')}
              className={`w-full text-right px-4 py-3 font-bold rounded-xl text-xs transition-all ${
                selectedSettingTab === 'backup' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-primary dark:text-emerald-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              💾 قاعدة البيانات والنسخ والاستعادة
            </button>
            <button 
              onClick={() => setSelectedSettingTab('reset' as any)}
              className={`w-full text-right px-4 py-3 font-bold rounded-xl text-xs transition-all ${
                selectedSettingTab === ('reset' as any)
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              🔄 إعادة تهيئة بيانات المنصة
            </button>
          </div>

          {/* Right side forms */}
          <div className="md:col-span-2 space-y-8">
            
            {/* TAB 1: GENERAL SETTINGS */}
            {selectedSettingTab === 'general' && (
              <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 animate-in fade-in duration-200">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">إعدادات التسجيل والقبول</h3>
                
                <div className="flex justify-between items-center p-4 rounded-2xl bg-cream dark:bg-gray-800/40 text-xs">
                  <div>
                    <p className="font-bold text-gray-950 dark:text-white">فتح باب التسجيل المفتوح للطلاب الجدد</p>
                    <p className="text-gray-500 mt-1">يسمح للطلاب بالتسجيل وتأكيد حساباتهم عبر الـ OTP تلقائياً</p>
                  </div>
                  <button 
                    onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                      isRegistrationOpen ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {isRegistrationOpen ? 'مفتوح' : 'مغلق'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">رابط خادم الجلسات التفاعلية المباشرة (Jitsi Room Host)</label>
                    <input 
                      type="text" 
                      defaultValue="https://meet.jit.si" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DATABASE BACKUP & RESTORE */}
            {selectedSettingTab === 'backup' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* BACKUP SECTION */}
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>💾</span> إدارة النسخ الاحتياطي لقاعدة البيانات
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ينصح بعمل نسخة احتياطية دورية للبيانات وحفظها على خوادم سحابية منفصلة لضمان أمان سجلات الدارسين والحلقات.
                  </p>

                  <div className="flex gap-4 items-center flex-wrap">
                    <button
                      onClick={triggerBackup}
                      disabled={backupStatus === 'running'}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 hover:scale-[1.01] transition-all"
                    >
                      {backupStatus === 'running' ? 'جاري توليد النسخة...' : '💾 بدء النسخ الاحتياطي الفوري'}
                    </button>

                    {backupStatus === 'done' && (
                      <div className="flex-1 p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                        ✅ تم توليد وحفظ النسخة الاحتياطية بنجاح في أرشيف الخادم!
                      </div>
                    )}
                  </div>
                </div>

                {/* RESTORE SECTION */}
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🔄</span> استعادة قاعدة البيانات والملفات (Restore)
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    قم برفع ملف نسخة احتياطية سابقة من جهازك، أو اختر مباشرة من أرشيف النسخ المحفوظة على الخادم لاستعادة الحالة السابقة للنظام.
                  </p>

                  {/* Option A: Manual File Upload */}
                  <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/10 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-2xl">📂</span>
                    <div>
                      <p className="text-xs font-bold text-gray-850 dark:text-gray-200">رفع ملف نسخة احتياطية يدوي (.json / .sql)</p>
                      <p className="text-[10px] text-gray-400 mt-1">الحد الأقصى للملف: 50 ميجابايت</p>
                    </div>
                    <label className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-750 dark:text-gray-200 font-bold text-xs cursor-pointer hover:bg-gray-250/70 transition-all">
                      <span>اختار ملف من جهازك</span>
                      <input 
                        type="file" 
                        accept=".json,.sql"
                        onChange={triggerRestoreFromFile}
                        className="hidden" 
                        disabled={restoreStatus === 'running'}
                      />
                    </label>
                  </div>

                  {/* Option B: Restore from Archive list */}
                  <div className="space-y-4 pt-2">
                    <h4 className="font-bold text-xs text-gray-500">سجل النسخ الاحتياطية المتاحة على الخادم:</h4>
                    
                    <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-2xl shadow-inner bg-cream/10 dark:bg-gray-900">
                      <table className="w-full text-right text-xs font-sans">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 font-bold border-b border-gray-150/40">
                            <th className="p-3">اسم النسخة الاحتياطية</th>
                            <th className="p-3">الحجم</th>
                            <th className="p-3">تاريخ النسخ</th>
                            <th className="p-3 text-center">الإجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {backupsArchive.map(b => (
                            <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                              <td className="p-3 font-bold text-gray-800 dark:text-gray-200 font-mono">{b.filename}</td>
                              <td className="p-3 text-gray-500 font-mono">{b.size}</td>
                              <td className="p-3 text-gray-500 font-mono">{b.date}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => triggerRestoreFromArchive(b.filename)}
                                  disabled={restoreStatus === 'running'}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-primary dark:text-emerald-300 font-bold text-[10px] hover:scale-105 transition-all disabled:opacity-50"
                                >
                                  🔄 استعادة
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Status Alerts */}
                  {restoreStatus === 'running' && (
                    <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-250 dark:bg-amber-950/20 dark:text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block border-2 border-amber-800 border-t-transparent rounded-full w-4 h-4"></span>
                      <span>جاري فحص سلامة الملف واسترجاع سجلات قاعدة البيانات [{restoredFile}]...</span>
                    </div>
                  )}

                  {restoreStatus === 'done' && (
                    <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center animate-bounce">
                      ✅ تم استعادة قاعدة البيانات بنجاح من النسخة الاحتياطية [{restoredFile}] وإعادة مزامنة المقارئ الحية!
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB 3: PLATFORM RESET */}
            {selectedSettingTab === ('reset' as any) && (
              <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-950/40 shadow-xl space-y-6 animate-in fade-in duration-200">
                <h3 className="text-lg font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span>⚠️</span> إعادة تهيئة بيانات المنصة من الصفر
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  سيؤدي هذا الإجراء إلى <strong>حذف جميع البيانات المحفوظة</strong> في متصفحك (المستخدمون، الحلقات، التقارير، الاشتراكات، الماليات) وإعادة المنصة لحالتها الأولية مع حساب المدير فقط.
                </p>

                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs font-bold text-red-700 dark:text-red-300 flex items-start gap-3">
                  <span className="text-lg mt-0.5">🔴</span>
                  <div>
                    <p>هذا الإجراء <u>لا يمكن التراجع عنه</u>. سيتم حذف كل ما تم إدخاله في المنصة بالكامل من ذاكرة المتصفح ولا يمكن استرجاعه إلا من نسخة احتياطية.</p>
                    <p className="mt-1">ينصح بأخذ نسخة احتياطية أولاً من تبويب "قاعدة البيانات والنسخ والاستعادة".</p>
                  </div>
                </div>

                {!resetConfirm ? (
                  <button
                    onClick={() => setResetConfirm(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all"
                  >
                    🗑️ بدء إجراء مسح البيانات وإعادة التهيئة
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 text-xs font-bold text-center">
                      ⚠️ هل أنت متأكد تماماً؟ سيتم حذف كل البيانات ولا يمكن التراجع!
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handlePlatformReset}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        ✅ نعم، احذف كل البيانات وأعد التهيئة
                      </button>
                      <button
                        onClick={() => setResetConfirm(false)}
                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs rounded-xl transition-all"
                      >
                        ❌ إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
