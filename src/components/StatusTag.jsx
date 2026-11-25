import { Tag } from 'antd';
import { titleCase } from '@/utils/format';

const COLORS = {
  active: 'green',
  inactive: 'default',
  pending: 'gold',
  processing: 'blue',
  completed: 'green',
  cancelled: 'red',
  admin: 'purple',
  user: 'default',
};

export default function StatusTag({ value }) {
  return <Tag color={COLORS[value] ?? 'default'}>{titleCase(String(value ?? ''))}</Tag>;
}
