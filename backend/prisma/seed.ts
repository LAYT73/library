import {
  PrismaClient,
  UserRole,
  CopyStatus,
  PurchaseRequestStatus,
  OrderStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.writeOffItem.deleteMany();
  await prisma.writeOff.deleteMany();
  await prisma.copy.deleteMany();
  await prisma.donationItem.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.acquisition.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.disciplineAssignment.deleteMany();
  await prisma.knowledgeAreaBook.deleteMany();
  await prisma.coverage.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.knowledgeArea.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.studentGroup.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearDatabase();

  const password = await bcrypt.hash('admin123', 10);
  const librarianPassword = await bcrypt.hash('librarian123', 10);
  const headPassword = await bcrypt.hash('head123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@library.test',
      password,
      fullName: 'Администратор',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'librarian@library.test',
      password: librarianPassword,
      fullName: 'Библиотекарь',
      role: UserRole.LIBRARIAN,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'head@library.test',
      password: headPassword,
      fullName: 'Зав. кафедрой',
      role: UserRole.DEPARTMENT_HEAD,
      department: 'Кафедра информатики',
      isActive: true,
    },
  });

  const areas = await Promise.all(
    ['Математика', 'Информатика', 'Физика', 'Экономика'].map((name) =>
      prisma.knowledgeArea.create({ data: { name } }),
    ),
  );

  const authors = await Promise.all(
    [
      'Кормен Т.',
      'Седжвик Р.',
      'Брукс Ф.',
      'Дональд Кнут',
      'Таненбаум Э.',
    ].map((fullName) => prisma.author.create({ data: { fullName } })),
  );

  const books = await Promise.all([
    prisma.book.create({
      data: {
        isbn: '978-5-84535-342-0',
        title: 'Алгоритмы: построение и анализ',
        publisher: 'Вильямс',
        year: 2019,
        authorId: authors[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-5-496-00440-7',
        title: 'Современные операционные системы',
        publisher: 'Питер',
        year: 2021,
        authorId: authors[4].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-5-4461-0200-5',
        title: 'Искусство программирования. Том 1',
        publisher: 'Вильямс',
        year: 2020,
        authorId: authors[3].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-5-990574-32-1',
        title: 'Чистый код',
        publisher: 'Питер',
        year: 2022,
        authorId: authors[2].id,
      },
    }),
  ]);

  await prisma.knowledgeAreaBook.createMany({
    data: [
      { knowledgeAreaId: areas[0].id, bookId: books[0].id },
      { knowledgeAreaId: areas[1].id, bookId: books[0].id },
      { knowledgeAreaId: areas[1].id, bookId: books[1].id },
      { knowledgeAreaId: areas[1].id, bookId: books[2].id },
      { knowledgeAreaId: areas[1].id, bookId: books[3].id },
    ],
  });

  const disciplines = await Promise.all([
    prisma.discipline.create({
      data: { name: 'Алгоритмы и структуры данных', department: 'Кафедра информатики' },
    }),
    prisma.discipline.create({
      data: { name: 'Операционные системы', department: 'Кафедра информатики' },
    }),
    prisma.discipline.create({
      data: { name: 'Математический анализ', department: 'Кафедра математики' },
    }),
  ]);

  const groups = await Promise.all([
    prisma.studentGroup.create({ data: { name: 'ИВТ-21', studentCount: 28 } }),
    prisma.studentGroup.create({ data: { name: 'ИВТ-22', studentCount: 25 } }),
    prisma.studentGroup.create({ data: { name: 'ПМИ-21', studentCount: 22 } }),
  ]);

  await prisma.disciplineAssignment.createMany({
    data: [
      { disciplineId: disciplines[0].id, studentGroupId: groups[0].id },
      { disciplineId: disciplines[0].id, studentGroupId: groups[1].id },
      { disciplineId: disciplines[1].id, studentGroupId: groups[0].id },
      { disciplineId: disciplines[2].id, studentGroupId: groups[2].id },
    ],
  });

  await prisma.coverage.createMany({
    data: [
      { disciplineId: disciplines[0].id, bookId: books[0].id, requiredCount: 15 },
      { disciplineId: disciplines[0].id, bookId: books[3].id, requiredCount: 10 },
      { disciplineId: disciplines[1].id, bookId: books[1].id, requiredCount: 12 },
      { disciplineId: disciplines[2].id, bookId: books[0].id, requiredCount: 8 },
    ],
  });

  const supplier = await prisma.supplier.create({
    data: {
      name: 'ООО «Академкнига»',
      contactInfo: 'books@academ.ru, +7 (495) 000-00-00',
    },
  });

  await prisma.supplier.create({
    data: {
      name: 'Издательский дом «Лань»',
      contactInfo: 'order@lanbook.ru',
    },
  });

  const pr = await prisma.purchaseRequest.create({
    data: {
      status: PurchaseRequestStatus.APPROVED,
      items: {
        create: [{ bookId: books[0].id, quantity: 5 }, { bookId: books[1].id, quantity: 3 }],
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      supplierId: supplier.id,
      purchaseRequestId: pr.id,
      status: OrderStatus.SENT,
      expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { bookId: books[0].id, quantity: 5 },
          { bookId: books[1].id, quantity: 3 },
        ],
      },
    },
  });

  const acquisition = await prisma.acquisition.create({
    data: {
      supplierId: supplier.id,
      orderId: order.id,
      totalCost: 42500.5,
    },
  });

  let inv = 1000;
  const copyData: Array<{
    inventoryNumber: number;
    status: CopyStatus;
    bookId: number;
    acquisitionId?: number;
  }> = [];

  for (const book of books) {
    const count = book.id <= 2 ? 4 : 2;
    for (let i = 0; i < count; i++) {
      inv += 1;
      copyData.push({
        inventoryNumber: inv,
        status: CopyStatus.AVAILABLE,
        bookId: book.id,
        acquisitionId: book.id <= 2 ? acquisition.id : undefined,
      });
    }
  }

  await prisma.copy.createMany({ data: copyData });

  const donation = await prisma.donation.create({
    data: {
      donorName: 'Альма-матер (выпускники)',
      items: {
        create: [{ bookId: books[3].id, quantity: 2 }],
      },
    },
  });

  for (let i = 0; i < 2; i++) {
    inv += 1;
    await prisma.copy.create({
      data: {
        inventoryNumber: inv,
        status: CopyStatus.AVAILABLE,
        bookId: books[3].id,
      },
    });
  }
  void donation;

  const wornCopy = await prisma.copy.findFirst({ where: { bookId: books[2].id } });
  if (wornCopy) {
    await prisma.writeOff.create({
      data: {
        reason: 'Ветхое издание, непригодно к выдаче',
        items: { create: [{ copyId: wornCopy.id }] },
      },
    });
    await prisma.copy.update({
      where: { id: wornCopy.id },
      data: { status: CopyStatus.WRITTEN_OFF },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'seed',
      entity: 'System',
      entityId: 'init',
      changes: { message: 'Demo data loaded' },
    },
  });

  console.log('Seed completed:');
  console.log('  admin@library.test / admin123');
  console.log('  librarian@library.test / librarian123');
  console.log('  head@library.test / head123');
  console.log(`  Authors: ${authors.length}, Books: ${books.length}, Copies: ${copyData.length}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
