'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp, Role } from '@/context/AppContext';
import { Icons } from '@/components/Icons';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Collapsed state persistent via localStorage
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('tahfez_sidebar_collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem('tahfez_sidebar_collapsed', String(nextVal));
  };

  // Determine user role (fallback to ADMIN for testing if not logged in)
  const role: Role = currentUser?.role || 'ADMIN';
  const userName = currentUser?.name || 'زائر الأدمن (تجريبي)';

  // Navigation config per role
  const getSidebarItems = (): SidebarItem[] => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'لوحة الإحصائيات', href: '/dashboard/admin?tab=overview', icon: '📊' },
          { name: 'إدارة المستخدمين', href: '/dashboard/admin?tab=users', icon: '👥' },
          { name: 'المسجلين الجدد', href: '/dashboard/admin?tab=applicants', icon: '📨' },
          { name: 'الاشتراكات والإيرادات', href: '/dashboard/admin?tab=subscriptions', icon: '💳' },
          { name: 'المحفظين', href: '/teachers', icon: '👳‍♂️' },
          { name: 'الدارسين', href: '/students', icon: '👦' },
          { name: 'الحلقات', href: '/halaqat', icon: '🕋' },
          { name: 'التقارير اليومية', href: '/daily-reports', icon: '📝' },
          { name: 'مشرفو الحلقات', href: '/supervisors', icon: '👥' },
          { name: 'مشرفو العموم', href: '/general-supervisors', icon: '📈' },
          { name: 'ماليات الكادر', href: '/finances', icon: '💵' },
          { name: 'الضبط التقني', href: '/admin', icon: '⚙️' }
        ];
      case 'SUPERVISOR':
        return [
          { name: 'لوحة الإحصائيات', href: '/daily-reports', icon: '📊' },
          { name: 'المحفظين', href: '/teachers', icon: '👳‍♂️' },
          { name: 'الدارسين', href: '/students', icon: '👦' },
          { name: 'الحلقات', href: '/halaqat', icon: '🕋' },
          { name: 'التقارير اليومية', href: '/daily-reports', icon: '📝' }
        ];
      case 'TEACHER':
        return [
          { name: 'لوحة الإحصائيات', href: '/dashboard/teacher', icon: '📊' },
          { name: 'الدارسين', href: '/students', icon: '👦' },
          { name: 'الحلقات', href: '/halaqat', icon: '🕋' },
          { name: 'التقارير اليومية', href: '/daily-reports', icon: '📝' },
          { name: 'ماليات الكادر', href: '/finances', icon: '💵' }
        ];
      case 'STUDENT':
        return [
          { name: 'لوحة الإحصائيات', href: '/dashboard/student', icon: '📊' },
          { name: 'المحفظين', href: '/teachers', icon: '👳‍♂️' },
          { name: 'الحلقات', href: '/halaqat', icon: '🕋' },
          { name: 'التقارير اليومية', href: '/daily-reports', icon: '📝' }
        ];
      case 'PARENT':
        return [
          { name: 'لوحة الإحصائيات', href: '/dashboard/parent', icon: '📊' },
          { name: 'المحفظين', href: '/teachers', icon: '👳‍♂️' },
          { name: 'الحلقات', href: '/halaqat', icon: '🕋' },
          { name: 'التقارير اليومية', href: '/daily-reports', icon: '📝' }
        ];
      default:
        return [];
    }
  };

  const navItems = getSidebarItems();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  if (!mounted) {
    return <div className="min-h-screen bg-cream dark:bg-dark-bg" />;
  }

  return (
    <div className="h-screen overflow-hidden bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors flex">
      
      {/* Mobile sidebar overlay backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Dynamic Collapsible Sidebar */}
      <aside 
        className={`bg-emerald-950 text-white shrink-0 transition-all duration-300 flex flex-col justify-between border-l border-emerald-900/40 h-full overflow-y-auto 
          fixed md:relative z-50 md:z-auto right-0 top-0 bottom-0 md:translate-x-0 
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} 
          ${isCollapsed ? 'md:w-20 w-64' : 'w-64'}
        `}
      >
        <div>
          {/* Header section with brand and collapse toggle */}
          <div className={`p-4 flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-2.5">
                <img
                  src="/quran-logo.png"
                  alt="رحيق القرآن"
                  className="w-10 h-10 rounded-xl object-cover shadow-md border border-gold/30"
                />
                <div>
                  <h1 className="text-sm font-bold text-white leading-tight">رحيق القرآن</h1>
                  <p className="text-[10px] text-gold font-bold">المدرسة المصرية للتلاوة</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <img
                src="/quran-logo.png"
                alt="رحيق القرآن"
                className="w-9 h-9 rounded-xl object-cover shadow-md border border-gold/30"
              />
            )}
            
            {/* Collapse / Expand Toggle button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gold transition-all"
              title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              {isCollapsed ? '◀' : '▶'}
            </button>
          </div>

          {/* User profile brief */}
          <div className={`p-4 border-b border-white/5 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold text-lg shrink-0">
              {userName.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <p className="text-[9px] text-gray-400 capitalize mt-0.5">{role === 'ADMIN' ? 'مدير عام' : role}</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-gold to-amber-500 text-emerald-950 shadow-md scale-[1.02]'
                      : 'text-emerald-100 hover:bg-white/5 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={item.name}
                >
                  <span className="text-lg shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions inside Sidebar */}
        <div className="p-3 space-y-2 border-t border-white/10 bg-emerald-950/80">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100 hover:bg-white/5 hover:text-white transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="تبديل الوضع الليلي"
          >
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {!isCollapsed && <span>{theme === 'dark' ? 'الوضع المضيء' : 'الوضع الداكن'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-300 hover:bg-red-500/10 hover:text-red-100 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="تسجيل الخروج"
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area with Top Bar */}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col h-full">

        {/* ─── Top Bar ─── */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 h-14 flex items-center justify-between shrink-0 shadow-sm">
          
          {/* Left: current page label */}
          <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden transition-all"
              title="فتح القائمة"
            >
              <Icons.Menu size={18} />
            </button>
            <span className="hidden sm:inline">
              {navItems.find(i => i.href === pathname)?.icon ?? '📄'}
            </span>
            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">
              {navItems.find(i => i.href === pathname)?.name ?? 'لوحة التحكم'}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">

            {/* Dark / Light toggle — prominent pill button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'التبديل للوضع المضيء' : 'التبديل للوضع الداكن'}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm border ${
                theme === 'dark'
                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-400/20'
                  : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
              }`}
            >
              <span className="text-base transition-transform duration-300">
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
              <span className="hidden sm:inline">
                {theme === 'dark' ? 'مضيء' : 'داكن'}
              </span>
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                {userName.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                {userName}
              </span>
            </div>

          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

      </main>

    </div>
  );
}
