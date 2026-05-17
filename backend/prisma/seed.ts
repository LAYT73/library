import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@library.test',
      password: hashedPassword,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Create librarian user
  const librarianPassword = await bcrypt.hash('librarian123', 10);
  const librarian = await prisma.user.create({
    data: {
      email: 'librarian@library.test',
      password: librarianPassword,
      fullName: 'Librarian User',
      role: UserRole.LIBRARIAN,
      isActive: true,
    },
  });

  // Create department head user
  const headPassword = await bcrypt.hash('head123', 10);
  const deptHead = await prisma.user.create({
    data: {
      email: 'head@library.test',
      password: headPassword,
      fullName: 'Department Head',
      role: UserRole.DEPARTMENT_HEAD,
      department: 'Math',
      isActive: true,
    },
  });

  console.log('Seed data created:', { admin, librarian, deptHead });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
