import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash standard password for all users
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tahfez.com' },
    update: {},
    create: {
      email: 'admin@tahfez.com',
      passwordHash,
      name: 'عبد الله العتيبي (المدير)',
      phone: '0500000001',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    }
  });
  console.log(`- Admin created: ${admin.email}`);

  // 2. Create Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@tahfez.com' },
    update: {},
    create: {
      email: 'teacher@tahfez.com',
      passwordHash,
      name: 'الشيخ عبد الرحمن محمد',
      phone: '0500000002',
      role: 'TEACHER',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
    }
  });

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      bio: 'إجازة في القراءات العشر، خبرة 10 سنوات في تعليم التجويد والتحفيظ.'
    }
  });
  console.log(`- Teacher profile created for: ${teacherUser.email}`);

  // 3. Create Parent
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@tahfez.com' },
    update: {},
    create: {
      email: 'parent@tahfez.com',
      passwordHash,
      name: 'أحمد الحارثي (ولي أمر)',
      phone: '0500000003',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  });

  const parentProfile = await prisma.parentProfile.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: { userId: parentUser.id }
  });
  console.log(`- Parent profile created for: ${parentUser.email}`);

  // 4. Create Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@tahfez.com' },
    update: {},
    create: {
      email: 'student@tahfez.com',
      passwordHash,
      name: 'يوسف أحمد الحارثي',
      phone: '0500000004',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150'
    }
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      parentId: parentProfile.id
    }
  });
  console.log(`- Student profile created and linked to parent: ${studentUser.email}`);

  // 5. Create Halaqa (Group)
  const groupHalaqa = await prisma.halaqa.create({
    data: {
      name: 'حلقة الهمم العالية (حفظ سورة البقرة)',
      description: 'حلقة جماعية مخصصة لحفظ وضبط سورة البقرة مع أحكام التجويد الأساسية، ثلاثة أيام في الأسبوع.',
      type: 'GROUP',
      capacity: 15,
      schedule: [
        { day: 'السبت', time: '16:00' },
        { day: 'الإثنين', time: '16:00' },
        { day: 'الأربعاء', time: '16:00' }
      ],
      teacherId: teacherProfile.id
    }
  });

  // Enroll Student in Halaqa
  await prisma.halaqaStudent.upsert({
    where: {
      halaqaId_studentId: {
        halaqaId: groupHalaqa.id,
        studentId: studentProfile.id
      }
    },
    update: {},
    create: {
      halaqaId: groupHalaqa.id,
      studentId: studentProfile.id
    }
  });
  console.log(`- Group Halaqa created: "${groupHalaqa.name}" and student enrolled`);

  // 6. Schedule Live Class Sessions
  const today = new Date();
  const session1Start = new Date(today);
  session1Start.setHours(16, 0, 0, 0);
  const session1End = new Date(today);
  session1End.setHours(17, 30, 0, 0);

  const session = await prisma.session.create({
    data: {
      halaqaId: groupHalaqa.id,
      title: 'الحصة التفاعلية الأولى: أحكام النون الساكنة والتنوين وتسميع الآيات (1-20)',
      description: 'شرح نظري وتسميع عملي للآيات العشرين الأولى من سورة البقرة.',
      startTime: session1Start,
      endTime: session1End,
      status: 'SCHEDULED',
      liveUrl: 'https://meet.jit.si/TahfezRoom-GroupHalaqa-1'
    }
  });

  // Create attendance log for student
  await prisma.attendance.create({
    data: {
      sessionId: session.id,
      studentId: studentProfile.id,
      status: 'PRESENT',
      notes: 'ممتاز وحضر في الوقت تماماً'
    }
  });
  console.log(`- Class session scheduled with attendance record.`);

  // 7. Create Memorization Plan
  const planStart = new Date();
  const planEnd = new Date();
  planEnd.setMonth(planEnd.getMonth() + 2); // 2 months target

  const plan = await prisma.memorizationPlan.create({
    data: {
      studentId: studentProfile.id,
      title: 'خطة حفظ الجزء الأول من سورة البقرة',
      description: 'حفظ الصفحات من 2 إلى 21 بمعدل صفحة يومياً مع المراجعة المستمرة.',
      targetSurah: 'البقرة',
      targetAyah: 141,
      targetJuz: 1,
      startDate: planStart,
      endDate: planEnd,
      status: 'ACTIVE'
    }
  });

  // 8. Create some Progress Logs
  await prisma.progressLog.createMany({
    data: [
      {
        studentId: studentProfile.id,
        planId: plan.id,
        surah: 'البقرة',
        startAyah: 1,
        endAyah: 5,
        pagesCount: 1,
        isRevision: false,
        notes: 'حفظ متقن ومخارج حروف ممتازة'
      },
      {
        studentId: studentProfile.id,
        planId: plan.id,
        surah: 'البقرة',
        startAyah: 6,
        endAyah: 16,
        pagesCount: 1,
        isRevision: false,
        notes: 'مخارج الحروف جيدة جداً، مع تكرار خفيف في المد المنفصل'
      },
      {
        studentId: studentProfile.id,
        planId: plan.id,
        surah: 'البقرة',
        startAyah: 1,
        endAyah: 5,
        pagesCount: 1,
        isRevision: true,
        notes: 'مراجعة وتسميع سريع وممتاز'
      }
    ]
  });

  // 9. Create an Evaluation & Certificate
  const evaluation = await prisma.evaluation.create({
    data: {
      studentId: studentProfile.id,
      evaluatorId: teacherProfile.id,
      score: 95,
      mistakesCount: 1,
      hesitationsCount: 2,
      tajweedGrade: 'EXCELLENT',
      type: 'EXAM',
      notes: 'تسميع متميز جداً للجزء الأول من سورة البقرة، ومخارج وضبط رائع للأحكام.'
    }
  });

  // Mock certificate generation
  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data: { certificateUrl: `/api/progress/evaluations/certificates/${evaluation.id}` }
  });

  // 10. Create In-App Notification
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser.id,
        title: 'تمت جدولة حصة جديدة',
        content: `تمت إضافة حصة جديدة في حلقة "حلقة الهمم العالية" اليوم الساعة 4:00 مساءً.`
      },
      {
        userId: parentUser.id,
        title: 'تقرير تسميع يوسف',
        content: `حصل يوسف على درجة 95% في التقييم الأخير لسورة البقرة. تم إصدار شهادة تفوق.`
      }
    ]
  });

  // 11. Create Subscriptions
  const subStart = new Date();
  const subEnd = new Date();
  subEnd.setMonth(subEnd.getMonth() + 1);

  await prisma.subscription.create({
    data: {
      userId: parentUser.id, // Parent pays for subscription
      planType: 'monthly',
      status: 'ACTIVE',
      amount: 199.00,
      startDate: subStart,
      endDate: subEnd,
      paymentIntentId: 'MOCK_TXN_SEED_12345'
    }
  });

  console.log('🌱 Seed complete! Demo login credentials:');
  console.log('  1. مدير: admin@tahfez.com / password123');
  console.log('  2. معلم: teacher@tahfez.com / password123');
  console.log('  3. ولي أمر: parent@tahfez.com / password123');
  console.log('  4. طالب: student@tahfez.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
