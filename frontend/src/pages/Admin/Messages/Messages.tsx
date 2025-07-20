import React from "react";
import { Card } from "antd";

const Messages: React.FC = () => {
  return (
    <Card title="信箱管理" style={{ margin: 24 }}>
      <p>这里是信箱管理模块，展示和处理所有用户申诉与消息。</p>
      {/* TODO: 集成申诉/消息管理表格与操作 */}
    </Card>
  );
};

export default Messages;
