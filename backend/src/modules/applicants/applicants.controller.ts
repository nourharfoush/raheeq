import { Router, Request, Response } from 'express';
import prisma from '../../config/db';
import { authenticate, authorize, AuthRequest } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/applicants:
 *   post:
 *     summary: تقديم طلب تسجيل جديد بالمنصة
 *     tags: [المتقدمين]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - nationalId
 *               - country
 *               - packageName
 *               - whatsapp
 *             properties:
 *               name:
 *                 type: string
 *               nationalId:
 *                 type: string
 *               country:
 *                 type: string
 *               email:
 *                 type: string
 *               packageName:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *               siblings:
 *                 type: string
 *               isMemorized:
 *                 type: boolean
 *               memorizedSurahs:
 *                 type: string
 *               memorizeStart:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم تسجيل الطلب بنجاح
 */
router.post('/', async (req: Request, res: Response) => {
  const {
    name, nationalId, country, email, packageName, whatsapp,
    siblings, isMemorized, memorizedSurahs, memorizeStart
  } = req.body;

  if (!name || !nationalId || !country || !packageName || !whatsapp) {
    return res.status(400).json({ error: 'الرجاء إدخال جميع البيانات المطلوبة' });
  }

  try {
    const newApplicant = await prisma.applicant.create({
      data: {
        name,
        nationalId,
        country,
        email: email || null,
        packageName,
        whatsapp,
        siblings: siblings || null,
        isMemorized: !!isMemorized,
        memorizedSurahs: memorizedSurahs || null,
        memorizeStart: memorizeStart || null,
        status: 'PENDING'
      }
    });
    return res.status(201).json(newApplicant);
  } catch (error: any) {
    console.error('Error creating applicant:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء حفظ طلب التقديم الخاص بك' });
  }
});

/**
 * @swagger
 * /api/applicants:
 *   get:
 *     summary: جلب كافة طلبات التسجيل (مسؤول فقط)
 *     tags: [المتقدمين]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة طلبات التقديم
 */
router.get('/', authenticate, authorize(['ADMIN']), async (_req: AuthRequest, res: Response) => {
  try {
    const applicants = await prisma.applicant.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(applicants);
  } catch (error: any) {
    console.error('Error fetching applicants:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب قائمة المتقدمين' });
  }
});

/**
 * @swagger
 * /api/applicants/{id}/status:
 *   put:
 *     summary: تحديث حالة الطلب (مسؤول فقط)
 *     tags: [المتقدمين]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: تم التحديث بنجاح
 */
router.put('/:id/status', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'حالة الطلب غير صالحة' });
  }

  try {
    const updated = await prisma.applicant.update({
      where: { id },
      data: { status }
    });
    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating applicant status:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تحديث حالة الطلب' });
  }
});

/**
 * @swagger
 * /api/applicants/{id}:
 *   delete:
 *     summary: حذف طلب تسجيل (مسؤول فقط)
 *     tags: [المتقدمين]
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
 *         description: تم الحذف بنجاح
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.applicant.delete({
      where: { id }
    });
    return res.status(200).json({ message: 'تم حذف طلب المتقدم بنجاح' });
  } catch (error: any) {
    console.error('Error deleting applicant:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء حذف طلب المتقدم' });
  }
});

export default router;
