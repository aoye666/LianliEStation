import React from "react";
import { Card } from "antd";

const Market: React.FC = () => {
  return (
    <Card title="商城管理" style={{ margin: 24 }}>
      <p>这里是商城管理模块，可对商品进行审核、删除、查看详情等操作。</p>
      {/* TODO: 集成商品管理表格与操作 */}
    </Card>
  );
};

export default Market;
