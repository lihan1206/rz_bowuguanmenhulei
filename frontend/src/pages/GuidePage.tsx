import { CarOutlined, ClockCircleOutlined, EnvironmentOutlined, LinkOutlined, TagsOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Skeleton, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { api } from "../api/services";
import type { GuideInfo } from "../api/types";

function GuideCard({
  title,
  icon,
  content,
}: {
  title: string;
  icon: ReactNode;
  content: string;
}) {
  return (
    <Card className="soft-card info-card" title={title}>
      <Space align="start" className="guide-card-head">
        <span className="guide-card-icon">{icon}</span>
        <Typography.Paragraph>{content}</Typography.Paragraph>
      </Space>
    </Card>
  );
}

export function GuidePage() {
  const [data, setData] = useState<GuideInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await api.guide());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page-wrap">
      <div className="page-banner">
        <div className="banner-copy">
          <Typography.Title level={2}>参观指南</Typography.Title>
          <Typography.Paragraph>
            出发前先确认开放时间、到馆方式和票务说明，可以让你的行程更从容。
          </Typography.Paragraph>
        </div>
      </div>

      {loading || !data ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <GuideCard title="开放时间" icon={<ClockCircleOutlined />} content={data.open_hours} />
          </Col>
          <Col xs={24} md={12}>
            <GuideCard title="馆址信息" icon={<EnvironmentOutlined />} content={data.address} />
          </Col>
          <Col xs={24} md={12}>
            <GuideCard title="交通方式" icon={<CarOutlined />} content={data.traffic_guide} />
          </Col>
          <Col xs={24} md={12}>
            <GuideCard title="票务说明" icon={<TagsOutlined />} content={data.ticket_info} />
          </Col>
          <Col span={24}>
            <Card className="soft-card info-card" title="参观提示">
              <Typography.Paragraph>{data.visit_tips}</Typography.Paragraph>
              <Button type="primary" icon={<LinkOutlined />} href={data.map_link} target="_blank" rel="noreferrer">
                打开地图导航
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
