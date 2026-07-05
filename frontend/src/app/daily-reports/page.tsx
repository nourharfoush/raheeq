'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';
import { SURAHS_DATA } from '@/utils/quranData';

export default function DailyReportsPage() {
  const { 
    currentUser, progressLogs, users, studentProfiles, teacherProfiles, halaqat,
    addProgressLog, confirmProgressLog, deleteProgressLog, updateProgressLog
  } = useApp();

  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  
  // Filter state
  const [selectedHalaqaFilter, setSelectedHalaqaFilter] = useState('الكل');

  // Form states
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [selectedHalaqaId, setSelectedHalaqaId] = useState('');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // Section 1: Tasmeegh
  const [tasmeeghFromSurah, setTasmeeghFromSurah] = useState('الفاتحة');
  const [tasmeeghFromAyah, setTasmeeghFromAyah] = useState(1);
  const [tasmeeghToSurah, setTasmeeghToSurah] = useState('الفاتحة');
  const [tasmeeghToAyah, setTasmeeghToAyah] = useState(7);

  // Section 2: Hifz
  const [hifzFromSurah, setHifzFromSurah] = useState('البقرة');
  const [hifzFromAyah, setHifzFromAyah] = useState(1);
  const [hifzToSurah, setHifzToSurah] = useState('البقرة');
  const [hifzToAyah, setHifzToAyah] = useState(5);

  // Section 3: Near Revision
  const [nearRevFromSurah, setNearRevFromSurah] = useState('الناس');
  const [nearRevFromAyah, setNearRevFromAyah] = useState(1);
  const [nearRevToSurah, setNearRevToSurah] = useState('الناس');
  const [nearRevToAyah, setNearRevToAyah] = useState(6);

  // Section 4: Far Revision
  const [farRevFromSurah, setFarRevFromSurah] = useState('الفلق');
  const [farRevFromAyah, setFarRevFromAyah] = useState(1);
  const [farRevToSurah, setFarRevToSurah] = useState('الفلق');
  const [farRevToAyah, setFarRevToAyah] = useState(5);

  const role = currentUser?.role || 'ADMIN';

  const teacherProfile = teacherProfiles.find(tp => tp.userId === currentUser?.id);
  const myTeacherId = teacherProfile ? teacherProfile.id : 't-profile';

  const supervisorsList = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tahfez_supervisors_crud') || '[]') : [];
  const supervisorProfile = supervisorsList.find((s: any) => s.email === currentUser?.username || s.name === currentUser?.name);
  const mySupervisorId = supervisorProfile ? supervisorProfile.id : 'sup-1';

  const myHalaqatList = role === 'TEACHER' 
    ? halaqat.filter(h => h.teacherId === myTeacherId) 
    : role === 'SUPERVISOR'
      ? halaqat.filter(h => h.supervisorId === mySupervisorId)
      : halaqat;

  const myHalaqatIds = myHalaqatList.map(h => h.id);

  // Ensure default selections
  useEffect(() => {
    if (myHalaqatList.length > 0 && !selectedHalaqaId) {
      setSelectedHalaqaId(myHalaqatList[0].id);
    }
  }, [myHalaqatList, selectedHalaqaId]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHalaqaId) {
      alert('الرجاء اختيار الحلقة');
      return;
    }

    const payload = {
      halaqaId: selectedHalaqaId,
      date: new Date(reportDate).toISOString(),
      surah: tasmeeghFromSurah, 
      startAyah: Number(tasmeeghFromAyah),
      endAyah: Number(tasmeeghToAyah),
      pagesCount: 2.0, 
      isRevision: false,
      notes: logNotes,

      tasmeeghFromSurah,
      tasmeeghFromAyah: Number(tasmeeghFromAyah),
      tasmeeghToSurah,
      tasmeeghToAyah: Number(tasmeeghToAyah),

      hifzFromSurah,
      hifzFromAyah: Number(hifzFromAyah),
      hifzToSurah,
      hifzToAyah: Number(hifzToAyah),

      nearRevisionFromSurah: nearRevFromSurah,
      nearRevisionFromAyah: Number(nearRevFromAyah),
      nearRevisionToSurah: nearRevToSurah,
      nearRevisionToAyah: Number(nearRevToAyah),

      farRevisionFromSurah: farRevFromSurah,
      farRevisionFromAyah: Number(farRevFromAyah),
      farRevisionToSurah: farRevToSurah,
      farRevisionToAyah: Number(farRevToAyah)
    };

    if (editingLogId) {
      updateProgressLog(editingLogId, payload);
    } else {
      addProgressLog({
        ...payload,
        status: 'PENDING'
      });
    }

    setLogSuccess(true);
    setLogNotes('');
    setEditingLogId(null);
    setTimeout(() => {
      setLogSuccess(false);
      setActiveTab('view');
    }, 1500);
  };

  const handleStartEdit = (log: any) => {
    setEditingLogId(log.id);
    setSelectedHalaqaId(log.halaqaId || '');
    setReportDate(log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setLogNotes(log.notes || '');

    // Load sub-fields if present
    setTasmeeghFromSurah(log.tasmeeghFromSurah || 'الفاتحة');
    setTasmeeghFromAyah(log.tasmeeghFromAyah || 1);
    setTasmeeghToSurah(log.tasmeeghToSurah || 'الفاتحة');
    setTasmeeghToAyah(log.tasmeeghToAyah || 7);

    setHifzFromSurah(log.hifzFromSurah || 'البقرة');
    setHifzFromAyah(log.hifzFromAyah || 1);
    setHifzToSurah(log.hifzToSurah || 'البقرة');
    setHifzToAyah(log.hifzToAyah || 5);

    setNearRevFromSurah(log.nearRevisionFromSurah || 'الناس');
    setNearRevFromAyah(log.nearRevisionFromAyah || 1);
    setNearRevToSurah(log.nearRevisionToSurah || 'الناس');
    setNearRevToAyah(log.nearRevisionToAyah || 6);

    setFarRevFromSurah(log.farRevisionFromSurah || 'الفلق');
    setFarRevFromAyah(log.farRevisionFromAyah || 1);
    setFarRevToSurah(log.farRevisionToSurah || 'الفلق');
    setFarRevToAyah(log.farRevisionToAyah || 5);

    setActiveTab('add');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير نهائياً؟')) {
      deleteProgressLog(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setLogNotes('');
    setActiveTab('view');
  };

  // Helper to fetch total ayahs for a given surah name
  const getAyahCount = (surahName: string): number => {
    const entry = SURAHS_DATA.find(s => s.name === surahName);
    return entry ? entry.ayahs : 7;
  };

  const getHalaqaName = (hId?: string) => {
    const found = halaqat.find(h => h.id === hId);
    return found ? found.name : 'الحلقة العامة';
  };

  const filteredLogs = progressLogs.filter(log => {
    const matchesRole = role === 'ADMIN' || !log.halaqaId || myHalaqatIds.includes(log.halaqaId);
    const matchesHalaqaFilter = selectedHalaqaFilter === 'الكل' || log.halaqaId === selectedHalaqaFilter;
    return matchesRole && matchesHalaqaFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors font-sans pb-12">
        
        {/* Header */}
        <section className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">التقارير اليومية للتسميع والتحفيظ</h2>
            <p className="text-sm text-gray-500 max-w-xl">متابعة دقيقة للأوراد المدخلة يومياً للحلقات واعتمادها تربوياً ومالياً.</p>
          </div>
          
          {(role === 'TEACHER' || role === 'ADMIN') && (
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit">
              <button
                onClick={editingLogId ? handleCancelEdit : () => setActiveTab('view')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'view' ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                📋 عرض التقارير
              </button>
              <button
                onClick={() => { setEditingLogId(null); setLogNotes(''); setActiveTab('add'); }}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'add' && !editingLogId ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                ➕ إنشاء تقرير يومي
              </button>
            </div>
          )}
        </section>

        {activeTab === 'add' && (role === 'TEACHER' || role === 'ADMIN') ? (
          /* ADD / EDIT REPORT FORM */
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">
                {editingLogId ? '✏️ تعديل تقرير ورد التلاوة اليومي' : '🕌 إطلاق تقرير ورد التلاوة اليومي للحلقة'}
              </h3>
              {editingLogId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-8">
              {/* Target Halaqa and Date selectors */}
              <div className="grid sm:grid-cols-2 gap-6 bg-cream/30 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">الحلقة القرآنية المستهدفة *</label>
                  <select
                    required
                    value={selectedHalaqaId}
                    onChange={(e) => setSelectedHalaqaId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-primary"
                  >
                    {myHalaqatList.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">تاريخ التقرير *</label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* 4 Quadrants of the Daily Report */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* 1. التسميع */}
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/5 dark:bg-emerald-950/5 space-y-4">
                  <h4 className="font-bold text-xs text-primary dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📖</span> التسميع والاختبار
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">من سورة</label>
                      <select
                        value={tasmeeghFromSurah}
                        onChange={(e) => { setTasmeeghFromSurah(e.target.value); setTasmeeghFromAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={tasmeeghFromAyah}
                        onChange={(e) => setTasmeeghFromAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(tasmeeghFromSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">إلى سورة</label>
                      <select
                        value={tasmeeghToSurah}
                        onChange={(e) => { setTasmeeghToSurah(e.target.value); setTasmeeghToAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={tasmeeghToAyah}
                        onChange={(e) => setTasmeeghToAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(tasmeeghToSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. التحفيظ */}
                <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-50/5 dark:bg-blue-950/5 space-y-4">
                  <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✍️</span> التحفيظ (حفظ جديد)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">من سورة</label>
                      <select
                        value={hifzFromSurah}
                        onChange={(e) => { setHifzFromSurah(e.target.value); setHifzFromAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={hifzFromAyah}
                        onChange={(e) => setHifzFromAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(hifzFromSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">إلى سورة</label>
                      <select
                        value={hifzToSurah}
                        onChange={(e) => { setHifzToSurah(e.target.value); setHifzToAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={hifzToAyah}
                        onChange={(e) => setHifzToAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(hifzToSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. المراجعة القريبة */}
                <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-50/5 dark:bg-amber-950/5 space-y-4">
                  <h4 className="font-bold text-xs text-gold uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔁</span> المراجعة القريبة
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">من سورة</label>
                      <select
                        value={nearRevFromSurah}
                        onChange={(e) => { setNearRevFromSurah(e.target.value); setNearRevFromAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={nearRevFromAyah}
                        onChange={(e) => setNearRevFromAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(nearRevFromSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">إلى سورة</label>
                      <select
                        value={nearRevToSurah}
                        onChange={(e) => { setNearRevToSurah(e.target.value); setNearRevToAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={nearRevToAyah}
                        onChange={(e) => setNearRevToAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(nearRevToSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. المراجعة البعيدة */}
                <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-50/5 dark:bg-purple-950/5 space-y-4">
                  <h4 className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔁</span> المراجعة البعيدة
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">من سورة</label>
                      <select
                        value={farRevFromSurah}
                        onChange={(e) => { setFarRevFromSurah(e.target.value); setFarRevFromAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={farRevFromAyah}
                        onChange={(e) => setFarRevFromAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(farRevFromSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">إلى سورة</label>
                      <select
                        value={farRevToSurah}
                        onChange={(e) => { setFarRevToSurah(e.target.value); setFarRevToAyah(1); }}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        {SURAHS_DATA.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold">الآية</label>
                      <select
                        value={farRevToAyah}
                        onChange={(e) => setFarRevToAyah(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-center"
                      >
                        {Array.from({ length: getAyahCount(farRevToSurah) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">توجيهات المعلم وملاحظات الأداء (اختياري)</label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="اكتب هنا أي تنبيهات أو توجيهات للدارس..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
              >
                {editingLogId ? '💾 حفظ التعديلات المحدثة' : '🚀 إرسال التقرير اليومي للمراجعة والاعتماد'}
              </button>

              {logSuccess && (
                <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                  {editingLogId ? '✅ تم تحديث التقرير بنجاح!' : '✅ تم إرسال تقرير الورد بنجاح وبانتظار اعتماد مشرف الحلقات!'}
                </div>
              )}
            </form>
          </div>
        ) : (
          /* VIEW REPORTS LIST */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter Selector */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex-wrap">
              <span className="text-xs font-bold text-gray-500">تصفية حسب الحلقة:</span>
              <select
                value={selectedHalaqaFilter}
                onChange={(e) => setSelectedHalaqaFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/10 dark:bg-gray-800 text-xs focus:outline-none"
              >
                <option value="الكل">كل الحلقات</option>
                {myHalaqatList.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Reports Table container */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl overflow-hidden font-sans">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-6">سجلات التقارير اليومية المدخلة للحلقات</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold text-xs">
                      <th className="pb-3">الحلقة والمعلم</th>
                      <th className="pb-3">التسميع والاختبار</th>
                      <th className="pb-3">التحفيظ اليومي</th>
                      <th className="pb-3">المراجعة القريبة</th>
                      <th className="pb-3">المراجعة البعيدة</th>
                      <th className="pb-3">الحالة والاعتماد</th>
                      <th className="pb-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500 font-bold">
                          لا توجد تقارير مسجلة للحلقات المحددة حالياً.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map(log => {
                        const isConfirmed = log.status === 'CONFIRMED';
                        const halaqa = halaqat.find(h => h.id === log.halaqaId);
                        
                        let teacherName = 'غير معين';
                        if (halaqa) {
                          const teacherProf = teacherProfiles.find(tp => tp.id === halaqa.teacherId || tp.userId === halaqa.teacherId);
                          const teacherUser = users.find(u => u.id === teacherProf?.userId || u.id === halaqa.teacherId || u.id === 'u-teacher');
                          if (teacherUser) {
                            teacherName = teacherUser.name;
                          }
                        }
                        
                        return (
                          <tr key={log.id} className="text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                            {/* Halaqa Info */}
                            <td className="py-4 font-bold max-w-[150px]">
                              <p className="text-gray-900 dark:text-white">{getHalaqaName(log.halaqaId)}</p>
                              <p className="text-[10px] text-gray-500 font-normal mt-0.5">المحفظ: {teacherName}</p>
                              <p className="text-[9px] text-primary dark:text-emerald-400 font-mono mt-0.5">{new Date(log.date).toLocaleDateString('ar-EG')}</p>
                            </td>

                            {/* Recitation Section */}
                            <td className="py-4">
                              {log.tasmeeghFromSurah ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">سورة {log.tasmeeghFromSurah} ({log.tasmeeghFromAyah})</p>
                                  <p className="text-gray-400">إلى سورة {log.tasmeeghToSurah} ({log.tasmeeghToAyah})</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* Hifz Section */}
                            <td className="py-4">
                              {log.hifzFromSurah ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-blue-600 dark:text-blue-400">سورة {log.hifzFromSurah} ({log.hifzFromAyah})</p>
                                  <p className="text-gray-400">إلى {log.hifzToSurah} ({log.hifzToAyah})</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* Near Revision Section */}
                            <td className="py-4">
                              {log.nearRevisionFromSurah ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-amber-600 dark:text-gold">سورة {log.nearRevisionFromSurah} ({log.nearRevisionFromAyah})</p>
                                  <p className="text-gray-400">إلى {log.nearRevisionToSurah} ({log.nearRevisionToAyah})</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* Far Revision Section */}
                            <td className="py-4">
                              {log.farRevisionFromSurah ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-purple-600 dark:text-purple-400">سورة {log.farRevisionFromSurah} ({log.farRevisionFromAyah})</p>
                                  <p className="text-gray-400">إلى {log.farRevisionToSurah} ({log.farRevisionToAyah})</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* Status badge */}
                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                                isConfirmed 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}>
                                {isConfirmed ? '🟢 معتمد ومؤكد' : '🔴 قيد المراجعة'}
                              </span>
                              {log.notes && <p className="text-[10px] text-gray-400 italic mt-1 max-w-[120px] truncate" title={log.notes}>توجيه: {log.notes}</p>}
                            </td>

                            {/* Actions (Confirm, Edit, Delete) */}
                            <td className="py-4 text-center">
                              <div className="flex justify-center items-center gap-2 flex-wrap max-w-[150px] mx-auto">
                                {(role === 'SUPERVISOR' || role === 'ADMIN') && !isConfirmed && (
                                  <button
                                    onClick={() => confirmProgressLog(log.id)}
                                    className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] hover:scale-105 transition-all"
                                  >
                                    اعتماد
                                  </button>
                                )}
                                {(role === 'TEACHER' || role === 'ADMIN') && (
                                  <>
                                    <button
                                      onClick={() => handleStartEdit(log)}
                                      className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[9px] hover:scale-105 transition-all"
                                    >
                                      تعديل
                                    </button>
                                    <button
                                      onClick={() => handleDelete(log.id)}
                                      className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-[9px] hover:scale-105 transition-all"
                                    >
                                      حذف
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
