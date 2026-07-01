import { Router, Response } from 'express';
import prisma from '../../config/db';
import { authenticate, AuthRequest } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: جلب إشعارات المستخدم الحالي
 *     tags: [الإشعارات]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الإشعارات
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب الإشعارات' });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: تعليم الإشعار كمقروء
 *     tags: [الإشعارات]
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
 *         description: تم تحديث حالة الإشعار بنجاح
 */
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء تحديث حالة الإشعار' });
  }
});

export default router;
