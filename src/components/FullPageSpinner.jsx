import { Spin } from 'antd';

export default function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <Spin size="large" />
    </div>
  );
}
