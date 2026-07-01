'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';
import DashboardLayout from '@/components/DashboardLayout';

export default function ParentDashboard() {
  const router = useRouter();
  const {
    currentUser, loading, logout, users, studentProfiles, progressLogs,
    evaluations, subscriptions, notifications, checkoutSubscription,
    markNotificationRead, updateProfile, theme, toggleTheme
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'billing' | 'settings'>('overview');

  // Checkout states
  const [selectedPlan, setSelectedPlan] = useState<'once_weekly' | 'twice_weekly'>('once_weekly');
  const [paymentName, setPaymentName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  // Settings states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.push('/auth');
    } else if (currentUser.role !== 'PARENT') {
      router.push(`/dashboard/${currentUser.role.toLowerCase()}`);
    } else {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
    }
  }, [currentUser, loading]);

  if (loading || !currentUser) return null;

  // Filter children profiles linked to this parent
  const parentProfileId = 'p-profile'; // Seeded mock parent profile ID
  const myChildren = studentProfiles.filter(sp => sp.parentId === parentProfileId);
  const myChildrenUserIds = myChildren.map(c => c.userId);
  const myChildrenProfilesIds = myChildren.map(c => c.id);

  // Extract progress logs and evaluations of children
  const kidsLogs = progressLogs.filter(l => myChildrenProfilesIds.includes(l.studentId));
  const kidsEvaluations = evaluations.filter(e => myChildrenProfilesIds.includes(e.studentId));

  // Find child's user object
  const childUser = users.find(u => myChildrenUserIds.includes(u.id)) || { name: 'حنين انور حسن حرفوش' };

  // Calculate pricing
  const planPrices = { once_weekly: 250, twice_weekly: 400 };
  const currentPrice = planPrices[selectedPlan];

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentName || !cardNumber || !cardExpiry || !cardCvv) return;

    await checkoutSubscription(selectedPlan, currentPrice);
    setPaySuccess(true);
    setPaymentName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setTimeout(() => {
      setPaySuccess(false);
      setActiveSubTab('overview');
    }, 2000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(name, phone);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 lg:p-12 min-h-screen bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200">

        {/* Horizontal Tab Navigation */}
        <div className="flex gap-2 pb-4 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${activeSubTab === 'overview'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            👨‍👩‍👦‍👦 تتبع أبنائي وحفظهم
          </button>
          <button
            onClick={() => setActiveSubTab('billing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${activeSubTab === 'billing'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            💳 الاشتراكات والمدفوعات
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${activeSubTab === 'settings'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            ⚙️ إعدادات الحساب
          </button>
        </div>

        {/* Main Content Area Header */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-extrabold text-primary dark:text-white">
              {activeSubTab === 'overview' && 'تتبع ورصد تقدم الطلاب (الأبناء)'}
              {activeSubTab === 'billing' && 'إدارة باقات الاشتراك وفواتير الدفع'}
              {activeSubTab === 'settings' && 'تعديل الملف الشخصي لولي الأمر'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">ولي أمر • رحيق القرآن</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              {theme === 'dark' ? <Icons.Sun size={18} className="text-amber-500" /> : <Icons.Moon size={18} className="text-primary" />}
            </button>

            {/* Notification drop */}
            <div className="relative group">
              <button className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Icons.Bell size={18} className="text-gray-600 dark:text-gray-300" />
                {notifications.filter(n => n.userId === currentUser.id && !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-4 hidden group-hover:block z-50">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">تحديثات الأبناء</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.filter(n => n.userId === currentUser.id).length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">لا توجد إشعارات حالياً</p>
                  ) : (
                    notifications.filter(n => n.userId === currentUser.id).map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl text-xs space-y-1 cursor-pointer transition-colors ${notif.isRead ? 'bg-gray-50 dark:bg-gray-800/40 text-gray-500' : 'bg-emerald-50 dark:bg-emerald-950/20 text-gray-800 dark:text-emerald-200'}`}
                      >
                        <div className="flex justify-between font-bold">
                          <span>{notif.title}</span>
                          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                        </div>
                        <p>{notif.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Overview Tab Content */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Summary Widgets */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center text-2xl">👦</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">عدد الأبناء المسجلين</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{myChildren.length} طلاب نشطين</h3>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-gold flex items-center justify-center text-2xl">💳</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">الاشتراك الفعال</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {subscriptions.some(s => s.userId === currentUser.id && s.status === 'ACTIVE') ? 'نشط (باقة مدفوعة)' : 'منتهي الصلاحية'}
                  </h3>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl">📝</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">مجموع الاختبارات المجتازة</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {kidsEvaluations.filter(e => e.score >= 90).length} اختبار تفوّق
                  </h3>
                </div>
              </div>
            </div>

            {/* Child Progress Detail Section */}
            <div className="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-2xl">👦</div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-950 dark:text-white">{childUser.name}</h3>
                    <p className="text-xs text-gray-500">حفظ الجزء الأول من سورة البقرة</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-primary dark:text-emerald-400 text-xs font-bold">معدل الحفظ: 75%</span>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left side: recent activity logs */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">سجل تسميع حنين الأخير</h4>
                  <div className="space-y-3">
                    {kidsLogs.slice(0, 3).map(log => (
                      <div key={log.id} className="p-4 rounded-2xl bg-cream dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">حفظ سورة {log.surah}</p>
                          <p className="text-gray-500 mt-1">الآيات ({log.startAyah} - {log.endAyah}) • {log.pagesCount} صفحات</p>
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(log.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: grades history */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">نتائج الاختبارات والشهادات</h4>
                  <div className="space-y-3">
                    {kidsEvaluations.slice(0, 2).map(e => (
                      <div key={e.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{e.type === 'EXAM' ? 'اختبار موازنة نهائي' : 'تسميع أسبوعي'}</p>
                          <p className="text-gold font-bold mt-1">تقدير تجويد: {e.tajweedGrade === 'EXCELLENT' ? 'ممتاز' : 'جيد جداً'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-primary dark:text-emerald-400 font-bold">% {e.score}</span>
                          {e.score >= 90 && (
                            <a
                              href={`http://localhost:5000/api/progress/evaluations/certificates/${e.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-gold font-bold hover:underline"
                            >
                              🖥️ طباعة الشهادة
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeSubTab === 'billing' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment checkout form */}
            <div className="lg:col-span-2 p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">تجديد أو ترقية باقة الاشتراك</h3>

              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اختر الباقة</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setSelectedPlan('once_weekly')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedPlan === 'once_weekly' ? 'border-primary bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-gray-200'}`}
                    >
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">باقة حصة أسبوعياً</h4>
                      <p className="text-xs text-gray-500 mt-1">تجديد تلقائي كل شهر بـ 250 ج.م</p>
                    </div>

                    <div
                      onClick={() => setSelectedPlan('twice_weekly')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedPlan === 'twice_weekly' ? 'border-gold bg-amber-50/20 dark:bg-amber-950/20' : 'border-gray-200'}`}
                    >
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">باقة حصتين أسبوعياً</h4>
                      <p className="text-xs text-gray-500 mt-1">تجديد تلقائي كل شهر بـ 400 ج.م</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm border-b border-gray-100 dark:border-gray-800 pb-2">بيانات البطاقة الائتمانية (تجريبية)</h4>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">الاسم على البطاقة</label>
                    <input
                      type="text"
                      value={paymentName}
                      onChange={(e) => setPaymentName(e.target.value)}
                      placeholder="أحمد الحارثي"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">رقم البطاقة</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">تاريخ الانتهاء</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none text-center"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">رمز الأمان (CVV)</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="***"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none text-center"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-cream dark:bg-gray-800/50">
                  <span className="font-bold text-sm">المجموع الكلي للسداد:</span>
                  <span className="text-xl font-extrabold text-primary dark:text-emerald-400">{currentPrice} ج.م</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                >
                  سداد وتجديد الاشتراك فوراً
                </button>

                {paySuccess && (
                  <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                    ✅ تم سداد الفاتورة بنجاح وتفعيل الباقة المحددة!
                  </div>
                )}
              </form>
            </div>

            {/* Invoices list */}
            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">سجل الفواتير السابقة</h3>
              <div className="space-y-4">
                {subscriptions.filter(s => s.userId === currentUser.id).map(sub => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-cream dark:bg-gray-800/40 text-xs space-y-2 border border-gray-200/50 dark:border-gray-800">
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>الباقة {sub.planType === 'once_weekly' ? 'حصة أسبوعياً' : 'حصتين أسبوعياً'}</span>
                      <span className="text-primary dark:text-emerald-400">{sub.amount} ج.م</span>
                    </div>
                    <p className="text-gray-500">رقم المعاملة: {sub.paymentIntentId}</p>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>تاريخ: {new Date(sub.startDate).toLocaleDateString('ar-EG')}</span>
                      <span className="text-emerald-600 font-bold">مدفوعة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeSubTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">إعدادات حساب ولي الأمر</h3>

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

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                تحديث معلومات ولي الأمر
              </button>

              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                  ✅ تم تحديث بيانات الملف الشخصي بنجاح!
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
