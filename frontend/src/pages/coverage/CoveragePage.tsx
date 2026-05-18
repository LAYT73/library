import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Table, Empty, Spin, Button, Space, message } from 'antd';
import { useCoverageReport } from '../../entities/coverage/api';
import { downloadCoverageReport } from '../../entities/report/api';
import type { CoverageReport } from '../../shared/types';

export const CoveragePage: React.FC = () => {
  const { data, isLoading } = useCoverageReport();

  if (isLoading) return (
    <AppLayout>
      <Spin size="large" />
    </AppLayout>
  );

  if (!data || data.length === 0) return (
    <AppLayout>
      <Card title="Обеспеченность">
        <Empty description="Нет данных по обеспеченности" />
      </Card>
    </AppLayout>
  );

  const columns = [
    { title: 'Дисциплина', dataIndex: 'discipline', key: 'discipline' },
    { title: 'Кафедра', dataIndex: 'department', key: 'department' },
    { title: 'Требуется', dataIndex: 'totalRequired', key: 'totalRequired' },
    { title: 'Доступно', dataIndex: 'totalAvailable', key: 'totalAvailable' },
    { title: 'Процент обеспеченности', dataIndex: 'coveragePercent', key: 'coveragePercent' },
    {
      title: 'Действия', key: 'actions', render: (_v: any, record: any) => (
        <Space>
          <Button size="small" onClick={async () => { try { const blob = await downloadCoverageReport(record.disciplineId, 'csv'); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `coverage-${record.disciplineId}.csv`; a.click(); window.URL.revokeObjectURL(url); } catch { message.error('Не удалось скачать CSV'); } }}>CSV</Button>
          <Button size="small" onClick={async () => { try { const blob = await downloadCoverageReport(record.disciplineId, 'xlsx'); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `coverage-${record.disciplineId}.xlsx`; a.click(); window.URL.revokeObjectURL(url); } catch { message.error('Не удалось скачать XLSX'); } }}>XLSX</Button>
          <Button size="small" onClick={async () => { try { const blob = await downloadCoverageReport(record.disciplineId, 'pdf'); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `coverage-${record.disciplineId}.pdf`; a.click(); window.URL.revokeObjectURL(url); } catch { message.error('Не удалось скачать PDF'); } }}>PDF</Button>
        </Space>
      )
    }
  ];

  return (
    <AppLayout>
      <Card title="Отчёт по обеспеченности">
        <Table<CoverageReport> dataSource={data} columns={columns} rowKey="disciplineId" />
      </Card>
    </AppLayout>
  );
};

export default CoveragePage;
