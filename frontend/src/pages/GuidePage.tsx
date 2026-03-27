import { CarOutlined, ClockCircleOutlined, EnvironmentOutlined, LinkOutlined, TagsOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Skeleton, Typography } from "antd";
import { useEffect, useState } from "react";

import { api } from "../api/services";
import type { GuideInfo } from "../api/types";

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
        <Typography.Title level={2}>参观指南</Typography.Title>
        <Typography.Paragraph>出发前可先确认开放时间、到馆方式与票务说明，减少现场等待。</Typography.Paragraph>
      </div>
      {loading || !data ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card className="soft-card info-card" title="开放时间">
              <Typography.Paragraph>
                <ClockCircleOutlined /> {data.open_hours}
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="soft-card info-card" title="馆址信息">
              <Typography.Paragraph>
                <EnvironmentOutlined /> {data.address}
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="soft-card info-card" title="交通方式">
              <Typography.Paragraph>
                <CarOutlined /> {data.traffic_guide}
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="soft-card info-card" title="票务说明">
              <Typography.Paragraph>
                <TagsOutlined /> {data.ticket_info}
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col span={24}>
            <Card className="soft-card info-card" title="参观须知">
              <Typography.Paragraph>{data.visit_tips}</Typography.Paragraph>
              <Button type="primary" icon={<LinkOutlined />} href={data.map_link} target="_blank">
                打开地图导航
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
