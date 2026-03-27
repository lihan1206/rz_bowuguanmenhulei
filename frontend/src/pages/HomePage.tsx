import { ArrowRightOutlined, CalendarOutlined, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, List, Row, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/services";
import type { HomePayload } from "../api/types";

export function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setData(await api.home());
      } catch (error) {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page-wrap">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-wrap">
        <Card className="soft-card">首页数据加载失败，请稍后刷新重试。</Card>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <section className="hero-banner">
        <div>
          <Typography.Title level={1}>博物馆门户类软件</Typography.Title>
          <Typography.Paragraph>
            汇聚展品、展览、参观指南与预约服务，让公众用更轻松的方式走进真实的馆藏与展陈。
          </Typography.Paragraph>
          <Space wrap>
            <Button type="primary" size="large" onClick={() => navigate("/visits")}>
              立即预约
            </Button>
            <Button size="large" onClick={() => navigate("/exhibitions")}>
              查看近期展览
            </Button>
          </Space>
        </div>
        <div className="hero-search">
          <Typography.Title level={4}>馆内快速搜索</Typography.Title>
          <Input
            size="large"
            value={keyword}
            prefix={<SearchOutlined />}
            placeholder="搜索展品名称、年代或展厅"
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={() => navigate(`/exhibits?q=${encodeURIComponent(keyword)}`)}
          />
          <div className="stats-strip">
            <div>
              <strong>{data.total_exhibits}</strong>
              <span>馆藏展品</span>
            </div>
            <div>
              <strong>{data.total_exhibitions}</strong>
              <span>在档展览</span>
            </div>
          </div>
        </div>
      </section>

      <section className="block-section">
        <div className="section-head">
          <Typography.Title level={3}>推荐展品</Typography.Title>
          <Button type="link" onClick={() => navigate("/exhibits")}>
            查看全部 <ArrowRightOutlined />
          </Button>
        </div>
        <Row gutter={[20, 20]}>
          {data.exhibits.map((item) => (
            <Col xs={24} md={12} xl={6} key={item.id}>
              <Card
                hoverable
                className="soft-card exhibit-card"
                cover={<img alt={item.name} src={item.image_url} className="cover-img" />}
                onClick={() => navigate(`/exhibits/${item.id}`)}
              >
                <Space wrap>
                  <Tag color="gold">{item.category}</Tag>
                  <Tag>{item.era}</Tag>
                </Space>
                <Typography.Title level={5}>{item.name}</Typography.Title>
                <Typography.Paragraph className="clamp-3">{item.summary}</Typography.Paragraph>
                <Space className="meta-line">
                  <EnvironmentOutlined />
                  <span>{item.hall_name}</span>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="block-section">
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={14}>
            <Card className="soft-card">
              <div className="section-head">
                <Typography.Title level={3}>近期展览</Typography.Title>
                <Button type="link" onClick={() => navigate("/exhibitions")}>
                  进入展览页 <ArrowRightOutlined />
                </Button>
              </div>
              <List
                dataSource={data.exhibitions}
                renderItem={(item) => (
                  <List.Item className="expo-row">
                    <img alt={item.title} src={item.poster_url} className="poster-thumb" />
                    <div className="expo-copy">
                      <Space wrap>
                        <Tag color={item.status === "展出中" ? "green" : "blue"}>{item.status}</Tag>
                        <span>{item.location}</span>
                      </Space>
                      <Typography.Title level={5}>{item.title}</Typography.Title>
                      <Typography.Paragraph className="clamp-2">{item.summary}</Typography.Paragraph>
                      <Space className="meta-line">
                        <CalendarOutlined />
                        <span>
                          {dayjs(item.start_date).format("YYYY.MM.DD")} - {dayjs(item.end_date).format("YYYY.MM.DD")}
                        </span>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card className="soft-card notice-card">
              <Typography.Title level={3}>公告与参观提醒</Typography.Title>
              <List
                dataSource={data.announcements}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <Space wrap>
                        {item.pinned ? <Tag color="red">置顶</Tag> : null}
                        <Typography.Text strong>{item.title}</Typography.Text>
                      </Space>
                      <Typography.Paragraph className="clamp-2">{item.content}</Typography.Paragraph>
                    </div>
                  </List.Item>
                )}
              />
              <div className="guide-short">
                <Typography.Title level={5}>今日参观信息</Typography.Title>
                <p>{data.guide.open_hours}</p>
                <p>{data.guide.address}</p>
                <Button type="default" onClick={() => navigate("/guide")}>
                  查看完整指南
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
