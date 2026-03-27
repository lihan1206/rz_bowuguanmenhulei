import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Input, Row, Skeleton, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../api/services";
import type { ExhibitItem } from "../api/types";

export function ExhibitsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ExhibitItem[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setRows(await api.exhibits(params.get("q") ?? ""));
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  return (
    <div className="page-wrap">
      <div className="page-banner">
        <Typography.Title level={2}>展品展示</Typography.Title>
        <Typography.Paragraph>按名称、年代、展厅或类别检索馆内展品，进入详情页后可查看说明与观众评论。</Typography.Paragraph>
        <Input
          size="large"
          value={keyword}
          prefix={<SearchOutlined />}
          placeholder="请输入展品关键词"
          onChange={(event) => setKeyword(event.target.value)}
          onPressEnter={() => setParams(keyword ? { q: keyword } : {})}
        />
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : rows.length === 0 ? (
        <Empty description="没有找到匹配展品" />
      ) : (
        <Row gutter={[20, 20]}>
          {rows.map((item) => (
            <Col xs={24} md={12} xl={8} key={item.id}>
              <Card
                hoverable
                className="soft-card exhibit-card"
                cover={<img alt={item.name} src={item.image_url} className="cover-img" />}
                onClick={() => navigate(`/exhibits/${item.id}`)}
              >
                <Space wrap>
                  <Tag color="gold">{item.category}</Tag>
                  <Tag>{item.era}</Tag>
                  <Tag color="cyan">{item.comments_count} 条评论</Tag>
                </Space>
                <Typography.Title level={4}>{item.name}</Typography.Title>
                <Typography.Paragraph className="clamp-3">{item.summary}</Typography.Paragraph>
                <Space className="meta-line">
                  <EnvironmentOutlined />
                  <span>{item.hall_name}</span>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

