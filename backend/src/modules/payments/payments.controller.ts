import { Router, Response } from 'express';
import prisma from '../../config/db';
import { authenticate, AuthRequest } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: جلب الاشتراكات الخاصة بالمستخدم
 *     tags: [الاشتراكات والمدفوعات]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الاشتراكات
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(subscriptions);
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب الاشتراكات' });
  }
});

/**
 * @swagger
 * /api/subscriptions/checkout:
 *   post:
 *     summary: إنشاء عملية دفع واشتراك تجريبية
 *     tags: [الاشتراكات والمدفوعات]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planType, amount]
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [monthly, quarterly]
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: تم الاشتراك وتفعيل الخطة بنجاح
 */
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح' });
  const { planType, amount } = req.body;

  if (!planType || !amount) {
    return res.status(400).json({ error: 'الرجاء تحديد نوع الخطة والمبلغ المراد سداده' });
  }

  try {
    const startDate = new Date();
    const endDate = new Date();
    
    if (planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planType === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        planType,
        amount: Number(amount),
        startDate,
        endDate,
        status: 'ACTIVE',
        paymentIntentId: `MOCK_TXN_${Math.random().toString(36).substring(7).toUpperCase()}`
      }
    });

    // Create a notification for subscription success
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'تم تفعيل الاشتراك بنجاح',
        content: `شكرًا لثقتكم بنا. تم تفعيل اشتراككم في الخطة (${planType === 'monthly' ? 'الشهرية' : 'الربع سنوية'}) بنجاح وصالح لغاية ${endDate.toLocaleDateString('ar-EG')}`
      }
    });

    return res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة عملية الدفع والاشتراك' });
  }
});

export default router;
