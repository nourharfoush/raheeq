'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';

interface Supervisor {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  address: string;
  email?: string;
  circlesCount?: number;
}

export default function CircleSupervisorsPage() {
  const { currentUser } = useApp();
  const role = currentUser?.role || 'ADMIN';

  // CRUD States (Admin only)
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    address: '',
    email: ''
  });

  // Supervisor portal states (Supervisor only)
  const [activeTab, setActiveTab] = useState<'circles' | 'requests'>('circles');
  const [requests, setRequests] = useState([
    { id: 'req-1', studentName: 'أنس محمود الديب', parentEmail: 'mahmoud@gmail.com', targetHalaqa: 'حلقة التلاوة المصرية', date: '2026-06-29' },
    { id: 'req-2', studentName: 'فاطمة أحمد فؤاد', parentEmail: 'ahmed@gmail.com', targetHalaqa: 'حلقة الهمم العالية', date: '2026-06-30' }
  ]);

  // Load supervisors
  useEffect(() => {
    const saved = localStorage.getItem('tahfez_supervisors_crud');
    if (saved) {
      setSupervisors(JSON.parse(saved));
    } else {
      const defaultSeeds: Supervisor[] = [
        { id: 'sup-1', name: 'المهندس أحمد الشافعي', nationalId: '29004040101234', phone: '01011223344', address: 'القاهرة، مصر الجديدة', email: 'supervisor@tahfez.com', circlesCount: 3 }
      ];
      setSupervisors(defaultSeeds);
      localStorage.setItem('tahfez_supervisors_crud', JSON.stringify(defaultSeeds));
    }
  }, []);

  const saveSupervisors = (updated: Supervisor[]) => {
    setSupervisors(updated);
    localStorage.setItem('tahfez_supervisors_crud', JSON.stringify(updated));
  };

  const handleOpenAddModal = () => {
    setEditingSupervisor(null);
    setFormData({ name: '', nationalId: '', phone: '', address: '', email: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup: Supervisor) => {
    setEditingSupervisor(sup);
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
    if (confirm('هل أنت متأكد من حذف هذا المشرف نهائياً؟')) {
      const updated = supervisors.filter(s => s.id !== id);
      saveSupervisors(updated);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nationalId || !formData.phone || !formData.address) {
      alert('الرجاء ملء الحقول الإلزامية.');
      return;
    }

    if (editingSupervisor) {
      const updated = supervisors.map(s => 
        s.id === editingSupervisor.id 
          ? { ...s, ...formData } 
          : s
      );
      saveSupervisors(updated);
    } else {
      const newSup: Supervisor = {
        id: 'sup-' + Date.now(),
        ...formData,
        circlesCount: 0
      };
      saveSupervisors([newSup, ...supervisors]);
    }
    setIsModalOpen(false);
  };

  const handleApproveRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const filteredSupervisors = supervisors.filter(s => 
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
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">إدارة مشرفي الحلقات</h2>
                <p className="text-sm text-gray-500 max-w-xl">بيانات مشرفي الكوادر والرقابة التربوية على المقارئ والحلقات.</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span>➕</span> إضافة مشرف حلقات
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
                عدد المشرفين المسجلين: {filteredSupervisors.length} مشرف
              </div>
            </section>

            {/* Table */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold text-xs">
                      <th className="pb-4">اسم المشرف بالكامل</th>
                      <th className="pb-4">الرقم القومي</th>
                      <th className="pb-4">رقم التليفون</th>
                      <th className="pb-4">العنوان بالتفصيل</th>
                      <th className="pb-4">البريد الإلكتروني</th>
                      <th className="pb-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredSupervisors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 font-bold">
                          لا يوجد مشرفين مسجلين يطابقون خيارات البحث.
                        </td>
                      </tr>
                    ) : (
                      filteredSupervisors.map(sup => (
                        <tr key={sup.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors text-xs">
                          <td className="py-4 font-bold flex items-center gap-2">
                            <span className="text-xl">👥</span>
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
                    {editingSupervisor ? 'تعديل بيانات مشرف الحلقات' : 'إضافة مشرف حلقات جديد'}
                  </h3>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">الاسم بالكامل *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مثال: المهندس أحمد الشافعي"
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
                        placeholder="مثال: 29012345678901"
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
                        placeholder="مثال: 01011223344"
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
                        placeholder="مثال: القاهرة، مصر الجديدة"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">البريد الإلكتروني (اختياري)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="supervisor@tahfez.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 mt-6 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      {editingSupervisor ? 'حفظ التحديثات' : 'تسجيل المشرف بالمنصة'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* SUPERVISOR VIEW: ORIGINAL PORTAL */
          <div>
            {/* Hero section */}
            <section className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">بوابة مشرفي الحلقات</h2>
              <p className="text-sm text-gray-500 max-w-xl mt-1">الرقابة التربوية ومتابعة الشيوخ والطلاب وتسكين الحلقات.</p>
            </section>

            {/* Stats row */}
            <section className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 font-bold">الحلقات تحت الإشراف</p>
                <h3 className="text-2xl font-extrabold text-primary dark:text-emerald-400 mt-1">6 حلقات</h3>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 font-bold">إجمالي حضور هذا الأسبوع</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">94.8%</h3>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-500 font-bold">طلبات الالتحاق المعلقة</p>
                <h3 className="text-2xl font-extrabold text-gold mt-1">{requests.length} طلبات</h3>
              </div>
            </section>

            {/* Tabs selector */}
            <section>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit mb-8">
                <button
                  onClick={() => setActiveTab('circles')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'circles' ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'}`}
                >
                  تقرير متابعة الحلقات
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-500'}`}
                >
                  موافقة طلبات الالتحاق
                </button>
              </div>

              {/* Tab 1: Circles oversight */}
              {activeTab === 'circles' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">متابعة أداء الشيوخ والحضور والغياب</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold">
                            <th className="pb-3">الحلقة</th>
                            <th className="pb-3">الشيخ المحفظ</th>
                            <th className="pb-3">الطلاب المقيدين</th>
                            <th className="pb-3">الحضور الفعلي</th>
                            <th className="pb-3">الورد المحفوظ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          <tr className="text-gray-700 dark:text-gray-300">
                            <td className="py-4 font-bold">حلقة التلاوة المصرية</td>
                            <td className="py-4">الشيخ عبد الرحمن محمد</td>
                            <td className="py-4">12 دارس</td>
                            <td className="py-4 text-emerald-600 font-bold">%96</td>
                            <td className="py-4">سورة البقرة (1-40)</td>
                          </tr>
                          <tr className="text-gray-700 dark:text-gray-300">
                            <td className="py-4 font-bold">حلقة الهمم العالية</td>
                            <td className="py-4">الشيخ محمود عبد العزيز</td>
                            <td className="py-4">10 دارسين</td>
                            <td className="py-4 text-emerald-600 font-bold">%92</td>
                            <td className="py-4">سورة آل عمران (كاملة)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Enrollment Requests approvals */}
              {activeTab === 'requests' && (
                <div className="grid md:grid-cols-2 gap-8">
                  {requests.length === 0 ? (
                    <p className="text-sm text-gray-500 py-8 text-center md:col-span-2">لا توجد طلبات التحاق معلقة حالياً.</p>
                  ) : (
                    requests.map(req => (
                      <div key={req.id} className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-gray-950 dark:text-white">{req.studentName}</h4>
                            <p className="text-xs text-gray-500 mt-1">ولي الأمر: {req.parentEmail}</p>
                          </div>
                          <span className="text-xs text-gray-400 font-bold">{req.date}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-cream dark:bg-gray-800/40 text-xs">
                          الحلقة المستهدفة: <strong className="text-primary dark:text-emerald-400">{req.targetHalaqa}</strong>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            قبول الطلب وتسكين الطالب
                          </button>
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
