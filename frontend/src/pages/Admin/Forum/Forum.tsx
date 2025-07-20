import React from "react";
import { Card } from "antd";

const Forum: React.FC = () => {
  return (
    <Card title="校园墙管理" style={{ margin: 24 }}>
      <p>这里是校园墙管理模块，可对帖子进行审核、删除、查看详情等操作。</p>
      {/* TODO: 集成帖子管理表格与操作 */}
    </Card>
  );
};

export default Forum;
