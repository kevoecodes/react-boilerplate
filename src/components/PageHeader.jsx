import { Breadcrumb, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';

/**
 * Page title row with optional breadcrumbs and action buttons.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} [props.subtitle]
 * @param {Array<{title:string, path?:string}>} [props.breadcrumbs]
 * @param {React.ReactNode} [props.actions]
 */
export default function PageHeader({ title, subtitle, breadcrumbs, actions }) {
  return (
    <div className="mb-4">
      {breadcrumbs?.length > 0 && (
        <Breadcrumb
          className="mb-2"
          items={breadcrumbs.map((b) => ({ title: b.path ? <Link to={b.path}>{b.title}</Link> : b.title }))}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} className="!mb-0">
            {title}
          </Typography.Title>
          {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
        </div>
        {actions && <Space wrap>{actions}</Space>}
      </div>
    </div>
  );
}
