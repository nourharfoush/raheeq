'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';

interface Teacher {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  address: string;
  email?: string;
  experience?: string;
  circlesCount?: number;
  rating?: number;
}

export default function TeachersPage() {
  const { theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');
  
  // CRUD States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    phone: '',
    address: '',
    email: ''
  });

  // Load teachers from localStorage or use default seeds
  useEffect(() => {
    const saved = localStorage.getItem('tahfez_teachers_crud');
    if (saved) {
      setTeachers(JSON.parse(saved));
    } else {
      const defaultSeeds: Teacher[] = [
        { id: 't-1', name: 'الشيخ عبد الرحمن محمد', nationalId: '29201010101234', phone: '01012345678', address: 'القاهرة، مصر القديمة', email: 'abdurrahman@tahfez.com', experience: '12 سنة', circlesCount: 3, rating: 4.9 },
        { id: 't-2', name: 'الشيخ محمود عبد العزيز', nationalId: '28503030105678', phone: '01234567890', address: 'طنطا، الغربية', email: 'mahmooud@tahfez.com', experience: '15 سنة', circlesCount: 4, rating: 5.0 },
        { id: 't-3', name: 'الشيخ أحمد عبد الوهاب', nationalId: '29508080209876', phone: '01122334455', address: 'الإسكندرية، سموحة', email: 'ahmad@tahfez.com', experience: '8 سنوات', circlesCount: 2, rating: 4.8 }
      ];
      setTeachers(defaultSeeds);
      localStorage.setItem('tahfez_teachers_crud', JSON.stringify(defaultSeeds));
    }
  }, []);

  // Save to localStorage
  const saveTeachers = (updated: Teacher[]) => {
    setTeachers(updated);
    localStorage.setItem('tahfez_teachers_crud', JSON.stringify(updated));
  };

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({ name: '', nationalId: '', phone: '', address: '', email: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      nationalId: teacher.nationalId,
      phone: teacher.phone,
      address: teacher.address,
      email: teacher.email || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المحفظ نهائياً؟')) {
      const updated = teachers.filter(t => t.id !== id);
      saveTeachers(updated);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nationalId || !formData.phone || !formData.address) {
      alert('الرجاء ملء جميع الحقول المطلوبة.');
      return;
    }

    if (editingTeacher) {
      const updated = teachers.map(t => 
        t.id === editingTeacher.id 
          ? { ...t, ...formData } 
          : t
      );
      saveTeachers(updated);
    } else {
      const newTeacher: Teacher = {
        id: 't-' + Date.now(),
        ...formData,
        experience: 'مستجد',
        circlesCount: 0,
        rating: 5.0
      };
      saveTeachers([newTeacher, ...teachers]);
    }
    setIsModalOpen(false);
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.includes(searchQuery) || t.phone.includes(searchQuery);
    const matchesCity = selectedCity === 'الكل' || t.address.includes(selectedCity);
    return matchesSearch && matchesCity;
  });

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors font-sans pb-12">
        {/* Hero section */}
        <section className="flex justify-between items-center flex-wrap gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">المحفظين</h2>
            <p className="text-sm text-gray-500 max-w-xl">قائمة وإدارة شيوخ الحلقات التابعين للمدرسة المصرية للتلاوة والأزهر الشريف.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <span>➕</span> إضافة محفظ جديد
          </button>
        </section>

        {/* Filters bar */}
        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو التليفون..." 
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary shadow-sm"
          />

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary shadow-sm"
          >
            <option value="الكل">كل المحافظات</option>
            <option value="القاهرة">القاهرة</option>
            <option value="الإسكندرية">الإسكندرية</option>
            <option value="طنطا">طنطا</option>
          </select>
          
          <div className="flex items-center justify-end text-xs text-gray-500 font-bold">
            مجموع المحفظين المسجلين: {filteredTeachers.length} محفظ
          </div>
        </section>

        {/* Table listing */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold">
                  <th className="pb-4">الاسم بالكامل</th>
                  <th className="pb-4">الرقم القومي</th>
                  <th className="pb-4">تليفون المحفظ</th>
                  <th className="pb-4">العنوان بالتفصيل</th>
                  <th className="pb-4">البريد الإلكتروني</th>
                  <th className="pb-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 font-bold">
                      لا يوجد محفظين يطابقون خيارات البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 font-bold flex items-center gap-2">
                        <span className="text-xl">👳‍♂️</span>
                        <span>{teacher.name}</span>
                      </td>
                      <td className="py-4 font-mono">{teacher.nationalId}</td>
                      <td className="py-4 font-mono">{teacher.phone}</td>
                      <td className="py-4">{teacher.address}</td>
                      <td className="py-4 text-gray-500">{teacher.email || '—'}</td>
                      <td className="py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleOpenEditModal(teacher)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:scale-105 transition-all text-xs font-bold"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:scale-105 transition-all text-xs font-bold"
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

        {/* CRUD Edit/Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>

              <h3 className="text-xl font-extrabold text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                {editingTeacher ? 'تعديل بيانات المحفظ' : 'إضافة محفظ جديد'}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: الشيخ أحمد الباقوري"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
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
                    placeholder="مثال: 29512345678901"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">تليفون المحفظ *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="مثال: 01023456789"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">العنوان بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="مثال: القاهرة، مدينة نصر، ش الطيران"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@tahfez.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/20 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-6 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {editingTeacher ? 'حفظ التغييرات المحدثة' : 'تسجيل المحفظ بالمنصة'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
