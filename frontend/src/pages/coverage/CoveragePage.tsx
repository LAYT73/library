import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Table, Empty, Spin } from 'antd';
import { useCoverageReport } from '../../entities/coverage/api';
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
