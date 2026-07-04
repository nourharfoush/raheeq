'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Icons } from '@/components/Icons';

export default function MarketingPage() {
  const { theme, toggleTheme } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', msg: '' });
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', email: '', phone: '', msg: '' });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/quran-logo.png"
              alt="رحيق القرآن"
              className="w-12 h-12 rounded-xl object-cover shadow-lg border border-gold/30"
            />
            <div>
              <h1 className="text-xl font-bold text-primary dark:text-white tracking-wide">رحيق القرآن</h1>
              <p className="text-xs text-gold font-medium">المدرسة المصرية للتلاوة والمنهج الأزهري</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-primary dark:hover:text-gold transition-colors">المزايا</a>
            <a href="#plans" className="hover:text-primary dark:hover:text-gold transition-colors">الباقات</a>
            <a href="#testimonials" className="hover:text-primary dark:hover:text-gold transition-colors">آراء المشتركين</a>
            <a href="#contact" className="hover:text-primary dark:hover:text-gold transition-colors">تواصل معنا</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Icons.Sun size={20} className="text-amber-500" /> : <Icons.Moon size={20} className="text-primary" />}
            </button>
            <Link 
              href="/auth" 
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary hover:to-emerald-800 text-white font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg transition-all"
            >
              دخول / تسجيل
            </Link>
          </div>
        </div>
      </header>

      {/* Top Banner: Female Teacher Announcement */}
      <div className="bg-gradient-to-r from-emerald-50 via-rose-50/30 to-emerald-50 dark:from-emerald-950/20 dark:via-rose-950/10 dark:to-emerald-950/20 border-b border-gray-200 dark:border-gray-800 transition-colors py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
            <div className="relative shrink-0">
              <img 
                src="/female-teacher.png" 
                alt="معلمة قرآن" 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-gold/40 shadow-lg"
              />
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-gold text-white text-[10px] font-bold shadow-md">
                جديد متميز
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                🌸 حلقات الأخوات بمحفظات سيدات مجازات
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                نوفر فصولاً خاصة ومستقلة تماماً للأخوات والفتيات والأطفال تحت إشراف نخبة من معلمات الأزهر الشريف لضمان الخصوصية والراحة.
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto text-center">
            <Link 
              href="/auth?tab=register" 
              className="block md:inline-block text-center px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm shadow-md shadow-rose-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              احجز حلقة نسائية الآن
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/50 via-cream to-cream dark:from-emerald-950/20 dark:via-dark-bg dark:to-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-right">
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-primary dark:text-emerald-300 text-xs sm:text-sm font-semibold border border-emerald-200/50 dark:border-emerald-800/30">
                ✨ المنهج الأزهري الأصيل والمدرسة المصرية في التلاوة والقراءات
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold border border-rose-200/50 dark:border-rose-900/30">
                🌸 متوفر معلمات ومحفظات سيدات للأخوات والفتيات والأطفال
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.2]">
              يرتّق حفظك، <span className="bg-gradient-to-l from-primary to-primary-light dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">وينير دربك</span> بطابع مصري عريق
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              منصة إلكترونية رائدة تتيح للطلاب وأولياء أمورهم تنظيم ومتابعة خطط الحفظ والمراجعة مع معلمين ومعلمات مجازين من الأزهر الشريف والمدرسة المصرية للتلاوة عبر فصول تفاعلية مباشرة، مع توفير محفظات سيدات للأخوات والفتيات والأطفال لخصوصية تامة.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link 
                href="/auth?tab=register" 
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light hover:scale-[1.02] active:scale-[0.98] text-white font-bold shadow-lg shadow-primary/20 transition-all"
              >
                ابدأ رحلتك مجاناً
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 font-bold transition-all"
              >
                اكتشف المزايا
              </a>
            </div>
          </div>
          
          <div className="relative flex justify-center">
            {/* Visual Callout - Luxury Certificate & Class mockup card */}
            <div className="relative w-full max-w-md p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-primary dark:text-emerald-400 text-lg font-bold">🇪🇬</div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">حلقة التلاوة المصرية</h4>
                    <p className="text-xs text-gray-500">منهج فضيلة الشيخ الحصري</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-primary dark:text-emerald-400 text-xs font-bold">بث مباشر الآن</span>
              </div>
              
              <div className="p-4 rounded-2xl bg-cream dark:bg-gray-800/50 space-y-4">
                <p className="quran-text text-xl text-center text-primary dark:text-emerald-400 font-semibold">
                  ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
                </p>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>الورد اليومي: ص 12</span>
                  <span>الآيات: (80 - 85)</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                  <span>نسبة إنجاز خطة حنين انور حسن حرفوش</span>
                  <span className="text-gold">%75</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-gold rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-gold font-bold text-sm tracking-widest uppercase">ماذا تقدم رحيق القرآن؟</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              بيئة تعليمية إسلامية ذكية تليق بكتاب الله
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              نهتم بأدق التفاصيل البرمجية والتصميمية لتوفير واجهات سلسة تناسب الصغار والكبار، وتساعد المعلمين على التركيز في التعليم.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-cream/30 dark:bg-gray-800/30 space-y-6 hover:shadow-xl hover:scale-[1.01] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center text-3xl">💻</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">فصول بث مرئية تفاعلية</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                حصص بث مباشر تفاعلية (صوت وصورة) عالية الجودة من داخل المنصة تدعم مشاركة الشاشة وتدوين الملاحظات الفورية والتسجيل.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-cream/30 dark:bg-gray-800/30 space-y-6 hover:shadow-xl hover:scale-[1.01] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-gold flex items-center justify-center text-3xl">📈</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">خطط وتتبع تقدّم ذكي</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                بناء خطة حفظ ومراجعة مخصصة لكل طالب وتتبع تلقائي ومستمر لتقدم الحفظ بالصفحات والسور والأجزاء مع رسوم بيانية توضيحية.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-cream/30 dark:bg-gray-800/30 space-y-6 hover:shadow-xl hover:scale-[1.01] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-3xl">👨‍👩-👦</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">لوحة أولياء الأمور</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                لوحة تحكم خاصة لولي الأمر لمتابعة تقدم أبنائه، ومراجعة تقارير حضورهم ودرجات التسميع وتلقي إشعارات تفوقهم الفورية.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-cream/30 dark:bg-gray-800/30 space-y-6 hover:shadow-xl hover:scale-[1.01] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl">🌸</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">محفظات سيدات للأخوات</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                نوفر نخبة من المعلمات والمحفظات المجازات من الأزهر الشريف لتعليم السيدات والفتيات والأطفال بخصوصية تامة وراحة كاملة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plans Section */}
      <section id="plans" className="py-24 bg-cream/50 dark:bg-dark-bg/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-gold font-bold text-sm tracking-widest uppercase">خطط الأسعار والاشتراك</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              باقات مرنة تناسب الجميع وبوابات دفع آمنة
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              اختر الخطة المناسبة لك وابدأ فوراً بأسعار تنافسية ودعم فني متكامل على مدار الساعة.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
            {/* Once Weekly Plan */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 relative space-y-6 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">باقة حصة أسبوعياً</h3>
              <p className="text-sm text-gray-500">تناسب الطلاب الراغبين بتعلم هادئ ومستمر مع مجموعة صغيرة</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-primary dark:text-emerald-400">250 ج.م</span>
                <span className="text-gray-500 text-sm">/ شهرياً لكل دارس</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">🟢 حصة واحدة أسبوعياً مباشر</li>
                <li className="flex items-center gap-2">🟢 مدة الحصة ساعة كاملة</li>
                <li className="flex items-center gap-2">🟢 مجموعة تفاعلية من 3 دارسين فقط</li>
                <li className="flex items-center gap-2">🟢 خطة حفظ ومراجعة مخصصة ومتابعة مستمرة</li>
              </ul>
              <Link 
                href="/auth"
                className="block text-center w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold hover:shadow-lg transition-all"
              >
                اشترك الآن
              </Link>
            </div>
            
            {/* Twice Weekly Plan */}
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border-2 border-gold relative space-y-6 shadow-xl">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gold text-white text-xs font-bold uppercase tracking-wider">الخيار المفضل</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">باقة حصتين أسبوعياً</h3>
              <p className="text-sm text-gray-500">للطلاب الملتزمين بريادة أسرع وضبط متين لكتاب الله</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-primary dark:text-emerald-400">400 ج.م</span>
                <span className="text-gray-500 text-sm">/ شهرياً لكل دارس</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">🟢 حصتين أسبوعياً مباشر</li>
                <li className="flex items-center gap-2">🟢 مدة الحصة ساعة كاملة</li>
                <li className="flex items-center gap-2">🟢 مجموعة تفاعلية من 3 دارسين فقط</li>
                <li className="flex items-center gap-2">🟢 خطة حفظ ومراجعة مكثفة مع الشيخ</li>
                <li className="flex items-center gap-2">🟢 توفير مميز مقارنة بالاشتراك الفردي</li>
              </ul>
              <Link 
                href="/auth"
                className="block text-center w-full py-3 rounded-2xl bg-gradient-to-r from-gold to-amber-600 text-white font-bold hover:shadow-lg transition-all"
              >
                اشترك الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">شرفنا بخدمتهم وسعدنا بنجاحهم</h2>
            <p className="text-gray-600 dark:text-gray-300">نستعرض هنا آراء بعض أولياء الأمور والطلاب المشتركين معنا في حلقات تحفيظ القرآن الكريم.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-3xl bg-cream/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                "كان ابني يعاني من تشتت الحفظ، ولكن مع خطة الحفظ اليومية والورد الأزهري بالمنصة ومتابعة الشيخ وتنبيهات ولي الأمر، أتم حفظ 3 أجزاء بامتياز وسرعة عالية!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-lg flex items-center justify-center">👨‍💼</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">أحمد الشافعي</h4>
                  <p className="text-xs text-gray-500">القاهرة • ولي أمر الطالب نواف</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-3xl bg-cream/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                "أجمل ما في المنصة هو محاكاة أسلوب قراءة كبار قراء مصر كأمثال عبد الباسط والمنشاوي، وميزة إصدار الشهادات التلقائية التي حمست أبنائي كثيراً للتنافس."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-lg flex items-center justify-center">👩‍💼</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">أم محمد</h4>
                  <p className="text-xs text-gray-500">الإسكندرية • ولي أمر الطالبة حنين</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cream/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                "كعضو هيئة تدريس بالأزهر الشريف ومعلم بالمنصة، يسهل علي رصد غياب الطلاب وتقييم تسميعهم وتقدمهم لضبط أحكام التلاوة المصرية الأصيلة بدقة تامة."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-lg flex items-center justify-center">👳‍♂️</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">الشيخ محمود عبد العزيز</h4>
                  <p className="text-xs text-gray-500">طنطا • معلم القراءات والتجويد بالأزهر</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-cream/30 dark:bg-dark-bg/30 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">تواصل معنا أو اطلب مكالمة تعريفية</h2>
            <p className="text-sm text-gray-500">أدخل بياناتك وسيتواصل معك مشرف المنصة للإجابة على استفساراتك وتحديد موعد اختبار تحديد المستوى مجاناً.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الاسم الكريم</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="محمد الحربي" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 focus:outline-none focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 focus:outline-none focus:border-primary text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رقم الجوال (اختياري)</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0500000000" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رسالتك أو استفسارك</label>
              <textarea 
                rows={4}
                value={formData.msg}
                onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                placeholder="أرغب في تسجيل ابني ذو الـ 9 سنوات في باقة التجويد الأساسية..." 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-cream/30 dark:bg-gray-800/30 focus:outline-none focus:border-primary text-sm"
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              إرسال الرسالة
            </button>
            
            {success && (
              <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold text-center">
                ✅ تم إرسال طلبكم بنجاح! سيتواصل معكم المشرف خلال 24 ساعة.
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-emerald-100 py-12 transition-colors border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/quran-logo.png"
                alt="رحيق القرآن"
                className="w-10 h-10 rounded-xl object-cover border border-emerald-700"
              />
              <span className="text-xl font-bold text-white">رحيق القرآن</span>
            </div>
            <p className="text-sm text-emerald-200 max-w-sm">
              منصة تقنية إسلامية رائدة لحفظ وضبط كتاب الله عز وجل، باستخدام أحدث وسائل التكنولوجيا التعليمية المباشرة والمحفزة.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-lg">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-emerald-200">
              <li><a href="#features" className="hover:text-white transition-colors">ميزات المنصة</a></li>
              <li><a href="#plans" className="hover:text-white transition-colors">الباقات والاشتراكات</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">تجارب الطلاب وأولياء الأمور</a></li>
              <li><a href="/auth" className="hover:text-white transition-colors">لوحات تحكم المستخدمين</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-lg">معلومات التواصل</h4>
            <p className="text-sm text-emerald-200">دمنهور ، البحيرة ، جمهورية مصر العربية</p>
            <p className="text-sm text-emerald-200">بريد إلكتروني: nourharfoush218@gmail.com</p>
            <p className="text-sm text-emerald-200">هاتف: 00201064620018 </p>
            <div className="flex gap-4 mt-4">
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🐦</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">💬</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📘</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-emerald-800 mt-8 pt-6 text-center text-xs text-emerald-300">
          كل الحقوق محفوظة © {new Date().getFullYear()} لمنصة رحيق القرآن.
        </div>
      </footer>
    </div>
  );
}
