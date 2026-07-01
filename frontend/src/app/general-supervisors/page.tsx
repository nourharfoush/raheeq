'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';

interface GeneralSupervisor {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  address: string;
  email?: string;
  grade?: string;
}

export default function GeneralSupervisorsPage() {
  const { currentUser } = useApp();
  const role = currentUser?.role || 'ADMIN';

  // CRUD States (Admin only)
  const [generalSupervisors, setGeneralSupervisors] = useState<GeneralSupervisor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenSup, setEditingGenSup] = useState<GeneralSupervisor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    address: '',
    email: ''
  });

  // Portal States (General Supervisor only)
  const [activeTab, setActiveTab] = useState<'kpis' | 'audits'>('kpis');

  // Load general supervisors
  useEffect(() => {
    const saved = localStorage.getItem('tahfez_general_supervisors_crud');
    if (saved) {
      setGeneralSupervisors(JSON.parse(saved));
    } else {
      const defaultSeeds: GeneralSupervisor[] = [
        { id: 'gensup-1', name: 'د. خالد عبد الرحمن', nationalId: '27805050109876', phone: '01223344556', address: 'الجيزة، الدقي', email: 'general_supervisor@tahfez.com', grade: 'ممتاز' }
      ];
      setGeneralSupervisors(defaultSeeds);
      localStorage.setItem('tahfez_general_supervisors_crud', JSON.stringify(defaultSeeds));
    }
  }, []);

  const saveGeneralSupervisors = (updated: GeneralSupervisor[]) => {
    setGeneralSupervisors(updated);
    localStorage.setItem('tahfez_general_supervisors_crud', JSON.stringify(updated));
  };

  const handleOpenAddModal = () => {
    setEditingGenSup(null);
    setFormData({ name: '', nationalId: '', phone: '', address: '', email: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup: GeneralSupervisor) => {
    setEditingGenSup(sup);
    setFormData({
      name: sup.name,
      nationalId: sup.nationalId,
      phone: sup.phone,
      address: sup.address,
      email: sup.email || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف مشرف العموم هذا نهائياً؟')) {
      const updated = generalSupervisors.filter(s => s.id !== id);
      saveGeneralSupervisors(updated);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nationalId || !formData.phone || !formData.address) {
      alert('الرجاء ملء الحقول الإلزامية.');
      return;
    }

    if (editingGenSup) {
      const updated = generalSupervisors.map(s => 
        s.id === editingGenSup.id 
          ? { ...s, ...formData } 
          : s
      );
      saveGeneralSupervisors(updated);
    } else {
      const newSup: GeneralSupervisor = {
        id: 'gensup-' + Date.now(),
        ...formData,
        grade: 'مستجد'
      };
      saveGeneralSupervisors([newSup, ...generalSupervisors]);
    }
    setIsModalOpen(false);
  };

  const filteredGenSupervisors = generalSupervisors.filter(s => 
    s.name.includes(searchQuery) || s.phone.includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors font-sans pb-12 animate-in fade-in duration-200">
        
        {role === 'ADMIN' ? (
          /* ADMIN VIEW: CRUD MANAGEMENT */
          <div className="space-y-6">
            {/* Header */}
            <section className="flex justify-between items-center flex-wrap gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">إدارة مشرفي العموم</h2>
                <p className="text-sm text-gray-500 max-w-xl">بيانات الكوادر الإشرافية العليا والتقييم الإداري العام للمنصة.</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span>➕</span> إضافة مشرف عموم
              </button>
            </section>

            {/* Filter */}
            <section className="grid sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو رقم التليفون..." 
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary shadow-sm"
              />
              <div className="flex items-center justify-end text-xs text-gray-500 font-bold">
                عدد مشرفي العموم المسجلين: {filteredGenSupervisors.length} مشرف
              </div>
            </section>

            {/* Table */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold text-xs">
                      <th className="pb-4">اسم مشرف العموم بالكامل</th>
                      <th className="pb-4">الرقم القومي</th>
                      <th className="pb-4">رقم التليفون</th>
                      <th className="pb-4">العنوان بالتفصيل</th>
                      <th className="pb-4">البريد الإلكتروني</th>
                      <th className="pb-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredGenSupervisors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 font-bold">
                          لا يوجد مشرفي عموم مسجلين يطابقون خيارات البحث.
                        </td>
                      </tr>
                    ) : (
                      filteredGenSupervisors.map(sup => (
                        <tr key={sup.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors text-xs">
                          <td className="py-4 font-bold flex items-center gap-2">
                            <span className="text-xl">📈</span>
                            <span>{sup.name}</span>
                          </td>
                          <td className="py-4 font-mono">{sup.nationalId}</td>
                          <td className="py-4 font-mono">{sup.phone}</td>
                          <td className="py-4">{sup.address}</td>
                          <td className="py-4 text-gray-500">{sup.email || '— (لم يحدد)'}</td>
                          <td className="py-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleOpenEditModal(sup)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:scale-105 transition-all text-[10px] font-bold"
                              >
                                ✏️ تعديل
                              </button>
                              <button
                                onClick={() => handleDelete(sup.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:scale-105 transition-all text-[10px] font-bold"
                              >
                                🗑️ حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Admin Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-650 text-lg"
                  >
                    ✕
                  </button>

                  <h3 className="text-xl font-extrabold text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                    {editingGenSup ? 'تعديل بيانات مشرف العموم' : 'إضافة مشرف عموم جديد'}
                  </h3>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">الاسم بالكامل *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مثال: د. خالد عبد الرحمن"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">الرقم القومي (14 رقم) *</label>
                      <input
                        type="text"
                        required
                        maxLength={14}
                        pattern="\d{14}"
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        placeholder="مثال: 27812345678901"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">رقم التليفون *</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="مثال: 01223344556"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">العنوان بالتفصيل *</label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="مثال: الجيزة، الدقي"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">البريد الإلكتروني (اختياري)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="general_supervisor@tahfez.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 mt-6 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      {editingGenSup ? 'حفظ التحديثات' : 'تسجيل المشرف بالمنصة'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GENERAL SUPERVISOR VIEW: ORIGINAL PORTAL */
          <div>
            {/* Hero Section */}
            <section className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">بوابة مشرفي العموم</h2>
              <p className="text-sm text-gray-500 max-w-xl mt-1">الرقابة العامة وتقارير مؤشرات الأداء الكبرى للمقرأة القرآنية.</p>
            </section>

            {/* KPI Stats widgets */}
            <section className="grid sm:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 font-bold">الطلاب الجدد هذا الشهر</p>
                <h3 className="text-2xl font-extrabold text-primary dark:text-emerald-400 mt-1">+24 طالب</h3>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 font-bold">مجموع التسميعات الأسبوعية</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">112 تسميعاً</h3>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 font-bold">معدل التقييمات الإيجابية</p>
                <h3 className="text-2xl font-extrabold text-purple-600 mt-1">98.2% ممتاز</h3>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 font-bold">نسبة كفاءة الفصول التفاعلية</p>
                <h3 className="text-2xl font-extrabold text-amber-500 mt-1">99.7% مستقرة</h3>
              </div>
            </section>

            {/* Tab selection */}
            <section className="space-y-8">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab('kpis')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'kpis' ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'}`}
                >
                  مؤشرات الأداء الاستراتيجية
                </button>
                <button
                  onClick={() => setActiveTab('audits')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'audits' ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'}`}
                >
                  مراجعة ورقابة الجودة
                </button>
              </div>

              {/* Tab 1: KPI overview with native SVG charts */}
              {activeTab === 'kpis' && (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl space-y-6">
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">إنجاز الدارسين الشهري مقارنة بالمستهدف (أجزاء)</h3>
                    
                    {/* SVG Area/Bar chart */}
                    <div className="w-full h-56 relative flex items-end justify-between px-4 pt-8 border-b border-gray-200 dark:border-gray-800">
                      <div className="absolute top-2 right-0 text-[10px] text-gray-400">150 جزء</div>
                      <div className="absolute top-24 right-0 text-[10px] text-gray-400">75 جزء</div>
                      <div className="absolute bottom-2 right-0 text-[10px] text-gray-400">0 جزء</div>

                      <div className="flex flex-col items-center gap-2 w-14">
                        <div className="w-8 bg-gradient-to-t from-primary/60 to-primary rounded-t-md cursor-pointer" style={{ height: '70px' }}></div>
                        <span className="text-[10px] text-gray-500 font-bold">مارس</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-14">
                        <div className="w-8 bg-gradient-to-t from-primary/60 to-primary rounded-t-md cursor-pointer" style={{ height: '110px' }}></div>
                        <span className="text-[10px] text-gray-500 font-bold">أبريل</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-14">
                        <div className="w-8 bg-gradient-to-t from-primary/60 to-primary rounded-t-md cursor-pointer" style={{ height: '140px' }}></div>
                        <span className="text-[10px] text-gray-500 font-bold">مايو</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-14">
                        <div className="w-8 bg-gradient-to-t from-primary/60 to-primary rounded-t-md cursor-pointer" style={{ height: '190px' }}></div>
                        <span className="text-[10px] text-gray-500 font-bold">يونيو</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl space-y-6">
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">توزيع قراءات الطلاب</h3>
                    <div className="space-y-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>رواية حفص عن عاصم</span>
                          <span>70%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '70%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>رواية ورش عن نافع</span>
                          <span>20%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: '20%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>روايات وقراءات أخرى</span>
                          <span>10%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Quality controls */}
              {activeTab === 'audits' && (
                <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">طلبات تدقيق ومراجعة علامات التقييم الكبرى</h3>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="py-4 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">مراجعة درجة اختبار الدارس يوسف الحارثي</h4>
                        <p className="text-gray-500 mt-1">الدرجة الحالية: 96% ممتاز • المعلم: الشيخ عبد الرحمن محمد</p>
                      </div>
                      <button className="px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md">اعتماد النتيجة</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
