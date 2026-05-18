import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Table, Empty, Spin, Button, Space, message, Select, Tag, Tabs } from 'antd';
import {
  useCoverageReport,
  useCoverageByKnowledgeArea,
  useReaderNeedsReport,
} from '../../entities/coverage/api';
import { useDisciplines } from '../../entities/discipline/api';
import { downloadCoverageReport } from '../../entities/report/api';
import type { CoverageReport } from '../../shared/types';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';

export const CoveragePage: React.FC = () => {
  const [view, setView] = React.useState<'discipline' | 'knowledgeArea' | 'readerNeeds'>('discipline');
  const { data, isLoading } = useCoverageReport();
  const { data: disciplines } = useDisciplines(DROPDOWN_LIST_PARAMS);
  const [knowledgeDiscipline, setKnowledgeDiscipline] = React.useState<number | undefined>();
  const { data: knowledgeData, isLoading: kaLoading } = useCoverageByKnowledgeArea(knowledgeDiscipline);
  const { data: readerNeeds, isLoading: rnLoading } = useReaderNeedsReport();

  const exportButtons = (disciplineId: number) => (
    <Space>
      {(['csv', 'xlsx', 'pdf'] as const).map((fmt) => (
        <Button
          key={fmt}
          size="small"
          onClick={async () => {
            try {
              const blob = await downloadCoverageReport(disciplineId, fmt);
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `coverage-${disciplineId}.${fmt}`;
              a.click();
              window.URL.revokeObjectURL(url);
            } catch {
              message.error(`Не удалось скачать ${fmt.toUpperCase()}`);
            }
          }}
        >
          {fmt.toUpperCase()}
        </Button>
      ))}
    </Space>
  );

  const disciplineColumns = [
    { title: 'Дисциплина', dataIndex: 'discipline', key: 'discipline' },
    { title: 'Кафедра', dataIndex: 'department', key: 'department' },
    { title: 'Требуется', dataIndex: 'totalRequired', key: 'totalRequired' },
    { title: 'Доступно', dataIndex: 'totalAvailable', key: 'totalAvailable' },
    {
      title: 'Обеспеченность %',
      dataIndex: 'coveragePercent',
      key: 'coveragePercent',
      render: (v: number) => (
        <Tag color={v >= 80 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v}%</Tag>
      ),
    },
    {
      title: 'Экспорт',
      key: 'actions',
      render: (_: unknown, record: CoverageReport) => exportButtons(record.disciplineId),
    },
  ];

  const knowledgeColumns = [
    { title: 'Область знаний', dataIndex: 'name', key: 'name' },
    { title: 'Требуется', dataIndex: 'totalRequired', key: 'totalRequired' },
    { title: 'Доступно', dataIndex: 'totalAvailable', key: 'totalAvailable' },
    {
      title: 'Обеспеченность %',
      dataIndex: 'coveragePercent',
      key: 'coveragePercent',
      render: (v: number) => (
        <Tag color={v >= 80 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v}%</Tag>
      ),
    },
  ];

  const readerColumns = [
    { title: 'Дисциплина', dataIndex: 'discipline', key: 'discipline' },
    { title: 'Кафедра', dataIndex: 'department', key: 'department' },
    { title: 'Читателей (студентов)', dataIndex: 'readerCount', key: 'readerCount' },
    { title: 'Доступно экз.', dataIndex: 'totalAvailable', key: 'totalAvailable' },
    {
      title: 'Соответствие потребностям %',
      dataIndex: 'compliancePercent',
      key: 'compliancePercent',
      render: (v: number) => (
        <Tag color={v >= 80 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v}%</Tag>
      ),
    },
  ];

  const loading = isLoading || (view === 'knowledgeArea' && kaLoading) || (view === 'readerNeeds' && rnLoading);

  return (
    <AppLayout>
      <Card title="Книгообеспеченность и анализ фонда">
        <Tabs
          activeKey={view}
          onChange={(k) => setView(k as typeof view)}
          items={[
            {
              key: 'discipline',
              label: 'По дисциплинам',
              children: loading ? (
                <Spin />
              ) : !data?.length ? (
                <Empty description="Нет данных. Добавьте требования в разделе «Учебный процесс»." />
              ) : (
                <Table<CoverageReport> dataSource={data} columns={disciplineColumns} rowKey="disciplineId" pagination={false} />
              ),
            },
            {
              key: 'knowledgeArea',
              label: 'По отраслям знаний',
              children: (
                <>
                  <Select
                    allowClear
                    placeholder="Фильтр по дисциплине (необязательно)"
                    style={{ width: 320, marginBottom: 16 }}
                    options={disciplines?.data?.map((d) => ({ value: d.id, label: `${d.name} (${d.department})` }))}
                    onChange={(v) => setKnowledgeDiscipline(v)}
                  />
                  {kaLoading ? (
                    <Spin />
                  ) : !knowledgeData?.length ? (
                    <Empty description="Нет данных по областям знаний" />
                  ) : (
                    <Table dataSource={knowledgeData} columns={knowledgeColumns} rowKey="knowledgeAreaId" pagination={false} />
                  )}
                </>
              ),
            },
            {
              key: 'readerNeeds',
              label: 'Соответствие потребностям читателей',
              children: rnLoading ? (
                <Spin />
              ) : !readerNeeds?.length ? (
                <Empty description="Нет данных. Назначьте группы на дисциплины в «Учебный процесс»." />
              ) : (
                <Table dataSource={readerNeeds} columns={readerColumns} rowKey="disciplineId" pagination={false} />
              ),
            },
          ]}
        />
      </Card>
    </AppLayout>
  );
};

export default CoveragePage;
