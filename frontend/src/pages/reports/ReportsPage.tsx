import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Form, Input, Button, Select, message, Row, Col, Typography, Divider } from 'antd';
import { FileExcelOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import { downloadFundReport, downloadCoverageReport, importFundCsv } from '../../entities/report/api';
import { useDisciplines } from '../../entities/discipline/api';

const { Title, Paragraph } = Typography;

type ReportFormat = 'csv' | 'xlsx' | 'pdf';

const formatOptions = [
  { value: 'csv', label: 'CSV (UTF-8)' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'pdf', label: 'PDF' },
];

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const ReportsPage: React.FC = () => {
  const [fundForm] = Form.useForm<{ fundFormat: ReportFormat }>();
  const [coverageForm] = Form.useForm<{ disciplineId: number; coverageFormat: ReportFormat }>();
  const [importForm] = Form.useForm<{ csv: string }>();
  const { data: disciplines } = useDisciplines(0, 500);

  const handleFundExport = async () => {
    try {
      const { fundFormat } = await fundForm.validateFields();
      const blob = await downloadFundReport(fundFormat);
      downloadBlob(blob, `fund-report.${fundFormat}`);
      message.success('Фондовый отчёт скачан');
    } catch {
      message.error('Не удалось скачать фондовый отчёт');
    }
  };

  const handleCoverageExport = async () => {
    try {
      const { disciplineId, coverageFormat } = await coverageForm.validateFields();
      const blob = await downloadCoverageReport(disciplineId, coverageFormat);
      downloadBlob(blob, `coverage-${disciplineId}.${coverageFormat}`);
      message.success('Отчёт по обеспеченности скачан');
    } catch {
      message.error('Выберите дисциплину и формат');
    }
  };

  const handleImport = async () => {
    try {
      const { csv } = await importForm.validateFields();
      await importFundCsv(csv);
      message.success('CSV импортирован');
      importForm.resetFields();
    } catch {
      message.error('Не удалось импортировать CSV');
    }
  };

  return (
    <AppLayout>
      <Title level={3} style={{ marginBottom: 24 }}>Отчёты и импорт</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Фондовый отчёт" bordered={false} style={{ height: '100%' }}>
            <Paragraph type="secondary">
              Сводка по всем экземплярам: инвентарный номер, статус, книга, поступление.
            </Paragraph>
            <Form form={fundForm} layout="vertical" initialValues={{ fundFormat: 'csv' }}>
              <Form.Item name="fundFormat" label="Формат">
                <Select options={formatOptions} />
              </Form.Item>
              <Button type="primary" icon={<FileTextOutlined />} onClick={handleFundExport} block>
                Скачать фондовый отчёт
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Обеспеченность по дисциплине" bordered={false} style={{ height: '100%' }}>
            <Paragraph type="secondary">
              Детализация по книгам выбранной дисциплины: требуемое и доступное количество.
            </Paragraph>
            <Form form={coverageForm} layout="vertical" initialValues={{ coverageFormat: 'csv' }}>
              <Form.Item
                name="disciplineId"
                label="Дисциплина"
                rules={[{ required: true, message: 'Выберите дисциплину' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Выберите дисциплину"
                  options={disciplines?.data?.map((d) => ({
                    value: d.id,
                    label: `${d.name} — ${d.department}`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="coverageFormat" label="Формат">
                <Select options={formatOptions} />
              </Form.Item>
              <Button icon={<FileExcelOutlined />} onClick={handleCoverageExport} block>
                Скачать отчёт по обеспеченности
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Импорт фондового CSV" bordered={false}>
            <Paragraph type="secondary">
              Вставьте CSV с колонками: инв. номер, статус, ID книги, ISBN, название, ID поступления.
            </Paragraph>
            <Form form={importForm} layout="vertical">
              <Form.Item
                name="csv"
                label="Содержимое CSV"
                rules={[{ required: true, message: 'Вставьте CSV' }]}
              >
                <Input.TextArea rows={8} placeholder="inventoryNumber,status,bookId,isbn,title,acquisitionId&#10;1001,AVAILABLE,1,..." />
              </Form.Item>
              <Button danger icon={<UploadOutlined />} onClick={handleImport}>
                Импортировать
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider />
      <Paragraph type="secondary" style={{ fontSize: 12 }}>
        PDF-отчёты поддерживают кириллицу. CSV сохраняется в UTF-8 с BOM для корректного открытия в Excel.
      </Paragraph>
    </AppLayout>
  );
};

export default ReportsPage;
