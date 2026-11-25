import { useEffect } from 'react';
import { Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import { applyFormErrors } from '@/utils/errors';

const resolve = (value, mode) => (typeof value === 'function' ? value(mode) : value);

/**
 * Generic create/edit modal driven by a field config.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {'create'|'edit'} [props.mode]
 * @param {string} [props.title]                       defaults to "Create {entity}" / "Edit {entity}"
 * @param {string} [props.entity]                      e.g. "Product"
 * @param {import('@/types').FieldConfig[]} props.fields
 * @param {Object} [props.initialValues]               record being edited, or defaults for create
 * @param {(values:Object) => Promise<any>} props.onSubmit   reject with an axios error to show 422 messages
 * @param {() => void} props.onClose
 * @param {boolean} [props.loading]
 * @param {number} [props.width]
 */
export default function FormModal({
  open,
  mode = 'create',
  title,
  entity = 'record',
  fields,
  initialValues,
  onSubmit,
  onClose,
  loading = false,
  width = 640,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (initialValues) {
      const values = { ...initialValues };
      fields
        .filter((f) => f.type === 'date' && values[f.name])
        .forEach((f) => {
          values[f.name] = dayjs(values[f.name]);
        });
      form.setFieldsValue(values);
    }
  }, [open, initialValues, fields, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // client-side validation errors are already shown
    }

    fields
      .filter((f) => f.type === 'date' && values[f.name])
      .forEach((f) => {
        values[f.name] = values[f.name].format('YYYY-MM-DD');
      });

    try {
      await onSubmit(values);
    } catch (error) {
      applyFormErrors(form, error);
      throw error; // let the caller show a toast too
    }
  };

  const visibleFields = fields.filter((f) => !resolve(f.hidden, mode));

  return (
    <Modal
      open={open}
      title={title ?? `${mode === 'create' ? 'Create' : 'Edit'} ${entity}`}
      okText={mode === 'create' ? 'Create' : 'Save changes'}
      onOk={() => handleOk().catch(() => {})}
      onCancel={onClose}
      confirmLoading={loading}
      width={width}
      destroyOnClose
      maskClosable={!loading}
    >
      <Form form={form} layout="vertical" requiredMark="optional" className="pt-2" disabled={loading}>
        <Row gutter={16}>
          {visibleFields.map((field) => {
            const required = resolve(field.required, mode);
            const rules = [
              ...(required ? [{ required: true, message: `${field.label} is required` }] : []),
              ...(field.type === 'email' ? [{ type: 'email', message: 'Enter a valid email' }] : []),
              ...(field.rules ?? []),
            ];
            return (
              <Col key={field.name} span={field.span ?? 24}>
                <Form.Item
                  name={field.name}
                  label={field.label}
                  rules={rules}
                  help={field.help}
                  valuePropName={field.type === 'switch' ? 'checked' : 'value'}
                >
                  {renderInput(field)}
                </Form.Item>
              </Col>
            );
          })}
        </Row>
      </Form>
    </Modal>
  );
}

function renderInput(field) {
  const common = { placeholder: field.placeholder, ...field.props };
  switch (field.type) {
    case 'password':
      return <Input.Password autoComplete="new-password" {...common} />;
    case 'textarea':
      return <Input.TextArea rows={3} {...common} />;
    case 'number':
      return <InputNumber className="w-full" {...common} />;
    case 'money':
      return <InputNumber className="w-full" min={0} step={0.01} precision={2} prefix="$" {...common} />;
    case 'select':
      return (
        <Select
          options={field.options}
          showSearch
          optionFilterProp="label"
          allowClear={!field.required}
          {...common}
        />
      );
    case 'switch':
      return <Switch {...field.props} />;
    case 'date':
      return <DatePicker className="w-full" {...common} />;
    case 'email':
      return <Input type="email" autoComplete="off" {...common} />;
    default:
      return <Input {...common} />;
  }
}
