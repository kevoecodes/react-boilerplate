import { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Drawer, Input, InputNumber, Row, Select } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

/**
 * Right-side filter drawer driven by a field config.
 * Draft values are edited locally; Search applies them via `onApply`.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {import('@/types').FilterFieldConfig[]} [props.fields]
 * @param {Record<string, any>} [props.values]   applied filter map from list params
 * @param {(filter: Record<string, any>) => void} props.onApply
 * @param {() => void} props.onReset
 */
export default function FilterDrawer({ open, onClose, fields = [], values = {}, onApply, onReset }) {
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (!open) return;
    setDraft(filterToDraft(fields, values));
  }, [open, fields, values]);

  const setField = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onApply(draftToFilter(fields, draft));
    onClose();
  };

  const handleReset = () => {
    setDraft(emptyDraft(fields));
    onReset();
  };

  return (
    <Drawer
      title="Filters"
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      destroyOnClose={false}
      footer={
        <div className="flex flex-nowrap items-center justify-end gap-2">
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Search
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      <Row gutter={[0, 16]}>
        {fields.map((field) => (
          <Col key={field.name} span={24}>
            {field.label ? <div className="mb-1 text-sm text-muted">{field.label}</div> : null}
            {renderField(field, draft, setField)}
          </Col>
        ))}
      </Row>
    </Drawer>
  );
}

function emptyDraft(fields) {
  return Object.fromEntries(fields.map((f) => [f.name, f.type === 'dateRange' ? null : undefined]));
}

function filterToDraft(fields, values) {
  const draft = {};
  fields.forEach((field) => {
    if (field.type === 'dateRange') {
      const [fromKey, toKey] = field.keys ?? ['from', 'to'];
      const from = values[fromKey] ? dayjs(values[fromKey]) : null;
      const to = values[toKey] ? dayjs(values[toKey]) : null;
      draft[field.name] = from || to ? [from, to] : null;
    } else if (field.type === 'date') {
      draft[field.name] = values[field.name] ? dayjs(values[field.name]) : null;
    } else {
      draft[field.name] = values[field.name];
    }
  });
  return draft;
}

function draftToFilter(fields, draft) {
  const filter = {};
  fields.forEach((field) => {
    const value = draft[field.name];
    if (field.type === 'dateRange') {
      const [fromKey, toKey] = field.keys ?? ['from', 'to'];
      const from = value?.[0]?.format?.('YYYY-MM-DD');
      const to = value?.[1]?.format?.('YYYY-MM-DD');
      if (from) filter[fromKey] = from;
      if (to) filter[toKey] = to;
    } else if (field.type === 'date') {
      const formatted = value?.format?.('YYYY-MM-DD');
      if (formatted) filter[field.name] = formatted;
    } else if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      filter[field.name] = value;
    }
  });
  return filter;
}

function renderField(field, draft, setField) {
  const value = draft[field.name];
  const common = { placeholder: field.placeholder, className: 'w-full', ...field.props };

  switch (field.type) {
    case 'select':
      return (
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          options={field.options}
          value={value}
          onChange={(v) => setField(field.name, v)}
          mode={field.mode}
          maxTagCount={field.mode === 'multiple' ? 'responsive' : undefined}
          {...common}
        />
      );
    case 'number':
      return (
        <InputNumber
          className="w-full"
          value={value}
          onChange={(v) => setField(field.name, v)}
          {...common}
        />
      );
    case 'date':
      return (
        <DatePicker
          className="w-full"
          value={value}
          onChange={(v) => setField(field.name, v)}
          {...common}
        />
      );
    case 'dateRange':
      return (
        <DatePicker.RangePicker
          className="w-full"
          value={value}
          allowEmpty={[true, true]}
          onChange={(v) => setField(field.name, v)}
          {...common}
        />
      );
    default:
      return (
        <Input
          allowClear
          value={value}
          onChange={(e) => setField(field.name, e.target.value)}
          {...common}
        />
      );
  }
}

/** True when the applied filter map has any meaningful value. */
export function hasActiveFilters(filter = {}) {
  return Object.values(filter).some((v) => {
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });
}
