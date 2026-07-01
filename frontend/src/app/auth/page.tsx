'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp, Role } from '@/context/AppContext';
import { Icons } from '@/components/Icons';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, verifyOtp, resetPassword, confirmReset, currentUser, loading } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'otp' | 'forgot' | 'reset-otp'>('form');

  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [parentId, setParentId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state feedback
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devOtp, setDevOtp] = useState(''); // helper to show OTP on screen for fast testing

  // Redirect if already logged in
  useEffect(() => {
    if (loading) return;
    if (currentUser) {
      redirectUser(currentUser.role);
    }
  }, [currentUser, loading]);

  // Read URL query params (e.g. ?tab=register)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  const redirectUser = (userRole: Role) => {
    if (userRole === 'ADMIN') router.push('/dashboard/admin');
    else if (userRole === 'TEACHER') router.push('/dashboard/teacher');
    else if (userRole === 'PARENT') router.push('/dashboard/parent');
    else router.push('/dashboard/student');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const user = await login(username, password);
      setMessage('تم تسجيل الدخول بنجاح، جاري تحويلك...');
      setTimeout(() => redirectUser(user.role), 1000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const code = await register(username, name, phone, role, parentId, password);
      setDevOtp(code); // store for easy viewing
      setStep('otp');
      setMessage('تم إرسال رمز التحقق (OTP) بنجاح!');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const user = await verifyOtp(username, otp);
      setMessage('تم تفعيل الحساب والتحقق بنجاح! جاري تحويلك...');
      setTimeout(() => redirectUser(user.role), 1200);
    } catch (err: any) {
      setError(err.message || 'الرمز المدخل غير صحيح');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const code = await resetPassword(username);
      setDevOtp(code);
      setStep('reset-otp');
      setMessage('تم إرسال رمز إعادة التعيين لاسم المستخدم الخاص بكم.');
    } catch (err: any) {
      setError(err.message || 'اسم المستخدم غير مسجل');
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await confirmReset(username, otp, newPassword);
      setMessage('تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن.');
      setStep('form');
      setActiveTab('login');
      setOtp('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'الرمز المدخل غير صحيح');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gold/5 to-transparent rounded-tr-full"></div>

        {/* Logo and title */}
        <div className="text-center relative z-10">
          <Link href="/" className="inline-block mb-3 hover:scale-105 transition-transform">
            <img
              src="/quran-logo.png"
              alt="رحيق القرآن"
              className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-lg border-2 border-gold/30"
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">رحيق القرآن</h2>
          <p className="text-sm text-gray-500 mt-1">بوابتك الذكية لحفظ وتعلم كتاب الله</p>
        </div>

        {/* Tab switchers */}
        {step === 'form' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl relative z-10">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              حساب جديد
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-100 text-red-800 text-sm font-semibold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <span>✅</span> {message}
          </div>
        )}

        {/* Forms Switch logic */}
        {step === 'form' && activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">اسم المستخدم التجريبي (student / teacher / parent / admin)</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500">كلمة المرور التجريبية (password123)</label>
                <button type="button" onClick={() => setStep('forgot')} className="text-xs font-bold text-gold hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              تسجيل الدخول
            </button>
          </form>
        )}

        {step === 'form' && activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">الاسم بالكامل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد اليوسف"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">رقم الجوال</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0500000000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">دور الحساب</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
              >
                <option value="STUDENT">طالب قرآن</option>
                <option value="PARENT">ولي أمر طالب</option>
                <option value="TEACHER">معلم حلقات</option>
              </select>
            </div>

            {role === 'STUDENT' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">اسم المستخدم لولي الأمر (اختياري)</label>
                <input
                  type="text"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  placeholder="parent"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              تسجيل الحساب وإرسال الـ OTP
            </button>
          </form>
        )}

        {/* OTP Verification form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10">
            <div className="text-center text-sm text-gray-500">
              أدخل رمز التحقق المؤلف من 6 أرقام لاسم المستخدم <strong className="text-gray-700 dark:text-gray-300">{username}</strong>
            </div>

            {devOtp && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 text-amber-800 dark:text-amber-200 text-xs font-bold text-center">
                🔑 رمز التحقق التجريبي (OTP) هو: <span className="text-lg tracking-widest text-primary dark:text-gold">{devOtp}</span>
              </div>
            )}

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-xl tracking-widest text-center focus:outline-none focus:border-primary font-bold"
              required
            />

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-md transition-all"
            >
              التحقق من الرمز
            </button>

            <button type="button" onClick={() => setStep('form')} className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-700 hover:underline">العودة لتعديل البيانات</button>
          </form>
        )}

        {/* Forgot password request */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-6 relative z-10">
            <div className="text-center text-sm text-gray-500">أدخل اسم المستخدم لإرسال رمز التحقق لتغيير كلمة المرور الخاصة بك.</div>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
              required
            />

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-md transition-all"
            >
              طلب رمز إعادة التعيين
            </button>

            <button type="button" onClick={() => setStep('form')} className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-700 hover:underline">العودة لتسجيل الدخول</button>
          </form>
        )}

        {/* Reset OTP confirmation & new password */}
        {step === 'reset-otp' && (
          <form onSubmit={handleConfirmReset} className="space-y-5 relative z-10">
            {devOtp && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 text-amber-800 dark:text-amber-200 text-xs font-bold text-center">
                🔑 رمز الاستعادة التجريبي (OTP) هو: <span className="text-lg tracking-widest text-primary dark:text-gold">{devOtp}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">أدخل رمز التحقق (OTP)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-center tracking-widest text-sm focus:outline-none focus:border-primary font-bold animate-pulse"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-md transition-all"
            >
              تحديث كلمة المرور
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg text-primary dark:text-gold font-bold">
        جاري تحميل رحيق القرآن...
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
