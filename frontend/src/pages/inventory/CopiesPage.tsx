import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, InputNumber, message, Select } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useCopies, useCreateCopy, useChangeCopyStatus } from '../../entities/copy/api';
import { useBooks } from '../../shared/hooks/useBooks';
import { CopyTable } from '../../entities/copy/CopyTable';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import type { Copy } from '../../shared/types';

const copyStatusOptions = [
  { value: 'AVAILABLE', label: 'Доступен' },
  { value: 'ISSUED', label: 'Выдан' },
  { value: 'WRITTEN_OFF', label: 'Списан' },
];

export const CopiesPage: React.FC = () => {
  const list = useListQueryState<{ status?: string }>();
  const { data, isLoading } = useCopies(list.params);
  const create = useCreateCopy();
  const changeStatus = useChangeCopyStatus();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();
  const { data: booksData } = useBooks(DROPDOWN_LIST_PARAMS);

  if (isLoading) return (
    <AppLayout>
      <Spin size="large" />
    </AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <Empty description="Экземпляры не найдены" />
    </AppLayout>
  );

  const handleChangeStatus = async (c: Copy) => {
    const next = c.status === 'AVAILABLE' ? 'ISSUED' : 'AVAILABLE';
    try {
      await changeStatus.mutateAsync({ id: c.id, status: next });
      message.success('Статус обновлён');
    } catch (e) {
      message.error('Не удалось обновить статус');
    }
  };

  return (
    <AppLayout>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск: инв. №, книга, ISBN..."
        filters={
          <Select
            allowClear
            placeholder="Статус"
            style={{ width: 160 }}
            value={list.filters.status}
            options={copyStatusOptions}
            onChange={(status) => list.setFilters({ ...list.filters, status: status ?? undefined })}
          />
        }
        extra={<Button type="primary" onClick={() => setOpen(true)}>Добавить экземпляр</Button>}
      />

      <CopyTable
        copies={data.data}
        loading={isLoading}
        onChangeStatus={handleChangeStatus}
        onRowClick={() => {}}
        pagination={getServerPagination(data, list.setSkip)}
      />

      <Modal title="Создать экземпляр" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        try {
          const values = await form.validateFields();
          await create.mutateAsync({ inventoryNumber: values.inventoryNumber, bookId: Number(values.bookId) });
          message.success('Экземпляр создан');
          form.resetFields();
          setOpen(false);
        } catch (e: any) {
          const err = e?.response?.data?.message || e?.message || 'Не удалось создать экземпляр';
          message.error(err);
        }
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="inventoryNumber" label="Инвентарный номер" rules={[{ required: true }]}> 
            <InputNumber style={{ width: '100%' }} placeholder="Например: 1001" />
          </Form.Item>
          <Form.Item name="bookId" label="Книга" rules={[{ required: true }]}>
            <Select placeholder="Выберите книгу">
              {booksData?.data?.map((b: any) => (<Select.Option key={b.id} value={b.id}>{b.title} (#{b.id})</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default CopiesPage;
