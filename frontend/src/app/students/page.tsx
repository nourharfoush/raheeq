'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/DashboardLayout';

interface Student {
  id: string;
  name: string;
  nationalIdOrPassport: string;
  phone: string;
  email?: string;
  country: string;
  governorate: string;
  address: string;
  level?: string;
  attendance?: string;
  dateJoined?: string;
}

export default function StudentsPage() {
  const { theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // CRUD States
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    nationalIdOrPassport: '',
    phone: '',
    email: '',
    country: 'مصر',
    governorate: '',
    address: ''
  });

  // Load students from localStorage or use default seeds
  useEffect(() => {
    const saved = localStorage.getItem('tahfez_students_crud');
    if (saved) {
      setStudents(JSON.parse(saved));
    } else {
      const defaultSeeds: Student[] = [
        { id: 's-1', name: 'يوسف أحمد الحارثي', nationalIdOrPassport: '31510100101234', phone: '01098765432', email: 'youssef@gmail.com', country: 'مصر', governorate: 'القاهرة', address: 'مصر الجديدة، ش النزهة', level: 'سورة البقرة', attendance: '98%', dateJoined: '2026-01-10' },
        { id: 's-2', name: 'مريم محمود الشافعي', nationalIdOrPassport: '31705050205678', phone: '01223456789', email: 'maryam@gmail.com', country: 'مصر', governorate: 'الإسكندرية', address: 'سموحة، ش الفوزي', level: 'جزء عم', attendance: '95%', dateJoined: '2026-03-15' },
        { id: 's-3', name: 'عمر عبد الله السنباطي', nationalIdOrPassport: '31308080109876', phone: '01155443322', email: 'omar@gmail.com', country: 'مصر', governorate: 'الغربية', address: 'طنطا، ش البحر', level: 'سورة آل عمران', attendance: '92%', dateJoined: '2026-02-01' }
      ];
      setStudents(defaultSeeds);
      localStorage.setItem('tahfez_students_crud', JSON.stringify(defaultSeeds));
    }
  }, []);

  // Save to localStorage
  const saveStudents = (updated: Student[]) => {
    setStudents(updated);
    localStorage.setItem('tahfez_students_crud', JSON.stringify(updated));
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nationalIdOrPassport: '',
      phone: '',
      email: '',
      country: 'مصر',
      governorate: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nationalIdOrPassport: student.nationalIdOrPassport,
      phone: student.phone,
      email: student.email || '',
      country: student.country,
      governorate: student.governorate,
      address: student.address
    });
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الدارس نهائياً؟')) {
      const updated = students.filter(s => s.id !== id);
      saveStudents(updated);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nationalIdOrPassport || !formData.phone || !formData.country || !formData.governorate || !formData.address) {
      alert('الرجاء ملء جميع الحقول المطلوبة.');
      return;
    }

    if (editingStudent) {
      const updated = students.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...formData } 
          : s
      );
      saveStudents(updated);
    } else {
      const newStudent: Student = {
        id: 's-' + Date.now(),
        ...formData,
        level: 'مبتدئ',
        attendance: '100%',
        dateJoined: new Date().toISOString().split('T')[0]
      };
      saveStudents([newStudent, ...students]);
    }
    setIsModalOpen(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || 
    s.phone.includes(searchQuery) || 
    s.governorate.includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors font-sans pb-12">
        {/* Hero section */}
        <section className="flex justify-between items-center flex-wrap gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">الدارسين</h2>
            <p className="text-sm text-gray-500 max-w-xl">إضافة وتعديل وحذف بيانات الطلاب الدارسين في حلقات التلاوة والحفظ بالمنصة.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <span>➕</span> إضافة دارس جديد
          </button>
        </section>

        {/* Filters bar */}
        <section className="grid md:grid-cols-2 gap-4 mb-8">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو التليفون أو المحافظة..." 
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary shadow-sm"
          />
          
          <div className="flex items-center justify-end text-xs text-gray-500 font-bold">
            مجموع الطلاب المقيدين: {filteredStudents.length} دارس
          </div>
        </section>

        {/* Table grid */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold">
                  <th className="pb-4">اسم الدارس</th>
                  <th className="pb-4">الرقم القومي / جواز السفر</th>
                  <th className="pb-4">تليفون التواصل</th>
                  <th className="pb-4">الدولة</th>
                  <th className="pb-4">المحافظة</th>
                  <th className="pb-4">العنوان بالتفصيل</th>
                  <th className="pb-4">البريد الإلكتروني</th>
                  <th className="pb-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 font-bold">
                      لا يوجد دارسين يطابقون خيارات البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 font-bold flex items-center gap-2">
                        <span className="text-xl">👦</span>
                        <span>{student.name}</span>
                      </td>
                      <td className="py-4 font-mono">{student.nationalIdOrPassport}</td>
                      <td className="py-4 font-mono">{student.phone}</td>
                      <td className="py-4">{student.country}</td>
                      <td className="py-4 font-semibold text-primary dark:text-emerald-400">{student.governorate}</td>
                      <td className="py-4 text-xs">{student.address}</td>
                      <td className="py-4 text-xs text-gray-500">{student.email || '—'}</td>
                      <td className="py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:scale-105 transition-all text-xs font-bold"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:scale-105 transition-all text-xs font-bold"
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
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>

              <h3 className="text-xl font-extrabold text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                {editingStudent ? 'تعديل بيانات الدارس' : 'إضافة دارس جديد'}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: يوسف أحمد الشافعي"
                    className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الرقم القومي / الجواز *</label>
                    <input
                      type="text"
                      required
                      value={formData.nationalIdOrPassport}
                      onChange={(e) => setFormData({ ...formData, nationalIdOrPassport: e.target.value })}
                      placeholder="رقم القومي أو الجواز"
                      className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">رقم التليفون *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="مثال: 01012345678"
                      className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الدولة *</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="مثال: مصر"
                      className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">المحافظة *</label>
                    <input
                      type="text"
                      required
                      value={formData.governorate}
                      onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                      placeholder="مثال: القاهرة"
                      className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">العنوان بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="الشارع، الحي، المبنى"
                    className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-4 py-2 bg-cream/20 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'تسجيل الدارس الجديد'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
