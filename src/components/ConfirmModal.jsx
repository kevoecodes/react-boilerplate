import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

/**
 * Controlled confirmation dialog (e.g. before deleting a record).
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} [props.title]
 * @param {React.ReactNode} [props.content]
 * @param {string} [props.okText]
 * @param {boolean} [props.danger]
 * @param {boolean} [props.loading]
 * @param {() => void|Promise<void>} props.onConfirm
 * @param {() => void} props.onCancel
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  content,
  okText = 'Confirm',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={okText}
      okButtonProps={{ danger }}
      confirmLoading={loading}
      width={420}
      title={
        <span className="flex items-center gap-2">
          <ExclamationCircleFilled className={danger ? 'text-danger' : 'text-warning'} />
          {title}
        </span>
      }
    >
      <div className="text-muted">{content}</div>
    </Modal>
  );
}
