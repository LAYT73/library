export const PERMISSIONS = {
  books: {
    read: 'books.read',
    create: 'books.create',
    update: 'books.update',
    delete: 'books.delete',
  },
  copies: {
    read: 'copies.read',
    create: 'copies.create',
    update: 'copies.update',
  },
  orders: {
    read: 'orders.read',
    create: 'orders.create',
  },
  coverage: {
    read: 'coverage.read',
    readDepartment: 'coverage.read.department',
  },
  reports: {
    read: 'reports.read',
    readDepartment: 'reports.read.department',
  },
  users: {
    read: 'users.read',
    create: 'users.create',
    update: 'users.update',
    delete: 'users.delete',
  },
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  LIBRARIAN: [
    'books.*',
    'copies.*',
    'orders.*',
    'reports.*',
    'disciplines.*',
    'groups.*',
    'suppliers.*',
    'acquisitions.*',
  ],
  DEPARTMENT_HEAD: [
    'books.read',
    'coverage.read.department',
    'reports.read.department',
    'disciplines.read',
    'groups.read',
  ],
  VIEWER: ['books.read', 'coverage.read', 'reports.read'],
};
