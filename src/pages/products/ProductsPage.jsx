import { App, Button } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import DetailDrawer from '@/components/DetailDrawer';
import FormModal from '@/components/FormModal';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import { useCrud } from '@/hooks/useCrud';
import { productsResource as products } from '@/hooks/useResource';
import { useTableParams } from '@/hooks/useTableParams';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatMoney, formatNumber } from '@/utils/format';

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Home', 'Sports'];
const categoryOptions = CATEGORIES.map((c) => ({ label: c, value: c }));
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

/** @type {import('@/types').FieldConfig[]} */
const fields = [
  { name: 'name', label: 'Name', required: true, span: 16 },
  { name: 'sku', label: 'SKU', required: true, span: 8, props: { style: { textTransform: 'uppercase' } } },
  { name: 'category', label: 'Category', type: 'select', options: categoryOptions, span: 12 },
  { name: 'status', label: 'Status', type: 'select', options: statusOptions, required: true, span: 12 },
  { name: 'price', label: 'Price', type: 'money', required: true, span: 12 },
  {
    name: 'stock',
    label: 'Stock',
    type: 'number',
    required: true,
    span: 12,
    props: { min: 0, precision: 0 },
  },
  { name: 'description', label: 'Description', type: 'textarea' },
];

/** @type {import('@/types').FilterFieldConfig[]} */
const filterFields = [
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: categoryOptions,
    placeholder: 'Select category',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: statusOptions,
    placeholder: 'Select status',
  },
  {
    name: 'min_price',
    label: 'Min price',
    type: 'number',
    placeholder: 'Min $',
    props: { min: 0 },
  },
  {
    name: 'max_price',
    label: 'Max price',
    type: 'number',
    placeholder: 'Max $',
    props: { min: 0 },
  },
];

export default function ProductsPage() {
  const { message } = App.useApp();
  const { params, setParams } = useTableParams({ sort: '-created_at' });
  const crud = useCrud();

  const list = products.useList(params);
  const createMutation = products.useCreate();
  const updateMutation = products.useUpdate();
  const removeMutation = products.useRemove();

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: true },
    { title: 'SKU', dataIndex: 'sku', sorter: true },
    { title: 'Category', dataIndex: 'category', sorter: true },
    { title: 'Price', dataIndex: 'price', sorter: true, align: 'right', render: formatMoney },
    {
      title: 'Stock',
      dataIndex: 'stock',
      sorter: true,
      align: 'right',
      render: (v) => <span className={v < 10 ? 'font-medium text-danger' : ''}>{formatNumber(v)}</span>,
    },
    { title: 'Status', dataIndex: 'status', sorter: true, render: (v) => <StatusTag value={v} /> },
  ];

  const handleSubmit = async (values) => {
    try {
      if (crud.form.mode === 'create') {
        await createMutation.mutateAsync(values);
        message.success('Product created');
      } else {
        await updateMutation.mutateAsync({ id: crud.form.record.id, ...values });
        message.success('Product updated');
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
      message.success('Product deleted');
      crud.closeConfirm();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Your catalog"
        breadcrumbs={[{ title: 'Catalog' }, { title: 'Products' }]}
      />

      <DataTable
        columns={columns}
        data={list.data?.data}
        meta={list.data?.meta}
        loading={list.isFetching}
        params={params}
        onParamsChange={setParams}
        onRefresh={() => list.refetch()}
        searchPlaceholder="Search name, SKU or category"
        primaryAction={
          <Button type="primary" icon={<PlusOutlined />} onClick={crud.openCreate}>
            New product
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
        entity="product"
        fields={fields}
        initialValues={crud.form.record ?? { status: 'active', stock: 0 }}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onClose={crud.closeForm}
      />

      <ConfirmModal
        open={Boolean(crud.confirmRecord)}
        title="Delete product"
        okText="Delete"
        content={
          <>
            Delete <b>{crud.confirmRecord?.name}</b>? Products that already have orders cannot be deleted —
            set them inactive instead.
          </>
        }
        loading={removeMutation.isPending}
        onConfirm={handleDelete}
        onCancel={crud.closeConfirm}
      />

      <DetailDrawer
        open={Boolean(crud.detailRecord)}
        title={crud.detailRecord?.name ?? 'Product'}
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
          { label: 'SKU', key: 'sku' },
          { label: 'Category', key: 'category' },
          { label: 'Price', render: (r) => formatMoney(r.price) },
          { label: 'Stock', render: (r) => formatNumber(r.stock) },
          { label: 'Status', render: (r) => <StatusTag value={r.status} /> },
          { label: 'Description', key: 'description' },
          { label: 'Created', render: (r) => formatDate(r.created_at) },
          { label: 'Updated', render: (r) => formatDate(r.updated_at) },
        ]}
      />
    </>
  );
}
