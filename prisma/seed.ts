// prisma/seed.ts — Seeds the database with demo data

import { PrismaClient, Role, DocumentCategory, FileType, AnnouncementCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin User ──────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@afriklearn.com' },
    update: {},
    create: {
      email: 'admin@afriklearn.com',
      name: 'Admin AfrikLearn',
      password: adminPass,
      role: Role.ADMIN,
      university: 'AfrikLearn HQ',
      isActive: true,
    },
  })

  // ── Student User ────────────────────────────────────────────
  const studentPass = await bcrypt.hash('Student@123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@uy1.cm' },
    update: {},
    create: {
      email: 'student@uy1.cm',
      name: 'Alina Nguetsop',
      password: studentPass,
      role: Role.STUDENT,
      university: 'University of Yaoundé I',
      faculty: 'Faculty of Science',
      level: 'L2',
      isPremium: true,
      premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // ── Demo Documents ──────────────────────────────────────────
  const docs = [
    {
      title: 'Calculus I - Complete Course Notes',
      description: 'Full lecture notes covering limits, derivatives, and integrals.',
      fileUrl: '/demo/calculus-notes.pdf',
      fileType: FileType.PDF,
      fileSize: 2048000,
      category: DocumentCategory.COURSE_MATERIAL,
      school: 'University of Yaoundé I',
      faculty: 'Faculty of Science',
      level: 'L1',
      subject: 'Mathematics',
      isPremium: false,
      isApproved: true,
      tags: ['calculus', 'mathematics', 'L1'],
      uploadedById: admin.id,
    },
    {
      title: 'Linear Algebra Past Paper 2023',
      description: '2023 end-of-year exam with detailed solutions.',
      fileUrl: '/demo/linalg-2023.pdf',
      fileType: FileType.PDF,
      fileSize: 1024000,
      category: DocumentCategory.PAST_PAPER,
      school: 'University of Yaoundé I',
      faculty: 'Faculty of Science',
      level: 'L2',
      subject: 'Mathematics',
      year: 2023,
      hasSolution: true,
      solutionUrl: '/demo/linalg-2023-solution.pdf',
      isPremium: true,
      isApproved: true,
      tags: ['linear algebra', 'past paper', '2023'],
      uploadedById: admin.id,
    },
    {
      title: 'Introduction to Programming (C++)',
      description: 'Beginner guide to C++ programming for CS students.',
      fileUrl: '/demo/cpp-intro.pdf',
      fileType: FileType.PDF,
      fileSize: 3145728,
      category: DocumentCategory.COURSE_MATERIAL,
      school: 'University of Buea',
      faculty: 'Faculty of Engineering',
      level: 'L1',
      subject: 'Computer Science',
      isPremium: false,
      isApproved: true,
      tags: ['programming', 'C++', 'beginners'],
      uploadedById: student.id,
    },
    {
      title: 'Organic Chemistry — Past Papers 2019-2022',
      description: 'Collection of 4 years of organic chemistry papers.',
      fileUrl: '/demo/organic-chem.pdf',
      fileType: FileType.PDF,
      fileSize: 5242880,
      category: DocumentCategory.PAST_PAPER,
      school: 'University of Douala',
      faculty: 'Faculty of Science',
      level: 'L2',
      subject: 'Chemistry',
      year: 2022,
      hasSolution: false,
      isPremium: true,
      isApproved: true,
      tags: ['chemistry', 'organic', 'past papers'],
      uploadedById: admin.id,
    },
  ]

  for (const doc of docs) {
    await prisma.document.create({ data: doc })
  }

  // ── Chat Rooms ──────────────────────────────────────────────
  await prisma.chatRoom.createMany({
    data: [
      { name: '📢 General', description: 'General discussions for all students', roomType: 'GENERAL' },
      { name: '🎓 UY1 Students', description: 'Chat room for UY1 students', roomType: 'SCHOOL', school: 'University of Yaoundé I' },
      { name: '💻 CS Study Group', description: 'Computer Science study group', roomType: 'STUDY_GROUP' },
      { name: '📐 Maths Hub', description: 'Mathematics discussions', roomType: 'STUDY_GROUP' },
    ],
    skipDuplicates: true,
  })

  // ── Announcements ────────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      {
        title: '🏠 Student Housing Available Near UY1',
        content: 'Affordable studio apartments available near University of Yaoundé I campus. Starting from 35,000 XAF/month. Contact: +237 6XX XXX XXX',
        category: AnnouncementCategory.HOUSING,
        school: 'University of Yaoundé I',
        isPinned: true,
        isActive: true,
      },
      {
        title: '💼 Internship: MTN Cameroon — Software Engineer Intern',
        content: 'MTN Cameroon is looking for 3rd year Computer Science students for a 3-month internship in Douala. Apply before July 15, 2025.',
        category: AnnouncementCategory.INTERNSHIP,
        isPinned: false,
        isActive: true,
        externalUrl: 'https://mtn.com/careers',
      },
      {
        title: '🎓 Orange Scholarship 2025 — Apply Now',
        content: 'Orange Foundation is offering 10 scholarships to outstanding students in STEM fields. Deadline: August 1, 2025.',
        category: AnnouncementCategory.SCHOLARSHIP,
        isPinned: true,
        isActive: true,
      },
      {
        title: '📅 End of Year Exams Schedule Released',
        content: 'The 2024/2025 end-of-year examination timetable has been released. Check your faculty notice board or download the PDF.',
        category: AnnouncementCategory.EXAM,
        isPinned: false,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeding complete!')
  console.log('👤 Admin: admin@afriklearn.com / Admin@123')
  console.log('👤 Student: student@uy1.cm / Student@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
