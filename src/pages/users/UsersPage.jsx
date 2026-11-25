import { App, Button } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ConfirmModal from '@/components/ConfirmModal';
import DataTable from '@/components/DataTable';
import DetailDrawer from '@/components/DetailDrawer';
import FormModal from '@/components/FormModal';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import { useAuth } from '@/hooks/useAuth';
import { useCrud } from '@/hooks/useCrud';
import { usersResource as users } from '@/hooks/useResource';
import { useTableParams } from '@/hooks/useTableParams';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

/** @type {import('@/types').FieldConfig[]} */
const fields = [
  { name: 'name', label: 'Name', required: true, span: 12 },
  { name: 'email', label: 'Email', type: 'email', required: true, span: 12 },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: (mode) => mode === 'create',
    placeholder: 'At least 8 characters',
    rules: [{ min: 8, message: 'At least 8 characters' }],
    span: 12,
  },
  { name: 'role', label: 'Role', type: 'select', options: roleOptions, required: true, span: 12 },
  { name: 'is_active', label: 'Active', type: 'switch' },
];

/** @type {import('@/types').FilterFieldConfig[]} */
const filterFields = [
  { name: 'role', label: 'Role', type: 'select', options: roleOptions, placeholder: 'Select role' },
  {
    name: 'is_active',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'true' },
      { label: 'Inactive', value: 'false' },
    ],
    placeholder: 'Select status',
  },
];

export default function UsersPage() {
  const { message } = App.useApp();
  const { user: me } = useAuth();
  const { params, setParams } = useTableParams({ sort: '-created_at' });
  const crud = useCrud();

  const list = users.useList(params);
  const createMutation = users.useCreate();
  const updateMutation = users.useUpdate();
  const removeMutation = users.useRemove();

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: true },
    { title: 'Email', dataIndex: 'email', sorter: true },
    { title: 'Role', dataIndex: 'role', sorter: true, render: (v) => <StatusTag value={v} /> },
    {
      title: 'Status',
      dataIndex: 'is_active',
      sorter: true,
      render: (v) => <StatusTag value={v ? 'active' : 'inactive'} />,
    },
    { title: 'Orders', dataIndex: 'orders_count', align: 'right' },
    { title: 'Created', dataIndex: 'created_at', sorter: true, render: (v) => formatDate(v, 'MMM D, YYYY') },
  ];

  const handleSubmit = async (values) => {
    try {
      if (crud.form.mode === 'create') {
        await createMutation.mutateAsync(values);
        message.success('User created');
      } else {
        await updateMutation.mutateAsync({ id: crud.form.record.id, ...values });
        message.success('User updated');
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
      message.success('User deleted');
      crud.closeConfirm();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage who can sign in"
        breadcrumbs={[{ title: 'Administration' }, { title: 'Users' }]}
      />

      <DataTable
        columns={columns}
        data={list.data?.data}
        meta={list.data?.meta}
        loading={list.isFetching}
        params={params}
        onParamsChange={setParams}
        onRefresh={() => list.refetch()}
        searchPlaceholder="Search name or email"
        onRow={(record) => ({ onDoubleClick: () => crud.openDetail(record) })}
        primaryAction={
          <Button type="primary" icon={<PlusOutlined />} onClick={crud.openCreate}>
            New user
          </Button>
        }
        filterFields={filterFields}
        rowActions={[
          { key: 'view', label: 'View', icon: <EyeOutlined />, onClick: crud.openDetail },
          { key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: crud.openEdit },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: crud.askDelete,
            hidden: (r) => r.id === me?.id,
          },
        ]}
        inlineActions={3}
      />

      <FormModal
        open={crud.form.open}
        mode={crud.form.mode}
        entity="user"
        fields={fields}
        initialValues={crud.form.record ?? { role: 'user', is_active: true }}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onClose={crud.closeForm}
      />

      <ConfirmModal
        open={Boolean(crud.confirmRecord)}
        title="Delete user"
        okText="Delete"
        content={
          <>
            Delete <b>{crud.confirmRecord?.name}</b> and all of their orders? This cannot be undone.
          </>
        }
        loading={removeMutation.isPending}
        onConfirm={handleDelete}
        onCancel={crud.closeConfirm}
      />

      <DetailDrawer
        open={Boolean(crud.detailRecord)}
        title="User details"
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
          { label: 'ID', key: 'id' },
          { label: 'Name', key: 'name' },
          { label: 'Email', key: 'email' },
          { label: 'Role', render: (r) => <StatusTag value={r.role} /> },
          { label: 'Status', render: (r) => <StatusTag value={r.is_active ? 'active' : 'inactive'} /> },
          { label: 'Orders', key: 'orders_count' },
          { label: 'Created', render: (r) => formatDate(r.created_at) },
          { label: 'Updated', render: (r) => formatDate(r.updated_at) },
        ]}
      />
    </>
  );
}
