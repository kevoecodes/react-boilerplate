import { useMemo } from 'react';
import { App, Button } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import DetailDrawer from '@/components/DetailDrawer';
import FormModal from '@/components/FormModal';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import { useCrud } from '@/hooks/useCrud';
import {
  ordersResource as orders,
  productsResource,
  usersResource,
  useResourceOptions,
} from '@/hooks/useResource';
import { useTableParams } from '@/hooks/useTableParams';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatMoney, titleCase } from '@/utils/format';

const STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const statusOptions = STATUSES.map((s) => ({ label: titleCase(s), value: s }));

/** @type {import('@/types').FilterFieldConfig[]} */
const filterFields = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    mode: 'multiple',
    options: statusOptions,
    placeholder: 'Select status',
  },
  {
    name: 'date_range',
    label: 'Date range',
    type: 'dateRange',
    keys: ['from', 'to'],
  },
];

export default function OrdersPage() {
  const { message } = App.useApp();
  const { params, setParams } = useTableParams({ sort: '-created_at' });
  const crud = useCrud();

  const list = orders.useList(params);
  const createMutation = orders.useCreate();
  const updateMutation = orders.useUpdate();
  const removeMutation = orders.useRemove();

  const users = useResourceOptions(usersResource, (u) => ({ label: `${u.name} (${u.email})`, value: u.id }), {
    sort: 'name',
  });
  const products = useResourceOptions(
    productsResource,
    (p) => ({ label: `${p.name} — ${formatMoney(p.price)}`, value: p.id }),
    { sort: 'name', filter: { status: 'active' } },
  );

  /** @type {import('@/types').FieldConfig[]} */
  const fields = useMemo(
    () => [
      {
        name: 'user_id',
        label: 'Customer',
        type: 'select',
        options: users.options,
        required: true,
        props: { loading: users.loading },
      },
      {
        name: 'product_id',
        label: 'Product',
        type: 'select',
        options: products.options,
        required: true,
        props: { loading: products.loading },
      },
      {
        name: 'quantity',
        label: 'Quantity',
        type: 'number',
        required: true,
        span: 8,
        props: { min: 1, precision: 0 },
      },
      {
        name: 'unit_price',
        label: 'Unit price',
        type: 'money',
        span: 8,
        placeholder: 'Product price',
        help: 'Leave empty to use the product price',
      },
      { name: 'status', label: 'Status', type: 'select', options: statusOptions, required: true, span: 8 },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    [users.options, users.loading, products.options, products.loading],
  );

  const columns = [
    { title: 'Order #', dataIndex: 'order_number', sorter: true },
    { title: 'Customer', key: 'user', render: (_, r) => r.user?.name },
    { title: 'Product', key: 'product', render: (_, r) => r.product?.name },
    { title: 'Qty', dataIndex: 'quantity', sorter: true, align: 'right' },
    { title: 'Total', dataIndex: 'total', sorter: true, align: 'right', render: formatMoney },
    { title: 'Status', dataIndex: 'status', sorter: true, render: (v) => <StatusTag value={v} /> },
    { title: 'Date', dataIndex: 'created_at', sorter: true, render: (v) => formatDate(v, 'MMM D, YYYY') },
  ];

  const handleSubmit = async (values) => {
    const payload = { ...values, unit_price: values.unit_price ?? null };
    try {
      if (crud.form.mode === 'create') {
        await createMutation.mutateAsync(payload);
        message.success('Order created');
      } else {
        await updateMutation.mutateAsync({ id: crud.form.record.id, ...payload });
        message.success('Order updated');
      }
      crud.closeForm();
    } catch (error) {
      message.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await removeMutation.mutateAsync(crud.confirmRecord.id);
      message.success('Order deleted');
      crud.closeConfirm();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Track and update customer orders"
        breadcrumbs={[{ title: 'Sales' }, { title: 'Orders' }]}
      />

      <DataTable
        columns={columns}
        data={list.data?.data}
        meta={list.data?.meta}
        loading={list.isFetching}
        params={params}
        onParamsChange={setParams}
        onRefresh={() => list.refetch()}
        searchPlaceholder="Search order #, customer or product"
        primaryAction={
          <Button type="primary" icon={<PlusOutlined />} onClick={crud.openCreate}>
            New order
          </Button>
        }
        filterFields={filterFields}
        rowActions={[
          { key: 'view', label: 'View', icon: <EyeOutlined />, onClick: crud.openDetail },
          { key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: crud.openEdit },
          { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: crud.askDelete },
        ]}
        inlineActions={3}
      />

      <FormModal
        open={crud.form.open}
        mode={crud.form.mode}
        entity="order"
        fields={fields}
        initialValues={crud.form.record ?? { status: 'pending', quantity: 1 }}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onClose={crud.closeForm}
      />

      <ConfirmModal
        open={Boolean(crud.confirmRecord)}
        title="Delete order"
        okText="Delete"
        content={
          <>
            Delete order <b>{crud.confirmRecord?.order_number}</b>? This cannot be undone.
          </>
        }
        loading={removeMutation.isPending}
        onConfirm={handleDelete}
        onCancel={crud.closeConfirm}
      />

      <DetailDrawer
        open={Boolean(crud.detailRecord)}
        title={`Order ${crud.detailRecord?.order_number ?? ''}`}
        record={crud.detailRecord}
        onClose={crud.closeDetail}
        extra={
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              crud.openEdit(crud.detailRecord);
              crud.closeDetail();
            }}
          >
            Edit
          </Button>
        }
        items={[
          { label: 'Customer', render: (r) => `${r.user?.name} (${r.user?.email})` },
          { label: 'Product', render: (r) => `${r.product?.name} · ${r.product?.sku}` },
          { label: 'Quantity', key: 'quantity' },
          { label: 'Unit price', render: (r) => formatMoney(r.unit_price) },
          { label: 'Total', render: (r) => <b>{formatMoney(r.total)}</b> },
          { label: 'Status', render: (r) => <StatusTag value={r.status} /> },
          { label: 'Notes', key: 'notes' },
          { label: 'Created', render: (r) => formatDate(r.created_at) },
        ]}
      />
    </>
  );
}
