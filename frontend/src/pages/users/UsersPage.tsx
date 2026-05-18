import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Table, Empty, Spin, Button, Form, Input, Select, message, Modal, Space, Popconfirm } from 'antd';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../entities/user/api';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import { getServerPagination } from '../../shared/lib/pagination';

const { Option } = Select;

export const UsersPage: React.FC = () => {
  const list = useListQueryState<{ role?: string }>();
  const { data, isLoading, refetch } = useUsers(list.params);
  const create = useCreateUser();
  const update = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<{
    id: string;
    email: string;
    fullName: string;
    role: string;
    department?: string;
  } | null>(null);
  const roleLabels: Record<string, string> = {
    ADMIN: 'Администратор',
    LIBRARIAN: 'Библиотекарь',
    DEPARTMENT_HEAD: 'Заведующий кафедрой',
    VIEWER: 'Читатель',
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Spin size="large" />
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <Empty description="Пользователи не найдены" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card title="Пользователи">
        <TableToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Поиск: email, ФИО, кафедра..."
          filters={
            <Select
              allowClear
              placeholder="Роль"
              style={{ width: 200 }}
              value={list.filters.role}
              onChange={(role) => list.setFilters({ ...list.filters, role: role ?? undefined })}
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          }
        />

        <Table
          rowKey="id"
          dataSource={data.data}
          columns={[
            { title: 'Почта', dataIndex: 'email', key: 'email' },
            { title: 'ФИО', dataIndex: 'fullName', key: 'fullName' },
            { title: 'Роль', dataIndex: 'role', key: 'role', render: (value: string) => roleLabels[value] ?? value },
            {
              title: 'Действия',
              key: 'actions',
              render: (_v, record) => (
                <Space>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingUser(record);
                      editForm.setFieldsValue(record);
                      setEditOpen(true);
                    }}
                  >
                    Изменить
                  </Button>
                  <Popconfirm
                    title="Удалить пользователя?"
                    onConfirm={async () => {
                      try {
                        await deleteUser.mutateAsync(record.id);
                        message.success('Пользователь удалён');
                        refetch();
                      } catch {
                        message.error('Не удалось удалить');
                      }
                    }}
                  >
                    <Button danger size="small">
                      Удалить
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={getServerPagination(data, list.setSkip)}
        />

        <div style={{ marginTop: 16 }}>
          <Form form={form} layout="inline">
            <Form.Item name="email" rules={[{ required: true }]}>
              <Input placeholder="Например: example@domain.tld" />
            </Form.Item>
            <Form.Item name="fullName" rules={[{ required: true }]}>
              <Input placeholder="Например: Иванов Иван" />
            </Form.Item>
            <Form.Item name="role" rules={[{ required: true }]}>
              <Select style={{ width: 180 }} placeholder="Роль">
                <Option value="ADMIN">Администратор</Option>
                <Option value="LIBRARIAN">Библиотекарь</Option>
                <Option value="DEPARTMENT_HEAD">Заведующий кафедрой</Option>
                <Option value="VIEWER">Читатель</Option>
              </Select>
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true }]}>
              <Input placeholder="Пароль (минимум 8 символов)" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={async () => {
                  const values = await form.validateFields();
                  try {
                    await create.mutateAsync(values);
                    message.success('Пользователь создан');
                    form.resetFields();
                    refetch();
                  } catch {
                    message.error('Не удалось создать пользователя');
                  }
                }}
              >
                Создать
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Modal
          title="Изменить пользователя"
          open={editOpen}
          onCancel={() => {
            setEditOpen(false);
            setEditingUser(null);
          }}
          onOk={async () => {
            try {
              const values = await editForm.validateFields();
              if (!editingUser) return;
              await update.mutateAsync({ id: editingUser.id, payload: values });
              message.success('Пользователь обновлён');
              setEditOpen(false);
              setEditingUser(null);
              refetch();
            } catch {
              message.error('Не удалось обновить пользователя');
            }
          }}
          okText="Сохранить"
          cancelText="Отмена"
        >
          <Form form={editForm} layout="vertical">
            <Form.Item name="fullName" label="ФИО" rules={[{ required: true }]}>
              <Input placeholder="Например: Иванов Иван" />
            </Form.Item>
            <Form.Item name="role" label="Роль" rules={[{ required: true }]}>
              <Select placeholder="Роль">
                <Option value="ADMIN">Администратор</Option>
                <Option value="LIBRARIAN">Библиотекарь</Option>
                <Option value="DEPARTMENT_HEAD">Заведующий кафедрой</Option>
                <Option value="VIEWER">Читатель</Option>
              </Select>
            </Form.Item>
            <Form.Item name="department" label="Кафедра">
              <Input placeholder="Например: Кафедра математики" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </AppLayout>
  );
};

export default UsersPage;
