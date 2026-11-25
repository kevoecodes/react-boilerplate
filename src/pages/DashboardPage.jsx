import { Alert, Card, Col, Progress, Row, Statistic, Table } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, ShoppingOutlined, TeamOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/resource';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatMoney, titleCase } from '@/utils/format';

const STATUS_COLORS = {
  pending: '#d97706',
  processing: '#0284c7',
  completed: '#16a34a',
  cancelled: '#dc2626',
};

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats });

  const cards = [
    {
      title: 'Users',
      value: data?.users,
      hint: `${data?.active_users ?? 0} active`,
      icon: <TeamOutlined />,
      color: 'bg-indigo-50 text-primary',
    },
    {
      title: 'Products',
      value: data?.products,
      hint: `${data?.low_stock_products ?? 0} low on stock`,
      icon: <ShoppingOutlined />,
      color: 'bg-sky-50 text-info',
    },
    {
      title: 'Orders',
      value: data?.orders,
      hint: `${data?.pending_orders ?? 0} pending`,
      icon: <ShoppingCartOutlined />,
      color: 'bg-amber-50 text-warning',
    },
    {
      title: 'Revenue',
      value: data?.revenue,
      formatter: (v) => formatMoney(v),
      hint: 'Completed orders',
      icon: <DollarOutlined />,
      color: 'bg-green-50 text-success',
    },
  ];

  const byStatus = data?.orders_by_status ?? {};
  const totalOrders = data?.orders || 0;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your store" />

      {error && <Alert type="error" showIcon className="mb-4" message={getErrorMessage(error)} />}

      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col key={card.title} xs={24} sm={12} xl={6}>
            <Card bordered={false} className="shadow-sm" loading={isLoading}>
              <div className="flex items-start justify-between">
                <Statistic title={card.title} value={card.value ?? 0} formatter={card.formatter} />
                <span className={`flex h-10 w-10 items-center justify-center rounded text-lg ${card.color}`}>
                  {card.icon}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted">{card.hint}</div>
            </Card>
          </Col>
        ))}

        <Col xs={24} lg={8}>
          <Card bordered={false} className="h-full shadow-sm" title="Orders by status" loading={isLoading}>
            {Object.keys(STATUS_COLORS).map((status) => {
              const count = Number(byStatus[status] ?? 0);
              return (
                <div key={status} className="mb-3">
                  <div className="flex justify-between text-sm">
                    <span>{titleCase(status)}</span>
                    <span className="text-muted">{count}</span>
                  </div>
                  <Progress
                    percent={totalOrders ? Math.round((count / totalOrders) * 100) : 0}
                    strokeColor={STATUS_COLORS[status]}
                    showInfo={false}
                    size="small"
                  />
                </div>
              );
            })}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="h-full shadow-sm"
            title="Recent orders"
            styles={{ body: { padding: 0 } }}
          >
            <Table
              rowKey="id"
              size="middle"
              loading={isLoading}
              pagination={false}
              dataSource={data?.recent_orders ?? []}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Order', dataIndex: 'order_number' },
                { title: 'Customer', render: (_, r) => r.user?.name },
                { title: 'Total', dataIndex: 'total', align: 'right', render: formatMoney },
                { title: 'Status', dataIndex: 'status', render: (v) => <StatusTag value={v} /> },
                { title: 'Date', dataIndex: 'created_at', render: (v) => formatDate(v, 'MMM D, YYYY') },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
