import { Router, Response } from 'express';
import prisma from '../../config/db';
import { authenticate, authorize, AuthRequest } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/halaqat:
 *   get:
 *     summary: جلب قائمة الحلقات
 *     tags: [الحلقات الدراسية]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الحلقات
 */
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const halaqat = await prisma.halaqa.findMany({
      include: {
        teacher: { include: { user: { select: { name: true, avatarUrl: true } } } },
        _count: { select: { students: true } }
      }
    });
    return res.status(200).json(halaqat);
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب الحلقات' });
  }
});

/**
 * @swagger
 * /api/halaqat/my:
 *   get:
 *     summary: جلب الحلقات الخاصة بالمستخدم الحالي حسب دوره
 *     tags: [الحلقات الدراسية]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة حلقات المستخدم الحالي
 */
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });

  try {
    const { id, role } = req.user;

    if (role === 'ADMIN') {
      const all = await prisma.halaqa.findMany({
        include: {
          teacher: { include: { user: { select: { name: true } } } },
          _count: { select: { students: true } }
        }
      });
      return res.status(200).json(all);
    }

    if (role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: id } });
      if (!teacher) return res.status(404).json({ error: 'ملف المعلم غير موجود' });

      const halaqat = await prisma.halaqa.findMany({
        where: { teacherId: teacher.id },
        include: {
          _count: { select: { students: true } }
        }
      });
      return res.status(200).json(halaqat);
    }

    if (role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({ where: { userId: id } });
      if (!student) return res.status(404).json({ error: 'ملف الطالب غير موجود' });

      const enrolled = await prisma.halaqaStudent.findMany({
        where: { studentId: student.id },
        include: {
          halaqa: {
            include: {
              teacher: { include: { user: { select: { name: true, avatarUrl: true } } } }
            }
          }
        }
      });
      return res.status(200).json(enrolled.map(e => e.halaqa));
    }

    if (role === 'PARENT') {
      const parent = await prisma.parentProfile.findUnique({
        where: { userId: id },
        include: { children: { select: { id: true, userId: true } } }
      });
      if (!parent) return res.status(404).json({ error: 'ملف ولي الأمر غير موجود' });

      const childrenIds = parent.children.map(c => c.id);
      const enrolled = await prisma.halaqaStudent.findMany({
        where: { studentId: { in: childrenIds } },
        include: {
          halaqa: {
            include: {
              teacher: { include: { user: { select: { name: true } } } }
            }
          },
          student: { include: { user: { select: { name: true } } } }
        }
      });
      return res.status(200).json(enrolled);
    }

    return res.status(400).json({ error: 'دور مستخدم غير معروف' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب حلقاتك' });
  }
});

/**
 * @swagger
 * /api/halaqat:
 *   post:
 *     summary: إنشاء حلقة جديدة (للإدارة والمعلمين)
 *     tags: [الحلقات الدراسية]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, capacity, type, schedule, teacherId]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [INDIVIDUAL, GROUP]
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *               teacherId:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم إنشاء الحلقة بنجاح
 */
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), async (req: AuthRequest, res: Response) => {
  const { name, description, capacity, type, schedule, teacherId } = req.body;

  if (!name || !capacity || !type || !schedule || !teacherId) {
    return res.status(400).json({ error: 'الرجاء توفير جميع البيانات المطلوبة لإنشاء الحلقة' });
  }

  try {
    let finalTeacherId = teacherId;
    
    // If user is a teacher, force their own teacher profile ID
    if (req.user?.role === 'TEACHER') {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: req.user.id } });
      if (!teacher) return res.status(403).json({ error: 'غير مصرح لك، حسابك لا يملك صلاحيات معلم مفعل' });
      finalTeacherId = teacher.id;
    }

    const halaqa = await prisma.halaqa.create({
      data: {
        name,
        description,
        capacity: Number(capacity),
        type,
        schedule,
        teacherId: finalTeacherId
      }
    });

    return res.status(201).json(halaqa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحلقة' });
  }
});

/**
 * @swagger
 * /api/halaqat/{id}/enroll:
 *   post:
 *     summary: تسجيل طالب في حلقة
 *     tags: [الحلقات الدراسية]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId]
 *             properties:
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم تسجيل الطالب في الحلقة بنجاح
 */
router.post('/:id/enroll', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // Halaqa ID
  const { studentId } = req.body; // Student Profile ID or User Email

  try {
    // Check if Halaqa exists
    const halaqa = await prisma.halaqa.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } }
    });
    if (!halaqa) return res.status(404).json({ error: 'الحلقة غير موجودة' });

    // Check capacity
    if (halaqa._count.students >= halaqa.capacity) {
      return res.status(400).json({ error: 'عذراً، هذه الحلقة وصلت للحد الأقصى من السعة الاستيعابية' });
    }

    // Resolve Student ID
    let targetStudentId = studentId;
    if (!studentId && req.user?.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (student) targetStudentId = student.id;
    } else if (studentId && !studentId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      // If student ID is username (not a UUID), find profile
      const studentUser = await prisma.user.findUnique({
        where: { username: studentId },
        include: { studentProfile: true }
      });
      if (studentUser?.studentProfile) targetStudentId = studentUser.studentProfile.id;
    }

    if (!targetStudentId) {
      return res.status(400).json({ error: 'الرجاء توفير رقم تعريف الطالب بشكل صحيح' });
    }

    // Check enrollment
    const existing = await prisma.halaqaStudent.findUnique({
      where: { halaqaId_studentId: { halaqaId: id, studentId: targetStudentId } }
    });
    if (existing) {
      return res.status(400).json({ error: 'الطالب مسجل بالفعل في هذه الحلقة' });
    }

    const enrollment = await prisma.halaqaStudent.create({
      data: {
        halaqaId: id,
        studentId: targetStudentId
      }
    });

    return res.status(200).json({ message: 'تم تسجيل الطالب في الحلقة بنجاح', enrollment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء محاولة التسجيل في الحلقة' });
  }
});

/**
 * @swagger
 * /api/halaqat/{id}/sessions:
 *   post:
 *     summary: جدولة حصة جديدة في الحلقة (للمعلمين والإدارة)
 *     tags: [الحصص المباشرة والجدولة]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startTime, endTime]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم جدولة الحصة بنجاح
 */
router.post('/:id/sessions', authenticate, authorize(['ADMIN', 'TEACHER']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, startTime, endTime } = req.body;

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ error: 'الرجاء توفير العنوان وتاريخ ووقت البدء والانتهاء' });
  }

  try {
    const halaqa = await prisma.halaqa.findUnique({ where: { id } });
    if (!halaqa) return res.status(404).json({ error: 'الحلقة غير موجودة' });

    // Format safe room name for Jitsi using Halaqa name and random hash
    const safeRoomName = `TahfezRoom-${id.slice(0, 8)}-${Date.now().toString().slice(-4)}`;
    const liveUrl = `https://meet.jit.si/${safeRoomName}`;

    const session = await prisma.session.create({
      data: {
        halaqaId: id,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        liveUrl
      }
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جدولة الحصة' });
  }
});

/**
 * @swagger
 * /api/halaqat/{id}/sessions:
 *   get:
 *     summary: جلب الحصص المجدولة للحلقة
 *     tags: [الحصص المباشرة والجدولة]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: قائمة الحصص
 */
router.get('/:id/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const sessions = await prisma.session.findMany({
      where: { halaqaId: id },
      orderBy: { startTime: 'asc' }
    });
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب الحصص' });
  }
});

/**
 * @swagger
 * /api/halaqat/sessions/{sessionId}/attendance:
 *   post:
 *     summary: تسجيل حضور الحصة (للمعلمين)
 *     tags: [الحصص المباشرة والجدولة]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [records]
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [studentId, status]
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT, LATE]
 *                     notes:
 *                       type: string
 *     responses:
 *       200:
 *         description: تم تسجيل الحضور بنجاح
 */
router.post('/sessions/:sessionId/attendance', authenticate, authorize(['ADMIN', 'TEACHER']), async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { records } = req.body; // [{ studentId, status, notes }]

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'بيانات الحضور غير صالحة' });
  }

  try {
    const operations = records.map(record =>
      prisma.attendance.upsert({
        where: { sessionId_studentId: { sessionId, studentId: record.studentId } },
        update: { status: record.status, notes: record.notes },
        create: {
          sessionId,
          studentId: record.studentId,
          status: record.status,
          notes: record.notes
        }
      })
    );

    await Promise.all(operations);
    return res.status(200).json({ message: 'تم حفظ سجل حضور الحصة بنجاح' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء حفظ كشف الحضور والغياب' });
  }
});

export default router;
