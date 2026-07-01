'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import DashboardLayout from '@/components/DashboardLayout';

interface Teacher {
  id: string;
  name: string;
}

interface ProgressLog {
  id: string;
  studentId: string;
  surah: string;
  startAyah: number;
  endAyah: number;
  date: string;
  circleId?: string; // Linked circle
}

interface Halaqa {
  id: string;
  name: string;
  teacherId: string;
  startDate: string;
  startTime: string; // e.g. "04:00 م"
  endTime: string;   // e.g. "06:00 م"
  days: string[];    // e.g. ["السبت", "الإثنين"]
  linkType: 'INTERNAL' | 'EXTERNAL';
  externalLink?: string;
  initialSurah: string;
  initialAyah: string;
  description?: string;
  capacity?: number;
}

const WEEKDAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function HalaqatPage() {
  const { theme, toggleTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters States
  const [filterTeacher, setFilterTeacher] = useState('الكل');
  const [filterDay, setFilterDay] = useState('الكل');
  const [filterRunningNow, setFilterRunningNow] = useState(false);
  
  // CRUD States
  const [halaqat, setHalaqat] = useState<Halaqa[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHalaqa, setEditingHalaqa] = useState<Halaqa | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '', // رقم الحلقة
    name: '', // اسم الحلقة
    teacherId: '', // المحفظ
    startDate: '', // تاريخ البداية
    startTimeHour: '04',
    startTimeMinute: '00',
    startTimePeriod: 'م',
    endTimeHour: '06',
    endTimeMinute: '00',
    endTimePeriod: 'م',
    days: [] as string[],
    linkType: 'INTERNAL' as 'INTERNAL' | 'EXTERNAL',
    externalLink: '',
    initialSurah: 'البقرة',
    initialAyah: '1'
  });

  // Fetch current Arabic day name
  const getArabicToday = () => {
    const daysMap = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return daysMap[new Date().getDay()];
  };

  // Check if a circle is running now based on day & hour range
  const isCircleRunningNow = (halaqa: Halaqa) => {
    const todayName = getArabicToday();
    if (!halaqa.days || !halaqa.days.includes(todayName)) return false;

    const parseToMinutes = (timeStrStr: string) => {
      if (!timeStrStr) return 0;
      const parts = timeStrStr.split(' ');
      const hm = parts[0]?.split(':') || ['12', '00'];
      let hour = parseInt(hm[0] || '12', 10);
      const minute = parseInt(hm[1] || '00', 10);
      const period = parts[1] || 'م';
      
      if (period === 'م' && hour !== 12) hour += 12;
      if (period === 'ص' && hour === 12) hour = 0;
      return hour * 60 + minute;
    };

    try {
      const startMin = parseToMinutes(halaqa.startTime);
      const endMin = parseToMinutes(halaqa.endTime);
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      return nowMin >= startMin && nowMin <= endMin;
    } catch (e) {
      return false;
    }
  };

  // Load teachers, halaqat, and logs on mount
  useEffect(() => {
    // 1. Load Teachers from CRUD storage
    const savedTeachers = localStorage.getItem('tahfez_teachers_crud');
    let loadedTeachers: Teacher[] = [];
    if (savedTeachers) {
      loadedTeachers = JSON.parse(savedTeachers);
    } else {
      loadedTeachers = [
        { id: 't-1', name: 'الشيخ عبد الرحمن محمد' },
        { id: 't-2', name: 'الشيخ محمود عبد العزيز' },
        { id: 't-3', name: 'الشيخ أحمد عبد الوهاب' }
      ];
    }
    setTeachers(loadedTeachers);

    // 2. Load Progress Logs to scan latest circle reports
    const savedLogs = localStorage.getItem('tahfez_progress_logs');
    let loadedLogs: ProgressLog[] = [];
    if (savedLogs) {
      loadedLogs = JSON.parse(savedLogs);
    } else {
      loadedLogs = [
        { id: 'log-1', studentId: 's-1', surah: 'آل عمران', startAyah: 1, endAyah: 45, date: '2026-06-30', circleId: '101' },
        { id: 'log-2', studentId: 's-2', surah: 'النساء', startAyah: 1, endAyah: 12, date: '2026-06-29', circleId: '102' }
      ];
      localStorage.setItem('tahfez_progress_logs', JSON.stringify(loadedLogs));
    }
    setProgressLogs(loadedLogs);

    // 3. Load Halaqat
    const savedHalaqat = localStorage.getItem('tahfez_halaqat_crud');
    const todayName = getArabicToday();
    
    const now = new Date();
    const currentHour = now.getHours();
    const formatHour = (h: number) => String(h > 12 ? h - 12 : h === 0 ? 12 : h).padStart(2, '0');
    const getPeriod = (h: number) => (h >= 12 ? 'م' : 'ص');

    const demoStart = `${formatHour(currentHour - 1)}:00 ${getPeriod(currentHour - 1)}`;
    const demoEnd = `${formatHour(currentHour + 2)}:00 ${getPeriod(currentHour + 2)}`;

    if (savedHalaqat) {
      setHalaqat(JSON.parse(savedHalaqat));
    } else {
      const defaultSeeds: Halaqa[] = [
        { 
          id: '101', 
          name: 'حلقة التلاوة المصرية الأزهري', 
          teacherId: 't-1', 
          startDate: '2026-01-01', 
          startTime: demoStart, 
          endTime: demoEnd, 
          days: [todayName, 'الإثنين', 'الأربعاء'], 
          linkType: 'INTERNAL', 
          initialSurah: 'البقرة', 
          initialAyah: '1', 
          description: 'منهج ورش وحفص', 
          capacity: 15 
        },
        { 
          id: '102', 
          name: 'حلقة الهمم العالية للقرآن', 
          teacherId: 't-2', 
          startDate: '2026-02-15', 
          startTime: '07:30 م', 
          endTime: '09:00 م', 
          days: ['السبت', 'الثلاثاء', 'الخميس'], 
          linkType: 'EXTERNAL', 
          externalLink: 'https://teams.microsoft.com/l/meetup-join/mock', 
          initialSurah: 'البقرة', 
          initialAyah: '1', 
          description: 'حفظ مكثف للأطفال', 
          capacity: 10 
        }
      ];
      setHalaqat(defaultSeeds);
      localStorage.setItem('tahfez_halaqat_crud', JSON.stringify(defaultSeeds));
    }
  }, []);

  // Save to localStorage
  const saveHalaqat = (updated: Halaqa[]) => {
    setHalaqat(updated);
    localStorage.setItem('tahfez_halaqat_crud', JSON.stringify(updated));
  };

  const handleOpenAddModal = () => {
    setEditingHalaqa(null);
    setFormData({
      id: '',
      name: '',
      teacherId: teachers[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      startTimeHour: '04',
      startTimeMinute: '00',
      startTimePeriod: 'م',
      endTimeHour: '06',
      endTimeMinute: '00',
      endTimePeriod: 'م',
      days: ['الإثنين', 'الأربعاء'],
      linkType: 'INTERNAL',
      externalLink: '',
      initialSurah: 'البقرة',
      initialAyah: '1'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (halaqa: Halaqa) => {
    setEditingHalaqa(halaqa);
    
    const parseTime = (timeStr?: string) => {
      if (!timeStr || typeof timeStr !== 'string') {
        return { hour: '04', minute: '00', period: 'م' };
      }
      const parts = timeStr.split(' ');
      const hm = parts[0]?.split(':') || ['12', '00'];
      return {
        hour: hm[0] || '12',
        minute: hm[1] || '00',
        period: parts[1] || 'م'
      };
    };

    const startParsed = parseTime(halaqa.startTime);
    const endParsed = parseTime(halaqa.endTime);

    setFormData({
      id: halaqa.id,
      name: halaqa.name,
      teacherId: halaqa.teacherId,
      startDate: halaqa.startDate,
      startTimeHour: startParsed.hour,
      startTimeMinute: startParsed.minute,
      startTimePeriod: startParsed.period,
      endTimeHour: endParsed.hour,
      endTimeMinute: endParsed.minute,
      endTimePeriod: endParsed.period,
      days: halaqa.days || [],
      linkType: halaqa.linkType || 'INTERNAL',
      externalLink: halaqa.externalLink || '',
      initialSurah: halaqa.initialSurah || 'البقرة',
      initialAyah: halaqa.initialAyah || '1'
    });
    setIsModalOpen(true);
  };

  const handleDeleteHalaqa = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الحلقة نهائياً؟')) {
      const updated = halaqat.filter(h => h.id !== id);
      saveHalaqat(updated);
    }
  };

  const handleDayCheckboxChange = (day: string) => {
    setFormData(prev => {
      const exists = prev.days.includes(day);
      const updatedDays = exists 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day];
      return { ...prev, days: updatedDays };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.teacherId || !formData.startDate) {
      alert('الرجاء ملء جميع الحقول المطلوبة.');
      return;
    }
    if (formData.days.length === 0) {
      alert('الرجاء تحديد يوم واحد على الأقل للموعد الأسبوعي للحلقة.');
      return;
    }

    const formattedStartTime = `${formData.startTimeHour}:${formData.startTimeMinute} ${formData.startTimePeriod}`;
    const formattedEndTime = `${formData.endTimeHour}:${formData.endTimeMinute} ${formData.endTimePeriod}`;

    const submissionData: Halaqa = {
      id: formData.id,
      name: formData.name,
      teacherId: formData.teacherId,
      startDate: formData.startDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      days: formData.days,
      linkType: formData.linkType,
      externalLink: formData.linkType === 'EXTERNAL' ? formData.externalLink : undefined,
      initialSurah: formData.initialSurah,
      initialAyah: formData.initialAyah,
      capacity: 15
    };

    if (editingHalaqa) {
      // Edit Mode
      const updated = halaqat.map(h => 
        h.id === editingHalaqa.id 
          ? { ...h, ...submissionData } 
          : h
      );
      saveHalaqat(updated);
    } else {
      // Check if Circle ID already exists
      if (halaqat.some(h => h.id === formData.id)) {
        alert('رقم الحلقة هذا مسجل بالفعل لترميز حلقة أخرى.');
        return;
      }
      // Add Mode
      saveHalaqat([...halaqat, submissionData]);
    }
    setIsModalOpen(false);
  };

  // Retrieve current Surah and Ayah from latest progress report
  const getCircleLatestProgress = (circleId: string, initialSurah: string, initialAyah: string) => {
    const circleLogs = progressLogs
      .filter(log => log.circleId === circleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (circleLogs.length > 0) {
      return {
        surah: circleLogs[0].surah,
        ayah: String(circleLogs[0].endAyah),
        imported: true
      };
    }

    return {
      surah: initialSurah,
      ayah: initialAyah,
      imported: false
    };
  };

  // Get Meeting Link
  const getMeetingLink = (halaqa: Halaqa) => {
    if (halaqa.linkType === 'INTERNAL') {
      return `https://meet.jit.si/tahfez-circle-${halaqa.id}`;
    }
    return halaqa.externalLink || '#';
  };

  // Filter circles
  const filteredHalaqat = halaqat.filter(h => {
    const matchesSearch = h.name.includes(searchQuery) || h.id.includes(searchQuery);
    const matchesTeacher = filterTeacher === 'الكل' || h.teacherId === filterTeacher;
    const matchesDay = filterDay === 'الكل' || (h.days && h.days.includes(filterDay));
    const matchesRunningNow = !filterRunningNow || isCircleRunningNow(h);
    
    return matchesSearch && matchesTeacher && matchesDay && matchesRunningNow;
  });

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors font-sans pb-12">

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex justify-between items-center flex-wrap gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">الحلقات</h2>
          <p className="text-sm text-gray-500 max-w-xl">إنشاء وإدارة الحلقات وتصفيتها حسب الشيخ المحفظ، وأيام الأسبوع، والحلقات الجارية الآن.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <span>➕</span> إضافة حلقة جديدة
        </button>
      </section>

      {/* Advanced Filters bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid md:grid-cols-4 gap-4">
        {/* Search */}
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم الحلقة أو اسمها..." 
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary shadow-sm"
        />

        {/* Teacher Filter */}
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary shadow-sm font-semibold"
        >
          <option value="الكل">كل المحفظين</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Day Filter */}
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary shadow-sm font-semibold"
        >
          <option value="الكل">كل الأيام</option>
          {WEEKDAYS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Running Now Filter Toggler */}
        <button
          onClick={() => setFilterRunningNow(!filterRunningNow)}
          className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
            filterRunningNow 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' 
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200'
          }`}
        >
          <span className={filterRunningNow ? 'animate-pulse' : ''}>🔴</span>
          <span>الحلقات الجارية الآن</span>
        </button>
      </section>

      {/* Card Listing Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHalaqat.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 font-bold bg-white dark:bg-gray-900 rounded-3xl shadow-md border border-gray-100 dark:border-gray-800">
            لا توجد حلقات قرآنية تطابق خيارات التصفية الحالية.
          </div>
        ) : (
          filteredHalaqat.map(halaqa => {
            const teacherObj = teachers.find(t => t.id === halaqa.teacherId);
            const progress = getCircleLatestProgress(halaqa.id, halaqa.initialSurah, halaqa.initialAyah);
            const meetingUrl = getMeetingLink(halaqa);
            const isLive = isCircleRunningNow(halaqa);

            return (
              <div key={halaqa.id} className={`p-6 rounded-3xl bg-white dark:bg-gray-900 border shadow-xl flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.01] ${
                isLive ? 'border-red-300 dark:border-red-950 ring-2 ring-red-500/20' : 'border-gray-100 dark:border-gray-800'
              }`}>
                {isLive && (
                  <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-br-2xl uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span>🔴</span> بث مباشر الآن
                  </div>
                )}
                
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gold/10 to-transparent rounded-bl-full"></div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 text-primary dark:text-emerald-400 px-3 py-1 rounded-full">
                      رقم الحلقة: #{halaqa.id}
                    </span>
                    
                    {/* Action controls */}
                    <div className="flex gap-2 z-10">
                      <button
                        onClick={() => handleOpenEditModal(halaqa)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:scale-110 transition-all"
                        title="تعديل الحلقة"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteHalaqa(halaqa.id)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 hover:scale-110 transition-all"
                        title="حذف الحلقة"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">{halaqa.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {halaqa.days && halaqa.days.map((day, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>👳‍♂️</span>
                      <span>المحفظ: {teacherObj?.name || 'غير معين'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <span>⏱️</span>
                      <span>موعد الحلقة: {halaqa.startTime || '—'} - {halaqa.endTime || '—'}</span>
                    </div>
                    
                    {/* Progress details */}
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${progress.imported ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        📖 سورة {progress.surah}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-cream dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold">
                        📍 الآية {progress.ayah}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-2.5 rounded-xl text-xs font-bold text-center block transition-all shadow-md ${
                      halaqa.linkType === 'INTERNAL' 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {halaqa.linkType === 'INTERNAL' ? '💻 دخول الحلقة مدمج (Jitsi Meet)' : '🔗 دخول الحلقة خارجي (Teams)'}
                  </a>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* CRUD Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              {editingHalaqa ? 'تعديل بيانات الحلقة' : 'إضافة حلقة جديدة'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">رقم الحلقة *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingHalaqa}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="101"
                    className="w-full px-3 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">اسم الحلقة *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: حلقة الإتقان لعمّ"
                    className="w-full px-3 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">المحفظ المسؤول *</label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">-- اختر الشيخ المحفظ --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Days of the week Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">أيام الحلقة أسبوعياً *</label>
                <div className="flex flex-wrap gap-2.5">
                  {WEEKDAYS.map(day => {
                    const isChecked = formData.days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayCheckboxChange(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isChecked
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule layout fix: full row container with beautiful alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">تاريخ بداية الحلقة *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="block text-xs font-bold text-gray-500">توقيت الحلقة (من - إلى) *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Start Time */}
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-bold">البدء (من)</span>
                      <div className="flex gap-1 justify-center items-center">
                        <select
                          value={formData.startTimeMinute}
                          onChange={(e) => setFormData({ ...formData, startTimeMinute: e.target.value })}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 text-center focus:outline-none focus:border-primary font-semibold"
                        >
                          {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <span className="text-gray-400 text-xs font-bold">:</span>
                        <select
                          value={formData.startTimeHour}
                          onChange={(e) => setFormData({ ...formData, startTimeHour: e.target.value })}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 text-center focus:outline-none focus:border-primary font-semibold"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <select
                          value={formData.startTimePeriod}
                          onChange={(e) => setFormData({ ...formData, startTimePeriod: e.target.value })}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 text-center focus:outline-none focus:border-primary text-primary dark:text-emerald-400 font-bold"
                        >
                          <option value="ص">ص</option>
                          <option value="م">م</option>
                        </select>
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-bold">الانتهاء (إلى)</span>
                      <div className="flex gap-1 justify-center items-center">
                        <select
                          value={formData.endTimeMinute}
                          onChange={(e) => setFormData({ ...formData, endTimeMinute: e.target.value })}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 text-center focus:outline-none focus:border-primary font-semibold"
                        >
                          {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <span className="text-gray-400 text-xs font-bold">:</span>
                        <select
                          value={formData.endTimeHour}
                          onChange={(e) => setFormData({ ...formData, endTimeHour: e.target.value })}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 text-center focus:outline-none focus:border-primary font-semibold"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <select
                          value={formData.endTimePeriod}
                          onChange={(e) => setFormData({ ...formData, endTimePeriod: e.target.value })}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs py-1.5 text-center focus:outline-none focus:border-primary text-primary dark:text-emerald-400 font-bold"
                        >
                          <option value="ص">ص</option>
                          <option value="م">م</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Type toggler */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <label className="block text-xs font-bold text-gray-500 mb-2">رابط ومكان بث الحلقة *</label>
                <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, linkType: 'INTERNAL' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      formData.linkType === 'INTERNAL' 
                        ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' 
                        : 'text-gray-500'
                    }`}
                  >
                    بث داخلي مدمج (Jitsi Meet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, linkType: 'EXTERNAL' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      formData.linkType === 'EXTERNAL' 
                        ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' 
                        : 'text-gray-500'
                    }`}
                  >
                    رابط خارجي (Teams / Zoom)
                  </button>
                </div>

                {formData.linkType === 'EXTERNAL' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">أدخل رابط البث الخارجي (Teams / Zoom / Meet) *</label>
                    <input
                      type="url"
                      required
                      value={formData.externalLink}
                      onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                      placeholder="https://teams.microsoft.com/l/meetup-join/..."
                      className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                {formData.linkType === 'INTERNAL' && (
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    💡 سيقوم النظام تلقائياً بتوليد رابط آمن ومباشر عبر منصة Jitsi Meet التفاعلية المدمجة استناداً إلى رقم الحلقة.
                  </p>
                )}
              </div>

              {/* Initial Surah and Ayah configurations */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">السورة الافتتاحية</label>
                  <input
                    type="text"
                    value={formData.initialSurah}
                    onChange={(e) => setFormData({ ...formData, initialSurah: e.target.value })}
                    className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">الآية الافتتاحية</label>
                  <input
                    type="text"
                    value={formData.initialAyah}
                    onChange={(e) => setFormData({ ...formData, initialAyah: e.target.value })}
                    className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
              >
                {editingHalaqa ? 'حفظ التعديلات' : 'إطلاق وتثبيت الحلقة'}
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
