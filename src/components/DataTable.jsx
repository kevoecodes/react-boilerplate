import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Dropdown, Input, Space, Table, Tooltip } from 'antd';
import { FilterOutlined, MoreOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import FilterDrawer, { hasActiveFilters } from '@/components/FilterDrawer';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Server-side table: pagination, sorting and search are sent to the API via `onParamsChange`.
 *
 * @param {Object} props
 * @param {import('antd').TableColumnsType<any>} props.columns  set `sorter: true` to make a column sortable
 *                                                              (its `dataIndex` or `sortKey` is sent as ?sort=)
 * @param {any[]} [props.data]
 * @param {import('@/types').PaginationMeta} [props.meta]
 * @param {boolean} [props.loading]
 * @param {import('@/types').ListParams} props.params         current params (from useTableParams)
 * @param {(patch: Partial<import('@/types').ListParams>) => void} props.onParamsChange
 * @param {import('@/types').FilterFieldConfig[]} [props.filterFields]  fields for the right filter drawer
 * @param {React.ReactNode} [props.primaryAction]              main action (e.g. New) left of the filter icon
 * @param {React.ReactNode} [props.toolbar]                    extra buttons on the right of the toolbar
 * @param {Array<{key:string,label:string,icon?:React.ReactNode,danger?:boolean,
 *   onClick:(record:any)=>void, hidden?:(record:any)=>boolean}>} [props.rowActions]
 * @param {number} [props.inlineActions=2]                    how many actions to show as icons before "more"
 * @param {() => void} [props.onRefresh]
 * @param {string} [props.searchPlaceholder]
 * @param {string|((r:any)=>string|number)} [props.rowKey='id']
 */
export default function DataTable({
  columns,
  data = [],
  meta,
  loading = false,
  params,
  onParamsChange,
  filterFields = [],
  primaryAction,
  toolbar,
  rowActions = [],
  inlineActions = 2,
  onRefresh,
  searchPlaceholder = 'Search…',
  rowKey = 'id',
  ...tableProps
}) {
  const [search, setSearch] = useState(params.search ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if ((params.search ?? '') !== debouncedSearch) {
      onParamsChange({ search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep the input in sync if params are reset from outside.
  useEffect(() => {
    setSearch(params.search ?? '');
  }, [params.search]);

  const currentPage = meta?.current_page ?? params.page ?? 1;
  const pageSize = meta?.per_page ?? params.per_page ?? 10;
  const filtersActive = hasActiveFilters(params.filter);

  const sortField = params.sort?.replace(/^-/, '');
  const sortOrder = params.sort ? (params.sort.startsWith('-') ? 'descend' : 'ascend') : null;

  const enhancedColumns = useMemo(() => {
    const snColumn = {
      title: 'Sn',
      key: '__sn',
      width: 64,
      render: (_value, _record, index) => (currentPage - 1) * pageSize + index + 1,
    };

    const cols = [
      snColumn,
      ...columns.map((col) => {
        if (!col.sorter) return col;
        const key = col.sortKey ?? (Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex);
        return { ...col, sorter: true, sortOrder: sortField === key ? sortOrder : null };
      }),
    ];

    if (rowActions.length) {
      cols.push({
        title: 'Actions',
        key: '__actions',
        fixed: 'right',
        align: 'right',
        width: 64 + Math.min(rowActions.length, inlineActions) * 36,
        render: (_, record) => <RowActions actions={rowActions} record={record} inline={inlineActions} />,
      });
    }

    return cols;
  }, [columns, currentPage, pageSize, sortField, sortOrder, rowActions, inlineActions]);

  const handleChange = (pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const col = s?.column;
    const key = col
      ? (col.sortKey ?? (Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex))
      : null;
    const sort = key && s.order ? `${s.order === 'descend' ? '-' : ''}${key}` : undefined;

    if (sort !== params.sort) {
      onParamsChange({ sort });
    } else {
      onParamsChange({ page: pagination.current, per_page: pagination.pageSize });
    }
  };

  const handleApplyFilters = (filter) => {
    onParamsChange({ filter });
  };

  const handleResetFilters = () => {
    onParamsChange({ filter: {} });
  };

  return (
    <Card bordered={false} className="shadow-sm" styles={{ body: { padding: 0 } }}>
      <div className="flex flex-wrap items-center gap-3 border-0 border-b border-solid border-border p-4">
        <Input
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined className="text-muted" />}
          placeholder={searchPlaceholder}
          className="w-full sm:w-72"
        />
        <div className="ml-auto flex items-center gap-2">
          {primaryAction}
          {filterFields.length > 0 && (
            <Tooltip title="Filter">
              <Button
                icon={<FilterOutlined />}
                aria-label="Filter"
                onClick={() => setFiltersOpen(true)}
                className={
                  filtersActive || filtersOpen
                    ? '!border-primary !text-primary !bg-primary/5'
                    : undefined
                }
              />
            </Tooltip>
          )}
          {toolbar}
          {onRefresh && (
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} />
            </Tooltip>
          )}
        </div>
      </div>
      <Table
        rowKey={rowKey}
        columns={enhancedColumns}
        dataSource={data}
        loading={loading}
        onChange={handleChange}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: currentPage,
          pageSize,
          total: meta?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
          showTotal: (total, [from, to]) => `${from}-${to} of ${total}`,
          className: '!px-4',
        }}
        {...tableProps}
      />

      {filterFields.length > 0 && (
        <FilterDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          fields={filterFields}
          values={params.filter ?? {}}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      )}
    </Card>
  );
}

function RowActions({ actions, record, inline }) {
  const visible = actions.filter((a) => !a.hidden?.(record));
  const shown = visible.slice(0, inline);
  const overflow = visible.slice(inline);

  return (
    <Space size={4}>
      {shown.map((action) => (
        <Tooltip key={action.key} title={action.label}>
          <Button
            type="text"
            size="small"
            danger={action.danger}
            icon={action.icon}
            aria-label={action.label}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(record);
            }}
          />
        </Tooltip>
      ))}
      {overflow.length > 0 && (
        <Dropdown
          trigger={['click']}
          menu={{
            items: overflow.map((a) => ({ key: a.key, label: a.label, icon: a.icon, danger: a.danger })),
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              overflow.find((a) => a.key === key)?.onClick(record);
            },
          }}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      )}
    </Space>
  );
}
