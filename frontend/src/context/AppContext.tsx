'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiLogin, apiRegister, apiVerifyOtp, apiResetPassword, apiConfirmReset,
  apiGetMe, apiUpdateProfile, clearToken, getToken, setToken,
  apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser,
  apiSubmitApplication, apiGetApplicants, apiUpdateApplicantStatus, apiDeleteApplicant, ApiApplicant
} from '@/lib/api';


// Types mimicking backend schema
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'SUPERVISOR';

export interface User {
  id: string;
  username: string;
  name: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  passwordHash?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  parentId?: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  bio?: string;
}

export interface Halaqa {
  id: string;
  name: string;
  description: string;
  type: 'INDIVIDUAL' | 'GROUP';
  capacity: number;
  schedule?: Array<{ day: string; time: string }>;
  teacherId: string;
  studentsCount: number;
  supervisorId?: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  days?: string[];
  linkType?: 'INTERNAL' | 'EXTERNAL';
  externalLink?: string;
  initialSurah?: string;
  initialAyah?: string;
}

export interface Session {
  id: string;
  halaqaId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  liveUrl?: string;
  recordingUrl?: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
}

export interface MemorizationPlan {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  targetSurah: string;
  targetAyah: number;
  targetJuz: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
}

export interface ProgressLog {
  id: string;
  studentId?: string;
  planId?: string;
  surah: string;
  startAyah: number;
  endAyah: number;
  pagesCount: number;
  isRevision: boolean;
  date: string;
  notes?: string;
  halaqaId?: string;
  status?: 'PENDING' | 'CONFIRMED';
  tasmeeghFromSurah?: string;
  tasmeeghFromAyah?: number;
  tasmeeghToSurah?: string;
  tasmeeghToAyah?: number;
  hifzFromSurah?: string;
  hifzFromAyah?: number;
  hifzToSurah?: string;
  hifzToAyah?: number;
  nearRevisionFromSurah?: string;
  nearRevisionFromAyah?: number;
  nearRevisionToSurah?: string;
  nearRevisionToAyah?: number;
  farRevisionFromSurah?: string;
  farRevisionFromAyah?: number;
  farRevisionToSurah?: string;
  farRevisionToAyah?: number;
}

export interface Evaluation {
  id: string;
  studentId: string;
  evaluatorId: string;
  score: number;
  mistakesCount: number;
  hesitationsCount: number;
  tajweedGrade: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'NEED_WORK';
  type: 'DAILY' | 'TEST' | 'EXAM';
  notes?: string;
  certificateUrl?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  amount: number;
  startDate: string;
  endDate: string;
  paymentIntentId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  users: User[];
  studentProfiles: StudentProfile[];
  teacherProfiles: TeacherProfile[];
  halaqat: Halaqa[];
  sessions: Session[];
  attendance: Attendance[];
  plans: MemorizationPlan[];
  progressLogs: ProgressLog[];
  evaluations: Evaluation[];
  subscriptions: Subscription[];
  notifications: Notification[];
  applicants: ApiApplicant[];
  
  // Actions
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, name: string, phone: string, role: Role, parentId?: string, password?: string) => Promise<string>;
  verifyOtp: (username: string, otp: string) => Promise<User>;
  resetPassword: (username: string) => Promise<string>;
  confirmReset: (username: string, otp: string, newPass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, phone: string, bio?: string) => Promise<void>;
  
  // Admin User management
  refreshUsers: () => Promise<void>;
  addUser: (userData: { username: string; password?: string; name: string; phone?: string; role: Role; isActive?: boolean }) => Promise<void>;
  updateUser: (id: string, userData: { username?: string; password?: string; name?: string; phone?: string; role?: Role; isActive?: boolean }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Applicants management
  refreshApplicants: () => Promise<void>;
  submitApplication: (data: { name: string; nationalId: string; country: string; email?: string; packageName: string; whatsapp: string; siblings?: string; isMemorized: boolean; memorizedSurahs?: string; memorizeStart?: string }) => Promise<ApiApplicant>;
  updateApplicantStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => Promise<void>;
  deleteApplicant: (id: string) => Promise<void>;
  
  // Platform management
  createHalaqa: (halaqa: Omit<Halaqa, 'id' | 'studentsCount'>) => void;
  updateHalaqatList: (updated: Halaqa[]) => void;
  enrollInHalaqa: (halaqaId: string, studentId: string) => Promise<void>;
  createSession: (halaqaId: string, title: string, description: string, start: string, end: string) => void;
  submitAttendance: (sessionId: string, records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; notes?: string }>) => void;
  createPlan: (plan: Omit<MemorizationPlan, 'id' | 'status'>) => void;
  addProgressLog: (log: Omit<ProgressLog, 'id' | 'date'> & { date?: string }) => void;
  confirmProgressLog: (id: string) => void;
  deleteProgressLog: (id: string) => void;
  updateProgressLog: (id: string, updatedLog: Partial<ProgressLog>) => void;
  addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'certificateUrl'>) => void;
  checkoutSubscription: (planType: string, amount: number) => Promise<void>;
  markNotificationRead: (id: string) => void;
  
  // Dark mode
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial State Seeds
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<TeacherProfile[]>([]);
  const [halaqat, setHalaqat] = useState<Halaqa[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [plans, setPlans] = useState<MemorizationPlan[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [applicants, setApplicants] = useState<ApiApplicant[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [otpStore, setOtpStore] = useState<Record<string, { otp: string; data: any }>>({});

  // 2. Load from LocalStorage or seed if empty
  useEffect(() => {
    // Theme setup — read from localStorage and apply immediately
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }

    const localUsers = localStorage.getItem('t_users');
    if (localUsers) {
      let parsedUsers: User[] = JSON.parse(localUsers);
      // Migration: add passwordHash to admin user if missing (backward compatibility)
      let migrated = false;
      parsedUsers = parsedUsers.map(u => {
        if (!u.passwordHash && u.username === 'admin') {
          migrated = true;
          return { ...u, passwordHash: btoa('password123') };
        }
        return u;
      });
      if (migrated) localStorage.setItem('t_users', JSON.stringify(parsedUsers));
      setUsers(parsedUsers);
      setCurrentUser(localStorage.getItem('t_current_user') ? JSON.parse(localStorage.getItem('t_current_user')!) : null);
      setStudentProfiles(JSON.parse(localStorage.getItem('t_student_profiles') || '[]'));
      setTeacherProfiles(JSON.parse(localStorage.getItem('t_teacher_profiles') || '[]'));
      
      const savedHalaqat = localStorage.getItem('tahfez_halaqat_crud') || localStorage.getItem('t_halaqat');
      let loadedHalaqat = JSON.parse(savedHalaqat || '[]');
      if (loadedHalaqat.length === 0) {
        const todayName = (() => {
          const daysMap = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          return daysMap[new Date().getDay()];
        })();
        const now = new Date();
        const currentHour = now.getHours();
        const formatHour = (h: number) => String(h > 12 ? h - 12 : h === 0 ? 12 : h).padStart(2, '0');
        const getPeriod = (h: number) => (h >= 12 ? 'م' : 'ص');
        const demoStart = `${formatHour(currentHour - 1)}:00 ${getPeriod(currentHour - 1)}`;
        const demoEnd = `${formatHour(currentHour + 2)}:00 ${getPeriod(currentHour + 2)}`;

        loadedHalaqat = [
          {
            id: '101',
            name: 'حلقة التلاوة المصرية الأزهري',
            description: 'منهج ورش وحفص',
            type: 'GROUP',
            capacity: 15,
            schedule: [{ day: todayName, time: '16:00' }, { day: 'الإثنين', time: '16:00' }],
            teacherId: 't-1',
            studentsCount: 1,
            supervisorId: 'sup-1',
            startDate: '2026-01-01',
            startTime: demoStart,
            endTime: demoEnd,
            days: [todayName, 'الإثنين', 'الأربعاء'],
            linkType: 'INTERNAL',
            initialSurah: 'البقرة',
            initialAyah: '1'
          },
          {
            id: '102',
            name: 'حلقة الهمم العالية للقرآن',
            description: 'حفظ مكثف للأطفال',
            type: 'GROUP',
            capacity: 10,
            schedule: [{ day: 'السبت', time: '19:30' }, { day: 'الثلاثاء', time: '19:30' }],
            teacherId: 't-2',
            studentsCount: 0,
            supervisorId: 'sup-1',
            startDate: '2026-02-15',
            startTime: '07:30 م',
            endTime: '09:00 م',
            days: ['السبت', 'الثلاثاء', 'الخميس'],
            linkType: 'EXTERNAL',
            externalLink: 'https://teams.microsoft.com/l/meetup-join/mock',
            initialSurah: 'البقرة',
            initialAyah: '1'
          }
        ];
        localStorage.setItem('tahfez_halaqat_crud', JSON.stringify(loadedHalaqat));
        localStorage.setItem('t_halaqat', JSON.stringify(loadedHalaqat));
      }
      setHalaqat(loadedHalaqat);
      
      setSessions(JSON.parse(localStorage.getItem('t_sessions') || '[]'));
      setAttendance(JSON.parse(localStorage.getItem('t_attendance') || '[]'));
      setPlans(JSON.parse(localStorage.getItem('t_plans') || '[]'));
      setProgressLogs(JSON.parse(localStorage.getItem('t_progress') || '[]'));
      setEvaluations(JSON.parse(localStorage.getItem('t_evaluations') || '[]'));
      setSubscriptions(JSON.parse(localStorage.getItem('t_subscriptions') || '[]'));
      setNotifications(JSON.parse(localStorage.getItem('t_notifications') || '[]'));
      setApplicants(JSON.parse(localStorage.getItem('t_applicants') || '[]'));
    } else {
      // ── مستخدم المدير فقط عند التهيئة الأولى ──
      // لا توجد بيانات وهمية — المنصة تبدأ نظيفة تماماً
      const defaultUsers: User[] = [
        { id: 'u-admin', username: 'admin', name: 'المدير العام', phone: '0500000001', role: 'ADMIN', isActive: true, passwordHash: btoa('password123') }
      ];

      const defaultStudents: StudentProfile[] = [];
      const defaultTeachers: TeacherProfile[] = [];
      const defaultParents: StudentProfile[] = [];
      const todayName = (() => {
        const daysMap = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return daysMap[new Date().getDay()];
      })();
      const now = new Date();
      const currentHour = now.getHours();
      const formatHour = (h: number) => String(h > 12 ? h - 12 : h === 0 ? 12 : h).padStart(2, '0');
      const getPeriod = (h: number) => (h >= 12 ? 'م' : 'ص');
      const demoStart = `${formatHour(currentHour - 1)}:00 ${getPeriod(currentHour - 1)}`;
      const demoEnd = `${formatHour(currentHour + 2)}:00 ${getPeriod(currentHour + 2)}`;

      const defaultHalaqat: Halaqa[] = [
        {
          id: '101',
          name: 'حلقة التلاوة المصرية الأزهري',
          description: 'منهج ورش وحفص',
          type: 'GROUP',
          capacity: 15,
          schedule: [{ day: todayName, time: '16:00' }, { day: 'الإثنين', time: '16:00' }],
          teacherId: 't-1',
          studentsCount: 1,
          supervisorId: 'sup-1',
          startDate: '2026-01-01',
          startTime: demoStart,
          endTime: demoEnd,
          days: [todayName, 'الإثنين', 'الأربعاء'],
          linkType: 'INTERNAL',
          initialSurah: 'البقرة',
          initialAyah: '1'
        },
        {
          id: '102',
          name: 'حلقة الهمم العالية للقرآن',
          description: 'حفظ مكثف للأطفال',
          type: 'GROUP',
          capacity: 10,
          schedule: [{ day: 'السبت', time: '19:30' }, { day: 'الثلاثاء', time: '19:30' }],
          teacherId: 't-2',
          studentsCount: 0,
          supervisorId: 'sup-1',
          startDate: '2026-02-15',
          startTime: '07:30 م',
          endTime: '09:00 م',
          days: ['السبت', 'الثلاثاء', 'الخميس'],
          linkType: 'EXTERNAL',
          externalLink: 'https://teams.microsoft.com/l/meetup-join/mock',
          initialSurah: 'البقرة',
          initialAyah: '1'
        }
      ];
      const defaultSessions: Session[] = [];
      const defaultPlans: MemorizationPlan[] = [];
      const defaultProgress: ProgressLog[] = [];
      const defaultEvaluations: Evaluation[] = [];
      const defaultSubscriptions: Subscription[] = [];
      const defaultNotifications: Notification[] = [];
      const defaultApplicants: ApiApplicant[] = [];

      setUsers(defaultUsers);
      setStudentProfiles(defaultStudents);
      setTeacherProfiles(defaultTeachers);
      setHalaqat(defaultHalaqat);
      setSessions(defaultSessions);
      setPlans(defaultPlans);
      setProgressLogs(defaultProgress);
      setEvaluations(defaultEvaluations);
      setSubscriptions(defaultSubscriptions);
      setNotifications(defaultNotifications);
      setApplicants(defaultApplicants);

      localStorage.setItem('t_users', JSON.stringify(defaultUsers));
      localStorage.setItem('t_student_profiles', JSON.stringify(defaultStudents));
      localStorage.setItem('t_teacher_profiles', JSON.stringify(defaultTeachers));
      localStorage.setItem('t_halaqat', JSON.stringify(defaultHalaqat));
      localStorage.setItem('tahfez_halaqat_crud', JSON.stringify(defaultHalaqat));
      localStorage.setItem('t_sessions', JSON.stringify(defaultSessions));
      localStorage.setItem('t_plans', JSON.stringify(defaultPlans));
      localStorage.setItem('t_progress', JSON.stringify(defaultProgress));
      localStorage.setItem('t_evaluations', JSON.stringify(defaultEvaluations));
      localStorage.setItem('t_subscriptions', JSON.stringify(defaultSubscriptions));
      localStorage.setItem('t_notifications', JSON.stringify(defaultNotifications));
      localStorage.setItem('t_applicants', JSON.stringify(defaultApplicants));
    }
    setLoading(false);
  }, []);

  // Fetch users from API if current user is ADMIN
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      refreshUsers();
      refreshApplicants();
    }
  }, [currentUser]);

  // Save changes helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    if (key === 't_halaqat') {
      localStorage.setItem('tahfez_halaqat_crud', JSON.stringify(data));
    }
  };

  // Auth Operations — now backed by the real Express API + PostgreSQL
  const login = async (username: string, pass: string): Promise<User> => {
    const { user: apiUser } = await apiLogin(username, pass);
    const user: User = {
      id: apiUser.id,
      username: apiUser.username,
      name: apiUser.name,
      phone: apiUser.phone,
      role: apiUser.role,
      isActive: apiUser.isActive,
    };
    setCurrentUser(user);
    localStorage.setItem('t_current_user', JSON.stringify(user));
    return user;
  };

  const register = async (username: string, name: string, phone: string, role: Role, parentId?: string, password?: string): Promise<string> => {
    const resp = await apiRegister(username, password || '', name, phone, role, parentId);
    // In dev mode, the backend returns the OTP in the response for easy testing
    return resp.otp || resp.message;
  };

  const verifyOtp = async (username: string, otp: string): Promise<User> => {
    const { user: apiUser } = await apiVerifyOtp(username, otp);
    const user: User = {
      id: apiUser.id,
      username: apiUser.username,
      name: apiUser.name,
      phone: apiUser.phone,
      role: apiUser.role,
      isActive: apiUser.isActive,
    };
    setCurrentUser(user);
    localStorage.setItem('t_current_user', JSON.stringify(user));
    return user;
  };

  const resetPassword = async (username: string): Promise<string> => {
    const resp = await apiResetPassword(username);
    return resp.otp || resp.message;
  };

  const confirmReset = async (username: string, otp: string, newPass: string): Promise<boolean> => {
    await apiConfirmReset(username, otp, newPass);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    clearToken();
    localStorage.removeItem('t_current_user');
  };

  const updateProfile = async (name: string, phone: string, bio?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, phone };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    saveState('t_users', updatedUsers);
    localStorage.setItem('t_current_user', JSON.stringify(updatedUser));

    if (currentUser.role === 'TEACHER' && bio) {
      const updatedTeachers = teacherProfiles.map(t => 
        t.userId === currentUser.id ? { ...t, bio } : t
      );
      setTeacherProfiles(updatedTeachers);
      saveState('t_teacher_profiles', updatedTeachers);
    }
  };

  // Admin User management implementation
  const refreshUsers = async () => {
    try {
      const data = await apiGetUsers();
      const mapped: User[] = data.map((u: any) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        phone: u.phone,
        role: u.role,
        isActive: u.isActive
      }));
      setUsers(mapped);
      saveState('t_users', mapped);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const addUser = async (userData: { username: string; password?: string; name: string; phone?: string; role: Role; isActive?: boolean }) => {
    try {
      const newUser = await apiCreateUser(userData);
      const mapped: User = {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive
      };
      setUsers(prev => [mapped, ...prev]);
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء إضافة المستخدم');
    }
  };

  const updateUser = async (id: string, userData: { username?: string; password?: string; name?: string; phone?: string; role?: Role; isActive?: boolean }) => {
    try {
      const updatedUser = await apiUpdateUser(id, userData);
      const mapped: User = {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      };
      setUsers(prev => prev.map(u => u.id === id ? mapped : u));
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء تعديل بيانات المستخدم');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiDeleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء حذف المستخدم');
    }
  };

  // Applicants management
  const refreshApplicants = async () => {
    try {
      const data = await apiGetApplicants();
      setApplicants(data);
      saveState('t_applicants', data);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
    }
  };

  const submitApplication = async (data: { name: string; nationalId: string; country: string; email?: string; packageName: string; whatsapp: string; siblings?: string; isMemorized: boolean; memorizedSurahs?: string; memorizeStart?: string }) => {
    try {
      const newApp = await apiSubmitApplication(data);
      setApplicants(prev => [newApp, ...prev]);
      return newApp;
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء تقديم طلب التسجيل');
    }
  };

  const updateApplicantStatus = async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      const updated = await apiUpdateApplicantStatus(id, status);
      setApplicants(prev => prev.map(a => a.id === id ? updated : a));
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const deleteApplicant = async (id: string) => {
    try {
      await apiDeleteApplicant(id);
      setApplicants(prev => prev.filter(a => a.id !== id));
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء حذف طلب المتقدم');
    }
  };

  // Actions for platform
  const createHalaqa = (newHalaqa: Omit<Halaqa, 'id' | 'studentsCount'>) => {
    const halaqa: Halaqa = {
      ...newHalaqa,
      id: `h-${Math.random().toString(36).substring(5)}`,
      studentsCount: 0
    };
    const updated = [...halaqat, halaqa];
    setHalaqat(updated);
    saveState('t_halaqat', updated);
  };

  const updateHalaqatList = (updated: Halaqa[]) => {
    setHalaqat(updated);
    saveState('t_halaqat', updated);
  };

  const enrollInHalaqa = async (halaqaId: string, studentId: string) => {
    const updatedHalaqat = halaqat.map(h => {
      if (h.id === halaqaId) {
        if (h.studentsCount >= h.capacity) throw new Error('الحلقة ممتلئة بالكامل');
        return { ...h, studentsCount: h.studentsCount + 1 };
      }
      return h;
    });
    setHalaqat(updatedHalaqat);
    saveState('t_halaqat', updatedHalaqat);
  };

  const createSession = (halaqaId: string, title: string, description: string, start: string, end: string) => {
    const safeRoom = `Room-${halaqaId.slice(0, 5)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSession: Session = {
      id: `sess-${Math.random().toString(36).substring(5)}`,
      halaqaId,
      title,
      description,
      startTime: start,
      endTime: end,
      status: 'SCHEDULED',
      liveUrl: `https://meet.jit.si/${safeRoom}`
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    saveState('t_sessions', updated);
  };

  const submitAttendance = (sessionId: string, records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; notes?: string }>) => {
    // Delete past records for this session to update
    const filtered = attendance.filter(a => a.sessionId !== sessionId);
    const newRecords: Attendance[] = records.map(r => ({
      id: `att-${Math.random().toString(36).substring(5)}`,
      sessionId,
      studentId: r.studentId,
      status: r.status,
      notes: r.notes
    }));
    const updated = [...filtered, ...newRecords];
    setAttendance(updated);
    saveState('t_attendance', updated);
    
    // Change session status to completed
    const updatedSessions = sessions.map(s => s.id === sessionId ? { ...s, status: 'COMPLETED' } as Session : s);
    setSessions(updatedSessions);
    saveState('t_sessions', updatedSessions);
  };

  const createPlan = (newPlan: Omit<MemorizationPlan, 'id' | 'status'>) => {
    const plan: MemorizationPlan = {
      ...newPlan,
      id: `plan-${Math.random().toString(36).substring(5)}`,
      status: 'ACTIVE'
    };
    const updated = [...plans, plan];
    setPlans(updated);
    saveState('t_plans', updated);
  };

  const addProgressLog = (newLog: Omit<ProgressLog, 'id' | 'date'> & { date?: string }) => {
    const log: ProgressLog = {
      ...newLog,
      id: `log-${Math.random().toString(36).substring(5)}`,
      date: newLog.date || new Date().toISOString()
    };
    const updated = [log, ...progressLogs];
    setProgressLogs(updated);
    saveState('t_progress', updated);

    // Send notification to student's parent
    if (newLog.studentId) {
      const student = studentProfiles.find(s => s.id === newLog.studentId);
      if (student?.parentId) {
        const parentProf = studentProfiles.find(p => p.id === student.parentId); // parent profile
        const parentUser = users.find(u => u.id === parentProf?.userId || u.id === student.parentId); // or linked userId
        const studentUser = users.find(u => u.id === student.userId);

        if (studentUser) {
          const title = 'تحديث تقدم الحفظ لأبنائكم';
          const content = `أنجز الطالب ${studentUser.name} بنجاح ورد ${newLog.isRevision ? 'مراجعة' : 'حفظ'} سورة ${newLog.surah} من الآية ${newLog.startAyah} إلى ${newLog.endAyah}.`;
          
          // Find parent's userId to send notification
          const parentUserObj = users.find(u => u.role === 'PARENT' && (u.id === student.parentId || student.parentId === 'p-profile'));
          if (parentUserObj) {
            const notif: Notification = {
              id: `not-${Math.random().toString(36).substring(5)}`,
              userId: parentUserObj.id,
              title,
              content,
              isRead: false,
              createdAt: new Date().toISOString()
            };
            const updatedNotifs = [notif, ...notifications];
            setNotifications(updatedNotifs);
            saveState('t_notifications', updatedNotifs);
          }
        }
      }
    }
  };
  const confirmProgressLog = (id: string) => {
    const log = progressLogs.find(l => l.id === id);
    if (!log) return;
    
    const updated = progressLogs.map(l => 
      l.id === id ? { ...l, status: 'CONFIRMED' as const } : l
    );
    setProgressLogs(updated);
    saveState('t_progress', updated);

    // Send notification to teacher
    const teacherUser = users.find(u => u.role === 'TEACHER');
    if (teacherUser) {
      const notif: Notification = {
        id: `not-${Math.random().toString(36).substring(5)}`,
        userId: teacherUser.id,
        title: 'تم اعتماد تقرير الحلقة اليومي',
        content: `تم اعتماد تقرير التسميع والتحفيظ للمجموعة بنجاح وصرف مستحقاتك المالية المرتبطة به.`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      saveState('t_notifications', updatedNotifs);
    }
  };
  const deleteProgressLog = (id: string) => {
    const updated = progressLogs.filter(l => l.id !== id);
    setProgressLogs(updated);
    saveState('t_progress', updated);
  };
  const updateProgressLog = (id: string, updatedLog: Partial<ProgressLog>) => {
    const updated = progressLogs.map(l => 
      l.id === id ? { ...l, ...updatedLog } : l
    );
    setProgressLogs(updated);
    saveState('t_progress', updated);
  };
  const addEvaluation = (newEval: Omit<Evaluation, 'id' | 'createdAt' | 'certificateUrl'>) => {
    const evalId = `eval-${Math.random().toString(36).substring(5)}`;
    const evalObj: Evaluation = {
      ...newEval,
      id: evalId,
      createdAt: new Date().toISOString(),
      certificateUrl: newEval.type === 'EXAM' && newEval.score >= 90 ? `/api/progress/evaluations/certificates/${evalId}` : undefined
    };
    const updated = [evalObj, ...evaluations];
    setEvaluations(updated);
    saveState('t_evaluations', updated);

    // Send notification to student
    const student = studentProfiles.find(s => s.id === newEval.studentId);
    const studentUser = users.find(u => u.id === student?.userId);
    if (studentUser) {
      const notif: Notification = {
        id: `not-${Math.random().toString(36).substring(5)}`,
        userId: studentUser.id,
        title: 'تقييم تسميع جديد',
        content: `رصد المعلم تقييماً جديداً لك بمعدل ${newEval.score}% ودرجة تجويد (${newEval.tajweedGrade === 'EXCELLENT' ? 'ممتاز' : 'جيد جداً'}).`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      const parentUserObj = users.find(u => u.role === 'PARENT' && (student?.parentId === 'p-profile'));
      const notifParent: Notification | null = parentUserObj ? {
        id: `not-${Math.random().toString(36).substring(5)}`,
        userId: parentUserObj.id,
        title: `تقييم جديد للطالب ${studentUser.name}`,
        content: `حصل الطالب ${studentUser.name} على نتيجة ${newEval.score}% في تقييم (${newEval.type === 'EXAM' ? 'اختبار' : 'تسميع يومي'}).`,
        isRead: false,
        createdAt: new Date().toISOString()
      } : null;

      const newNotifs = [notif];
      if (notifParent) newNotifs.push(notifParent);
      
      const updatedNotifs = [...newNotifs, ...notifications];
      setNotifications(updatedNotifs);
      saveState('t_notifications', updatedNotifs);
    }
  };

  const checkoutSubscription = async (planType: string, amount: number) => {
    if (!currentUser) return;
    const endDate = new Date();
    // كلا الباقتين مدتهما شهر (30 يوماً)
    endDate.setDate(endDate.getDate() + 30);
    
    const sub: Subscription = {
      id: `sub-${Math.random().toString(36).substring(5)}`,
      userId: currentUser.id,
      planType,
      status: 'ACTIVE',
      amount,
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      paymentIntentId: `TXN-${Math.random().toString(36).substring(5).toUpperCase()}`
    };

    const updated = [...subscriptions.filter(s => s.userId !== currentUser.id), sub];
    setSubscriptions(updated);
    saveState('t_subscriptions', updated);

    // Send success notification
    const notif: Notification = {
      id: `not-${Math.random().toString(36).substring(5)}`,
      userId: currentUser.id,
      title: 'تم تفعيل الاشتراك بنجاح',
      content: `شكرًا لاشتراككم في ${planType === 'once_weekly' ? 'باقة حصة أسبوعياً' : 'باقة حصتين أسبوعياً'} لـ رحيق القرآن. تم الدفع بنجاح.`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    saveState('t_notifications', updatedNotifs);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    saveState('t_notifications', updated);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loading,
        users,
        studentProfiles,
        teacherProfiles,
        halaqat,
        sessions,
        attendance,
        plans,
        progressLogs,
        evaluations,
        subscriptions,
        notifications,
        applicants,
        
        login,
        register,
        verifyOtp,
        resetPassword,
        confirmReset,
        logout,
        updateProfile,
        
        refreshUsers,
        addUser,
        updateUser,
        deleteUser,
        
        refreshApplicants,
        submitApplication,
        updateApplicantStatus,
        deleteApplicant,
        
        createHalaqa,
        updateHalaqatList,
        enrollInHalaqa,
        createSession,
        submitAttendance,
        createPlan,
        addProgressLog,
        confirmProgressLog,
        deleteProgressLog,
        updateProgressLog,
        addEvaluation,
        checkoutSubscription,
        markNotificationRead,
        
        theme,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
