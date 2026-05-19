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

  const supplierLan = await prisma.supplier.create({
    data: {
      name: 'Издательский дом «Лань»',
      contactInfo: 'order@lanbook.ru',
    },
  });

  const day = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  type PrItem = { bookId: number; quantity: number };

  const procurementChains: Array<{
    prStatus: PurchaseRequestStatus;
    prItems: PrItem[];
    prDate: Date;
    order?: {
      status: OrderStatus;
      supplierId: number;
      orderDate: Date;
      expectedDays: number;
    };
    acquisition?: { totalCost: number; date: Date };
  }> = [
    {
      prStatus: PurchaseRequestStatus.COMPLETED,
      prItems: [
        { bookId: books[0].id, quantity: 5 },
        { bookId: books[1].id, quantity: 3 },
      ],
      prDate: day(95),
      order: {
        status: OrderStatus.DELIVERED,
        supplierId: supplier.id,
        orderDate: day(88),
        expectedDays: 14,
      },
      acquisition: { totalCost: 42500.5, date: day(82) },
    },
    {
      prStatus: PurchaseRequestStatus.COMPLETED,
      prItems: [
        { bookId: books[2].id, quantity: 2 },
        { bookId: books[3].id, quantity: 4 },
      ],
      prDate: day(75),
      order: {
        status: OrderStatus.DELIVERED,
        supplierId: supplierLan.id,
        orderDate: day(68),
        expectedDays: 10,
      },
      acquisition: { totalCost: 31200, date: day(62) },
    },
    {
      prStatus: PurchaseRequestStatus.APPROVED,
      prItems: [{ bookId: books[3].id, quantity: 2 }],
      prDate: day(55),
      order: {
        status: OrderStatus.DELIVERED,
        supplierId: supplier.id,
        orderDate: day(50),
        expectedDays: 7,
      },
      acquisition: { totalCost: 18750, date: day(48) },
    },
    {
      prStatus: PurchaseRequestStatus.APPROVED,
      prItems: [
        { bookId: books[1].id, quantity: 3 },
        { bookId: books[2].id, quantity: 2 },
      ],
      prDate: day(25),
      order: {
        status: OrderStatus.DELIVERED,
        supplierId: supplierLan.id,
        orderDate: day(20),
        expectedDays: 5,
      },
      acquisition: { totalCost: 28900, date: day(12) },
    },
    {
      prStatus: PurchaseRequestStatus.APPROVED,
      prItems: [{ bookId: books[0].id, quantity: 2 }],
      prDate: day(40),
      order: {
        status: OrderStatus.SENT,
        supplierId: supplier.id,
        orderDate: day(35),
        expectedDays: 21,
      },
    },
    {
      prStatus: PurchaseRequestStatus.APPROVED,
      prItems: [{ bookId: books[1].id, quantity: 4 }],
      prDate: day(18),
      order: {
        status: OrderStatus.SENT,
        supplierId: supplierLan.id,
        orderDate: day(14),
        expectedDays: 14,
      },
    },
    {
      prStatus: PurchaseRequestStatus.APPROVED,
      prItems: [
        { bookId: books[2].id, quantity: 1 },
        { bookId: books[0].id, quantity: 1 },
      ],
      prDate: day(30),
      order: {
        status: OrderStatus.CREATED,
        supplierId: supplierLan.id,
        orderDate: day(28),
        expectedDays: 30,
      },
    },
    {
      prStatus: PurchaseRequestStatus.CREATED,
      prItems: [{ bookId: books[1].id, quantity: 6 }],
      prDate: day(10),
    },
    {
      prStatus: PurchaseRequestStatus.CREATED,
      prItems: [
        { bookId: books[2].id, quantity: 3 },
        { bookId: books[3].id, quantity: 1 },
      ],
      prDate: day(3),
    },
    {
      prStatus: PurchaseRequestStatus.REJECTED,
      prItems: [{ bookId: books[3].id, quantity: 10 }],
      prDate: day(50),
    },
    {
      prStatus: PurchaseRequestStatus.REJECTED,
      prItems: [{ bookId: books[0].id, quantity: 20 }],
      prDate: day(35),
    },
  ];

  const purchaseRequests: Awaited<ReturnType<typeof prisma.purchaseRequest.create>>[] = [];
  const orders: Awaited<ReturnType<typeof prisma.order.create>>[] = [];
  const acquisitions: Awaited<ReturnType<typeof prisma.acquisition.create>>[] = [];
  const acquisitionCopies: Array<{
    inventoryNumber: number;
    status: CopyStatus;
    bookId: number;
    acquisitionId: number;
  }> = [];

  let inv = 1000;

  for (const chain of procurementChains) {
    const pr = await prisma.purchaseRequest.create({
      data: {
        status: chain.prStatus,
        date: chain.prDate,
        items: { create: chain.prItems },
      },
    });
    purchaseRequests.push(pr);

    if (!chain.order) continue;

    const order = await prisma.order.create({
      data: {
        supplierId: chain.order.supplierId,
        purchaseRequestId: pr.id,
        status: chain.order.status,
        orderDate: chain.order.orderDate,
        expectedDate: new Date(
          chain.order.orderDate.getTime() + chain.order.expectedDays * 24 * 60 * 60 * 1000,
        ),
        items: { create: chain.prItems },
      },
    });
    orders.push(order);

    if (!chain.acquisition) continue;

    const acquisition = await prisma.acquisition.create({
      data: {
        supplierId: chain.order.supplierId,
        orderId: order.id,
        totalCost: chain.acquisition.totalCost,
        date: chain.acquisition.date,
      },
    });
    acquisitions.push(acquisition);

    for (const item of chain.prItems) {
      for (let q = 0; q < item.quantity; q++) {
        inv += 1;
        acquisitionCopies.push({
          inventoryNumber: inv,
          status: CopyStatus.AVAILABLE,
          bookId: item.bookId,
          acquisitionId: acquisition.id,
        });
      }
    }
  }

  const donationDonors = [
    'Альма-матер (выпускники)',
    'Профком университета',
    'Благотворительный фонд «Читай»',
    'Кафедра информатики',
    'Библиотека МГУ (обмен)',
    'Выпускник Иванов А.С.',
    'Родительский комитет ИВТ-21',
    'Издательство «Питер» (промо)',
    'Студенческий совет',
    'Департамент образования',
    'Книжный клуб «Полка»',
    'Пожертвование от семьи Петровых',
  ];
  const donations = await Promise.all(
    donationDonors.map((donorName, i) =>
      prisma.donation.create({
        data: {
          donorName,
          date: new Date(Date.now() - (donationDonors.length - i) * 5 * 24 * 60 * 60 * 1000),
          items: {
            create: [
              {
                bookId: books[i % books.length].id,
                quantity: 1 + (i % 4),
              },
              ...(i % 3 === 0
                ? [{ bookId: books[(i + 1) % books.length].id, quantity: 1 }]
                : []),
            ],
          },
        },
      }),
    ),
  );

  const copyData: Array<{
    inventoryNumber: number;
    status: CopyStatus;
    bookId: number;
    acquisitionId?: number;
  }> = [...acquisitionCopies];

  for (const book of books) {
    const count = 2;
    for (let i = 0; i < count; i++) {
      inv += 1;
      copyData.push({
        inventoryNumber: inv,
        status: CopyStatus.AVAILABLE,
        bookId: book.id,
      });
    }
  }

  await prisma.copy.createMany({ data: copyData });

  for (let d = 0; d < donations.length; d++) {
    const donation = donations[d];
    const items = await prisma.donationItem.findMany({ where: { donationId: donation.id } });
    for (const item of items) {
      for (let q = 0; q < item.quantity; q++) {
        inv += 1;
        await prisma.copy.create({
          data: {
            inventoryNumber: inv,
            status: CopyStatus.AVAILABLE,
            bookId: item.bookId,
          },
        });
      }
    }
  }

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
  console.log(
    `  Authors: ${authors.length}, Books: ${books.length}, PRs: ${purchaseRequests.length}, Orders: ${orders.length}, Acquisitions: ${acquisitions.length} (all linked to orders), Copies: ${copyData.length}+, Donations: ${donations.length}`,
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
