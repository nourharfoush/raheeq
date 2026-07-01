import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { authenticate, authorize, AuthRequest } from '../../middlewares/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tahfez-secret-key-change-in-prod';

// Mock OTP storage in memory (for development)
const otpStore: Record<string, { otp: string; expires: number; tempUserData?: any }> = {};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: تسجيل حساب جديد
 *     tags: [المصادقة]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, role]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, TEACHER, PARENT, ADMIN]
 *               parentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم إرسال رمز التحقق OTP بنجاح
 *       400:
 *         description: خطأ في البيانات المرسلة أو البريد الإلكتروني مسجل مسبقاً
 */
router.post('/register', async (req, res) => {
  const { email, password, name, phone, role, parentId } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'الرجاء تعبئة جميع الحقول المطلوبة (البريد الإلكتروني، كلمة المرور، الاسم، الدور)' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل لدينا' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Send a mock OTP (valid for 5 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;

    otpStore[email] = {
      otp,
      expires,
      tempUserData: { email, passwordHash, name, phone, role, parentId }
    };

    console.log(`[DEVELOPMENT OTP] Code for ${email} is: ${otp}`);

    return res.status(200).json({
      message: 'تم إرسال رمز التحقق (OTP) بنجاح لبريدك الإلكتروني (تجريبياً: يرجى مراجعة كونسول الباك إند لرؤية الرمز)',
      email,
      otp, // Returned in dev mode for easy frontend testing
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء محاولة التسجيل' });
  }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: التحقق من رمز OTP وإتمام التسجيل
 *     tags: [المصادقة]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم تسجيل الحساب وتنشيطه بنجاح
 *       400:
 *         description: الرمز غير صحيح أو منتهي الصلاحية
 */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'الرجاء توفير البريد الإلكتروني ورمز التحقق' });
  }

  const stored = otpStore[email];
  if (!stored) {
    return res.status(400).json({ error: 'لا يوجد طلب تحقق نشط لهذا البريد الإلكتروني' });
  }

  if (Date.now() > stored.expires) {
    delete otpStore[email];
    return res.status(400).json({ error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد' });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ error: 'رمز التحقق الذي أدخلته غير صحيح' });
  }

  const { passwordHash, name, phone, role, parentId } = stored.tempUserData;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role
      }
    });

    // Create role-specific profiles
    if (role === 'STUDENT') {
      let finalParentId = null;
      if (parentId) {
        const parent = await prisma.parentProfile.findFirst({ where: { user: { email: parentId } } });
        if (parent) finalParentId = parent.id;
      }
      await prisma.studentProfile.create({
        data: { userId: user.id, parentId: finalParentId }
      });
    } else if (role === 'PARENT') {
      await prisma.parentProfile.create({
        data: { userId: user.id }
      });
    } else if (role === 'TEACHER') {
      await prisma.teacherProfile.create({
        data: { userId: user.id, bio: 'معلم قرآن كريم معتمد' }
      });
    }

    // Auto delete from store
    delete otpStore[email];

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'تم تفعيل الحساب وإنشاؤه بنجاح!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تهيئة الحساب' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: تسجيل الدخول للمنصة
 *     tags: [المصادقة]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح مع إرجاع التوكن
 *       401:
 *         description: بيانات الاعتماد غير صحيحة
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب غير مفعل' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: استرجاع الملف الشخصي للمستخدم الحالي
 *     tags: [المصادقة]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تفاصيل الملف الشخصي
 */
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: {
          include: {
            parent: { include: { user: { select: { name: true, email: true } } } }
          }
        },
        parentProfile: {
          include: {
            children: { include: { user: { select: { id: true, name: true, email: true } } } }
          }
        },
        teacherProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    // Hide password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الملف الشخصي' });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: تحديث بيانات الملف الشخصي
 *     tags: [المصادقة]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم تحديث الملف الشخصي بنجاح
 */
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });

  const { name, phone, avatarUrl, bio } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
        avatarUrl
      }
    });

    if (req.user.role === 'TEACHER' && bio) {
      await prisma.teacherProfile.update({
        where: { userId: req.user.id },
        data: { bio }
      });
    }

    return res.status(200).json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تحديث بيانات الملف الشخصي' });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: طلب استرجاع كلمة المرور
 *     tags: [المصادقة]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم إرسال الرمز بنجاح
 */
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'الرجاء توفير البريد الإلكتروني' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Avoid enum user existence for security
      return res.status(200).json({ message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فقد أرسلنا رمز إعادة التعيين إليه' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      tempUserData: { email, reset: true }
    };

    console.log(`[DEVELOPMENT RESET OTP] Code for ${email} is: ${otp}`);

    return res.status(200).json({
      message: 'تم إرسال رمز إعادة تعيين كلمة المرور بنجاح لبريدك الإلكتروني (تجريبياً: يرجى مراجعة كونسول الباك إند لرؤية الرمز)',
      email,
      otp, // Returned in dev mode for easy frontend testing
    });
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
});

/**
 * @swagger
 * /api/auth/confirm-reset:
 *   post:
 *     summary: تأكيد رمز الاسترجاع وتعيين كلمة مرور جديدة
 *     tags: [المصادقة]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم تعيين كلمة المرور بنجاح
 */
router.post('/confirm-reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'الرجاء تعبئة جميع الحقول المطلوبة' });
  }

  const stored = otpStore[email];
  if (!stored || !stored.tempUserData.reset) {
    return res.status(400).json({ error: 'لا يوجد طلب استعادة نشط لهذا البريد الإلكتروني' });
  }

  if (Date.now() > stored.expires) {
    delete otpStore[email];
    return res.status(400).json({ error: 'انتهت صلاحية الرمز' });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ error: 'الرمز غير صحيح' });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    delete otpStore[email];
    return res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن' });
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء تحديث كلمة المرور' });
  }
});

// ─── ADMIN USER MANAGEMENT CRUD ENDPOINTS ─────────────────────────────────────

// Get all users
router.get('/users', authenticate, authorize(['ADMIN']), async (_req: AuthRequest, res: Response) => {
  try {
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب قائمة المستخدمين' });
  }
});

// Create new user
router.post('/users', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const { email, password, name, phone, role, isActive } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'الرجاء تعبئة الحقول المطلوبة (البريد، كلمة المرور، الاسم، الدور)' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    // Create role profile
    if (role === 'STUDENT') {
      await prisma.studentProfile.create({ data: { userId: newUser.id } });
    } else if (role === 'TEACHER') {
      await prisma.teacherProfile.create({ data: { userId: newUser.id, bio: 'معلم قرآن كريم' } });
    } else if (role === 'PARENT') {
      await prisma.parentProfile.create({ data: { userId: newUser.id } });
    }

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء إضافة المستخدم' });
  }
});

// Update user details or toggle active status
router.put('/users/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { email, password, name, phone, role, isActive } = req.body;
  try {
    const dataToUpdate: any = {};
    if (email) dataToUpdate.email = email;
    if (name) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (role) dataToUpdate.role = role;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }
    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });
    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تعديل بيانات المستخدم' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id }
    });
    return res.status(200).json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء حذف المستخدم' });
  }
});

export default router;
