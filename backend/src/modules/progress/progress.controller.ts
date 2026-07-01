import { Router, Response } from 'express';
import prisma from '../../config/db';
import { authenticate, authorize, AuthRequest } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /api/progress/student/{studentId}:
 *   get:
 *     summary: جلب سجل تقدم الطالب وخططه الدراسية
 *     tags: [تتبع التقدم والتقييمات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: خطط الطالب وسجلات تقدمه
 */
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res: Response) => {
  const { studentId } = req.params;
  try {
    const plans = await prisma.memorizationPlan.findMany({
      where: { studentId },
      orderBy: { startDate: 'desc' }
    });

    const logs = await prisma.progressLog.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    });

    const evaluations = await prisma.evaluation.findMany({
      where: { studentId },
      include: { evaluator: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ plans, logs, evaluations });
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب سجلات تقدم الطالب' });
  }
});

/**
 * @swagger
 * /api/progress/logs:
 *   post:
 *     summary: تسجيل ورد تسميع/مراجعة جديد للطالب
 *     tags: [تتبع التقدم والتقييمات]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, surah, startAyah, endAyah, pagesCount, isRevision]
 *             properties:
 *               studentId:
 *                 type: string
 *               planId:
 *                 type: string
 *               surah:
 *                 type: string
 *               startAyah:
 *                 type: integer
 *               endAyah:
 *                 type: integer
 *               pagesCount:
 *                 type: integer
 *               isRevision:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم تسجيل التقدم بنجاح
 */
router.post('/logs', authenticate, async (req: AuthRequest, res: Response) => {
  const { studentId, planId, surah, startAyah, endAyah, pagesCount, isRevision, notes } = req.body;

  if (!studentId || !surah || startAyah === undefined || endAyah === undefined || !pagesCount) {
    return res.status(400).json({ error: 'الرجاء توفير جميع البيانات المطلوبة لتسجيل التقدم' });
  }

  try {
    const log = await prisma.progressLog.create({
      data: {
        studentId,
        planId: planId || null,
        surah,
        startAyah: Number(startAyah),
        endAyah: Number(endAyah),
        pagesCount: Number(pagesCount),
        isRevision: Boolean(isRevision),
        notes
      }
    });

    // Create automatically an in-app notification for the parent (if linked)
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { parent: { include: { user: { select: { id: true } } } }, user: { select: { name: true } } }
    });

    if (studentProfile?.parent?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: studentProfile.parent.user.id,
          title: 'تحديث تقدم الحفظ لأبنائكم',
          content: `أنجز الطالب ${studentProfile.user.name} بنجاح ورد ${isRevision ? 'مراجعة' : 'حفظ'} سورة ${surah} من الآية ${startAyah} إلى ${endAyah}`
        }
      });
    }

    return res.status(201).json(log);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء إضافة سجل التقدم' });
  }
});

/**
 * @swagger
 * /api/progress/plans:
 *   post:
 *     summary: إنشاء خطة حفظ جديدة للطالب (للمعلمين والإدارة)
 *     tags: [تتبع التقدم والتقييمات]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, title, targetSurah, targetAyah, targetJuz, startDate, endDate]
 *             properties:
 *               studentId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetSurah:
 *                 type: string
 *               targetAyah:
 *                 type: integer
 *               targetJuz:
 *                 type: integer
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم إنشاء خطة الحفظ بنجاح
 */
router.post('/plans', authenticate, authorize(['ADMIN', 'TEACHER']), async (req: AuthRequest, res: Response) => {
  const { studentId, title, description, targetSurah, targetAyah, targetJuz, startDate, endDate } = req.body;

  if (!studentId || !title || !targetSurah || !targetAyah || !targetJuz || !startDate || !endDate) {
    return res.status(400).json({ error: 'الرجاء توفير كافة تفاصيل خطة الحفظ' });
  }

  try {
    const plan = await prisma.memorizationPlan.create({
      data: {
        studentId,
        title,
        description,
        targetSurah,
        targetAyah: Number(targetAyah),
        targetJuz: Number(targetJuz),
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    return res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء إنشاء خطة الحفظ' });
  }
});

/**
 * @swagger
 * /api/progress/evaluations:
 *   post:
 *     summary: تسجيل تقييم أو درجة تسميع للطالب (للمعلمين)
 *     tags: [تتبع التقدم والتقييمات]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, score, tajweedGrade, type]
 *             properties:
 *               studentId:
 *                 type: string
 *               score:
 *                 type: integer
 *               mistakesCount:
 *                 type: integer
 *               hesitationsCount:
 *                 type: integer
 *               tajweedGrade:
 *                 type: string
 *                 enum: [EXCELLENT, GOOD, ACCEPTABLE, NEED_WORK]
 *               type:
 *                 type: string
 *                 enum: [DAILY, TEST, EXAM]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم تسجيل التقييم بنجاح
 */
router.post('/evaluations', authenticate, authorize(['ADMIN', 'TEACHER']), async (req: AuthRequest, res: Response) => {
  const { studentId, score, mistakesCount, hesitationsCount, tajweedGrade, type, notes } = req.body;

  if (!studentId || score === undefined || !tajweedGrade || !type) {
    return res.status(400).json({ error: 'الرجاء توفير الطالب، العلامة، تقدير التجويد، ونوع التقييم' });
  }

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: req.user?.id } });
    if (!teacher && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'غير مصرح، يجب أن تكون معلماً معتمداً لتسجيل تقييم' });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId,
        evaluatorId: teacher ? teacher.id : 'ADMIN-BYPASS', // fallback if admin
        score: Number(score),
        mistakesCount: Number(mistakesCount || 0),
        hesitationsCount: Number(hesitationsCount || 0),
        tajweedGrade,
        type,
        notes
      }
    });

    // Auto issue certificates for high grades in Exams
    if (type === 'EXAM' && Number(score) >= 90) {
      // Mock certificate link
      const certId = evaluation.id;
      const certificateUrl = `/api/progress/evaluations/certificates/${certId}`;
      
      await prisma.evaluation.update({
        where: { id: evaluation.id },
        data: { certificateUrl }
      });
      evaluation.certificateUrl = certificateUrl;
    }

    return res.status(201).json(evaluation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء رصد التقييم' });
  }
});

/**
 * @swagger
 * /api/progress/evaluations/certificates/{evaluationId}:
 *   get:
 *     summary: توليد شهادة إتمام للطباعة
 *     tags: [تتبع التقدم والتقييمات]
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ملف الشهادة (توليد HTML/عرض مرئي)
 */
router.get('/evaluations/certificates/:evaluationId', async (req, res) => {
  const { evaluationId } = req.params;

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        student: { include: { user: { select: { name: true } } } },
        evaluator: { include: { user: { select: { name: true } } } }
      }
    });

    if (!evaluation) {
      return res.status(404).send('الشهادة غير موجودة');
    }

    // Render a gorgeous HTML certificate template
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>شهادة إتمام وتفوق</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            background-color: #faf9f6;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .certificate-border {
            border: 15px double #b45309;
            background: #ffffff;
            padding: 40px;
            width: 800px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            position: relative;
            background-image: radial-gradient(circle, #fcfbf7 10%, transparent 11%);
            background-size: 20px 20px;
          }
          .certificate-header {
            font-family: 'Amiri', serif;
            color: #064e3b;
            font-size: 38px;
            margin: 0;
          }
          .logo {
            font-size: 28px;
            color: #b45309;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .title {
            font-size: 22px;
            margin: 20px 0;
            color: #374151;
          }
          .student-name {
            font-size: 32px;
            color: #064e3b;
            font-weight: bold;
            text-decoration: underline;
            margin: 15px 0;
            font-family: 'Amiri', serif;
          }
          .desc {
            font-size: 18px;
            line-height: 1.6;
            color: #4b5563;
            max-width: 600px;
            margin: 0 auto;
          }
          .score {
            font-size: 20px;
            color: #b45309;
            font-weight: bold;
            margin-top: 15px;
          }
          .footer-signs {
            margin-top: 50px;
            display: flex;
            justify-content: space-around;
          }
          .sign-box {
            border-top: 1px solid #d1d5db;
            padding-top: 10px;
            width: 200px;
            font-size: 16px;
            color: #6b7280;
          }
          .button-print {
            position: absolute;
            top: 20px;
            left: 20px;
            background-color: #064e3b;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Cairo', sans-serif;
          }
          @media print {
            .button-print {
              display: none;
            }
            body {
              background-color: white;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-border">
          <button class="button-print" onclick="window.print()">طباعة الشهادة</button>
          <div class="logo">منصة تحفيظ القرآن الكريم</div>
          <h1 class="certificate-header">شهادة إتمام وتفوّق</h1>
          <p class="title">يسر إدارة المنصة أن تمنح هذه الشهادة للطالب المتميز:</p>
          <div class="student-name">${evaluation.student.user.name}</div>
          <p class="desc">
            وذلك نظير تفوقه واجتهاده في تسميع واختبارات كتاب الله الكريم وحفظه بالقراءات، وحصوله على تقدير ممتاز وتجويد من رتبة (${evaluation.tajweedGrade === 'EXCELLENT' ? 'ممتاز' : 'جيد جداً'}) على منهج الأزهر الشريف والمدرسة المصرية العريقة في التلاوة.
          </p>
          <div class="score">الدرجة النهائية: %${evaluation.score}</div>
          
          <div class="footer-signs">
            <div class="sign-box">
              توقيع المعلم<br/>
              <strong>الشيخ / ${evaluation.evaluator.user?.name || 'مصحح الحلقة'}</strong>
            </div>
            <div class="sign-box">
              ختم المنصة<br/>
              <strong>إدارة منصة تحفيظ</strong>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).send('حدث خطأ أثناء إنشاء الشهادة');
  }
});

export default router;
