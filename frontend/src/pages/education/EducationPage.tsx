import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import {
  Card,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  useDisciplines,
  useCreateDiscipline,
  useUpdateDiscipline,
  useDeleteDiscipline,
} from '../../entities/discipline/api';
import {
  useStudentGroups,
  useCreateStudentGroup,
  useUpdateStudentGroup,
  useDeleteStudentGroup,
} from '../../entities/studentGroup/api';
import {
  useDisciplineAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from '../../entities/assignment/api';
import {
  useCoverageRequirements,
  useCreateCoverage,
  useUpdateCoverage,
  useDeleteCoverage,
  type CoverageWithRelations,
} from '../../entities/coverage/api';
import type { DisciplineAssignment } from '../../entities/assignment/api';
import { useBooks } from '../../shared/hooks/useBooks';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import { useAuthStore } from '../../shared/lib/store';
import { getServerPagination } from '../../shared/lib/pagination';
import { UserRole } from '../../shared/types';
import { rules, maskGroupName } from '../../shared/validation';

export const EducationPage: React.FC = () => {
  const { hasRole } = useAuthStore();
  const canEdit = hasRole([UserRole.ADMIN, UserRole.LIBRARIAN]);

  return (
    <AppLayout>
      <Card title="Учебный процесс">
        <Tabs
          items={[
            { key: 'disciplines', label: 'Дисциплины', children: <DisciplinesTab canEdit={canEdit} /> },
            { key: 'groups', label: 'Группы', children: <GroupsTab canEdit={canEdit} /> },
            { key: 'assignments', label: 'Назначения', children: <AssignmentsTab canEdit={canEdit} /> },
            { key: 'coverage', label: 'Требования к фонду', children: <CoverageRequirementsTab canEdit={canEdit} /> },
          ]}
        />
      </Card>
    </AppLayout>
  );
};

const DisciplinesTab: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const list = useListQueryState();
  const { data, isLoading } = useDisciplines(list.params);
  const create = useCreateDiscipline();
  const update = useUpdateDiscipline();
  const remove = useDeleteDiscipline();
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<{ id: number; name: string; department: string } | null>(null);
  const [form] = Form.useForm();

  if (isLoading) return <Spin />;
  if (!data) return <Empty />;

  return (
    <>
      {canEdit && (
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setOpen(true)}>
          Добавить дисциплину
        </Button>
      )}
      <Table
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'Название', dataIndex: 'name' },
          { title: 'Кафедра', dataIndex: 'department' },
          ...(canEdit
            ? [{
                title: 'Действия',
                key: 'actions',
                render: (_: unknown, record: { id: number; name: string; department: string }) => (
                  <Space>
                    <Button size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setEditOpen(true); }}>Изменить</Button>
                    <Popconfirm title="Удалить?" onConfirm={async () => { try { await remove.mutateAsync(record.id); message.success('Удалено'); } catch { message.error('Ошибка'); } }}>
                      <Button danger size="small">Удалить</Button>
                    </Popconfirm>
                  </Space>
                ),
              }]
            : []),
        ]}
      />

      <Modal title="Новая дисциплина" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        try {
          const v = await form.validateFields();
          await create.mutateAsync(v);
          message.success('Создано');
          form.resetFields();
          setOpen(false);
        } catch { message.error('Ошибка'); }
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={rules.disciplineName()}><Input maxLength={200} showCount /></Form.Item>
          <Form.Item name="department" label="Кафедра" rules={rules.department()}><Input maxLength={300} showCount /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить дисциплину" open={editOpen} onCancel={() => { setEditOpen(false); setEditing(null); }} onOk={async () => {
        if (!editing) return;
        try {
          const v = await form.validateFields();
          await update.mutateAsync({ id: editing.id, payload: v });
          message.success('Обновлено');
          setEditOpen(false);
          setEditing(null);
        } catch { message.error('Ошибка'); }
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={rules.disciplineName()}><Input maxLength={200} showCount /></Form.Item>
          <Form.Item name="department" label="Кафедра" rules={rules.department()}><Input maxLength={300} showCount /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const GroupsTab: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const list = useListQueryState();
  const { data, isLoading } = useStudentGroups(list.params);
  const create = useCreateStudentGroup();
  const update = useUpdateStudentGroup();
  const remove = useDeleteStudentGroup();
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<{ id: number; name: string; studentCount: number } | null>(null);
  const [form] = Form.useForm();

  if (isLoading) return <Spin />;
  if (!data) return <Empty />;

  return (
    <>
      {canEdit && <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setOpen(true)}>Добавить группу</Button>}
      <Table
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'Группа', dataIndex: 'name' },
          { title: 'Студентов', dataIndex: 'studentCount' },
          ...(canEdit ? [{
            title: 'Действия', key: 'actions',
            render: (_: unknown, record: { id: number; name: string; studentCount: number }) => (
              <Space>
                <Button size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setEditOpen(true); }}>Изменить</Button>
                <Popconfirm title="Удалить?" onConfirm={async () => { try { await remove.mutateAsync(record.id); message.success('Удалено'); } catch { message.error('Ошибка'); } }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          }] : []),
        ]}
      />

      <Modal title="Новая группа" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        try { const v = await form.validateFields(); await create.mutateAsync(v); message.success('Создано'); form.resetFields(); setOpen(false); } catch { message.error('Ошибка'); }
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={rules.groupName()}>
            <Input placeholder="ИВТ-21" maxLength={40} onChange={(e) => form.setFieldValue('name', maskGroupName(e.target.value))} />
          </Form.Item>
          <Form.Item name="studentCount" label="Число студентов" rules={rules.studentCount()}><InputNumber min={0} precision={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить группу" open={editOpen} onCancel={() => { setEditOpen(false); setEditing(null); }} onOk={async () => {
        if (!editing) return;
        try { const v = await form.validateFields(); await update.mutateAsync({ id: editing.id, payload: v }); message.success('Обновлено'); setEditOpen(false); setEditing(null); } catch { message.error('Ошибка'); }
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={rules.groupName()}>
            <Input maxLength={40} onChange={(e) => form.setFieldValue('name', maskGroupName(e.target.value))} />
          </Form.Item>
          <Form.Item name="studentCount" label="Число студентов" rules={rules.studentCount()}><InputNumber min={0} precision={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const AssignmentsTab: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const list = useListQueryState(undefined, 50);
  const { data, isLoading } = useDisciplineAssignments(list.params);
  const { data: disciplines } = useDisciplines(DROPDOWN_LIST_PARAMS);
  const { data: groups } = useStudentGroups(DROPDOWN_LIST_PARAMS);
  const create = useCreateAssignment();
  const remove = useDeleteAssignment();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  if (isLoading) return <Spin />;
  if (!data) return <Empty />;

  return (
    <>
      {canEdit && <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setOpen(true)}>Назначить группу на дисциплину</Button>}
      <Table<DisciplineAssignment>
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: 'Дисциплина', render: (_: unknown, r) => r.discipline?.name ?? '—' },
          { title: 'Кафедра', render: (_: unknown, r) => r.discipline?.department ?? '—' },
          { title: 'Группа', render: (_: unknown, r) => r.studentGroup?.name ?? '—' },
          { title: 'Студентов', render: (_: unknown, r) => r.studentGroup?.studentCount ?? '—' },
          ...(canEdit ? [{
            title: 'Действия', key: 'actions',
            render: (_: unknown, record: DisciplineAssignment) => (
              <Popconfirm title="Удалить назначение?" onConfirm={async () => { try { await remove.mutateAsync(record.id); message.success('Удалено'); } catch { message.error('Ошибка'); } }}>
                <Button danger size="small">Удалить</Button>
              </Popconfirm>
            ),
          }] : []),
        ]}
      />

      <Modal title="Назначение" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        try { const v = await form.validateFields(); await create.mutateAsync(v); message.success('Назначено'); form.resetFields(); setOpen(false); } catch { message.error('Ошибка'); }
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="disciplineId" label="Дисциплина" rules={rules.selectRequired('Выберите дисциплину')}>
            <Select placeholder="Выберите дисциплину" options={disciplines?.data?.map((d) => ({ value: d.id, label: `${d.name} (${d.department})` }))} />
          </Form.Item>
          <Form.Item name="studentGroupId" label="Группа" rules={rules.selectRequired('Выберите группу')}>
            <Select placeholder="Выберите группу" options={groups?.data?.map((g) => ({ value: g.id, label: `${g.name} — ${g.studentCount} чел.` }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const CoverageRequirementsTab: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const list = useListQueryState<{ disciplineId?: number }>();
  const { data, isLoading } = useCoverageRequirements(list.params);
  const { data: disciplines } = useDisciplines(DROPDOWN_LIST_PARAMS);
  const { data: books } = useBooks(DROPDOWN_LIST_PARAMS);
  const create = useCreateCoverage();
  const update = useUpdateCoverage();
  const remove = useDeleteCoverage();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  if (isLoading) return <Spin />;
  if (!data) return <Empty />;

  return (
    <>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск: дисциплина, книга..."
        filters={
          <Select
            allowClear
            placeholder="Дисциплина"
            style={{ width: 280 }}
            value={list.filters.disciplineId}
            options={disciplines?.data?.map((d) => ({ value: d.id, label: d.name }))}
            onChange={(disciplineId) =>
              list.setFilters({ ...list.filters, disciplineId: disciplineId ?? undefined })
            }
          />
        }
        extra={canEdit ? <Button type="primary" onClick={() => setOpen(true)}>Добавить требование</Button> : undefined}
      />
      <Table<CoverageWithRelations>
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: 'Дисциплина', render: (_: unknown, r) => r.discipline?.name ?? '—' },
          { title: 'Книга', render: (_: unknown, r) => r.book?.title ?? '—' },
          { title: 'Требуется экз.', dataIndex: 'requiredCount' },
          ...(canEdit ? [{
            title: 'Действия', key: 'actions',
            render: (_: unknown, record: CoverageWithRelations) => (
              <Space>
                <Button size="small" onClick={async () => {
                  const count = prompt('Новое требуемое количество (целое ≥ 1):', String(record.requiredCount));
                  if (count == null || count.trim() === '') return;
                  const n = Number(count);
                  if (!Number.isInteger(n) || n < 1) {
                    message.error('Введите целое число не меньше 1');
                    return;
                  }
                  try { await update.mutateAsync({ id: record.id, requiredCount: n }); message.success('Обновлено'); } catch { message.error('Ошибка'); }
                }}>Изменить</Button>
                <Popconfirm title="Удалить?" onConfirm={async () => { try { await remove.mutateAsync(record.id); message.success('Удалено'); } catch { message.error('Ошибка'); } }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          }] : []),
        ]}
      />

      <Modal title="Требование к фонду" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        try { const v = await form.validateFields(); await create.mutateAsync(v); message.success('Создано'); form.resetFields(); setOpen(false); } catch { message.error('Ошибка'); }
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="disciplineId" label="Дисциплина" rules={rules.selectRequired('Выберите дисциплину')}>
            <Select options={disciplines?.data?.map((d) => ({ value: d.id, label: d.name }))} />
          </Form.Item>
          <Form.Item name="bookId" label="Книга" rules={rules.selectRequired('Выберите книгу')}>
            <Select showSearch optionFilterProp="label" options={books?.data?.map((b) => ({ value: b.id, label: b.title }))} />
          </Form.Item>
          <Form.Item name="requiredCount" label="Требуется экземпляров" rules={rules.positiveInt('Количество')}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EducationPage;
