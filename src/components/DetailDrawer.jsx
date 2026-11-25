import { Descriptions, Drawer, Skeleton } from 'antd';

/**
 * Read-only side panel showing a record as label/value pairs.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {Object|null} props.record
 * @param {Array<{label:string, key?:string, render?:(record:any)=>React.ReactNode, span?:number}>} props.items
 * @param {boolean} [props.loading]
 * @param {React.ReactNode} [props.extra]                header actions (e.g. an Edit button)
 * @param {() => void} props.onClose
 */
export default function DetailDrawer({
  open,
  title,
  record,
  items,
  loading = false,
  extra,
  onClose,
  width = 520,
}) {
  return (
    <Drawer open={open} title={title} onClose={onClose} width={width} extra={extra} destroyOnClose>
      {loading || !record ? (
        <Skeleton active />
      ) : (
        <Descriptions
          column={1}
          bordered
          size="small"
          labelStyle={{ width: 160 }}
          items={items.map((item) => ({
            key: item.key ?? item.label,
            label: item.label,
            span: item.span,
            children: item.render ? item.render(record) : (record[item.key] ?? '—'),
          }))}
        />
      )}
    </Drawer>
  );
}
