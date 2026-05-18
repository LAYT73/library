import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Form, Input, Button, Select, InputNumber, message, Space, Divider } from 'antd';
import { downloadFundReport, downloadCoverageReport, importFundCsv } from '../../entities/report/api';

export const ReportsPage: React.FC = () => {
  const [form] = Form.useForm();

  const triggerDownload = async (kind: 'fund' | 'coverage') => {
    try {
      const values = await form.validateFields();
      const format = kind === 'fund' ? (values.fundFormat || 'csv') : (values.coverageFormat || 'csv');
      const blob =
        kind === 'fund'
          ? await downloadFundReport(format)
          : await downloadCoverageReport(Number(values.disciplineId), format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = kind === 'fund' ? `fund-report.${format}` : `coverage-report.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Не удалось скачать отчёт');
    }
  };

  const handleImport = async () => {
    const values = await form.validateFields(['csv']);
    try {
      await importFundCsv(values.csv);
      message.success('CSV импортирован');
    } catch {
      message.error('Не удалось импортировать CSV');
    }
  };

  return (
    <AppLayout>
      <Card title="Отчёты">
        <Form form={form} layout="vertical">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <h3>Выгрузка фондового отчёта</h3>
              <Form.Item name="fundFormat" label="Формат" initialValue="csv">
                <Select
                  options={[
                    { value: 'csv', label: 'CSV' },
                    { value: 'xlsx', label: 'XLSX' },
                    { value: 'pdf', label: 'PDF' },
                  ]}
                />
              </Form.Item>
              <Button type="primary" onClick={() => triggerDownload('fund')}>
                Скачать фондовый отчёт
              </Button>
            </div>

            <Divider />

            <div>
              <h3>Выгрузка отчёта по обеспеченности</h3>
              <Form.Item name="disciplineId" label="ID дисциплины" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="coverageFormat" label="Формат" initialValue="csv">
                <Select
                  options={[
                    { value: 'csv', label: 'CSV' },
                    { value: 'xlsx', label: 'XLSX' },
                    { value: 'pdf', label: 'PDF' },
                  ]}
                />
              </Form.Item>
              <Button onClick={() => triggerDownload('coverage')}>
                Скачать отчёт по обеспеченности
              </Button>
            </div>

            <Divider />

            <div>
              <h3>Импорт фондового CSV</h3>
              <Form.Item name="csv" label="CSV содержимое" rules={[{ required: true }]}>
                <Input.TextArea rows={8} placeholder="Вставьте CSV сюда" />
              </Form.Item>
              <Button danger onClick={handleImport}>
                Импортировать CSV
              </Button>
            </div>
          </Space>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default ReportsPage;
