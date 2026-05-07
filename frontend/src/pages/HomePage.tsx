import {
  ArrowRightOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Input, List, Row, Skeleton, Space, Statistic, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/services";
import type { HomePayload } from "../api/types";
import { excerpt, formatDateRange, statusColor } from "../utils/museum";

export function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setData(await api.home());
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page-wrap">
        <Skeleton active paragraph={{ rows: 10 }} />
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

  const nextExhibition = data.exhibitions[0];

  return (
    <div className="page-wrap">
      <section className="hero-banner">
        <div className="hero-copy">
          <Space align="center" className="hero-kicker">
            <SoundOutlined />
            <span>数字博物馆门户</span>
          </Space>
          <Typography.Title level={1}>用更轻松的方式走进馆藏与展览</Typography.Title>
          <Typography.Paragraph className="hero-lead">
            我们把展品浏览、展览信息、参观指南和在线预约统一在一起，让参观者可以更快找到重点内容，也让后台维护更顺手。
          </Typography.Paragraph>
          <Space wrap>
            <Button type="primary" size="large" onClick={() => navigate("/visits")}>
              立即预约参观
            </Button>
            <Button size="large" onClick={() => navigate("/exhibitions")}>
              查看近期展览
            </Button>
          </Space>
        </div>

        <div className="hero-panel">
          <Typography.Text type="secondary">馆内快速搜索</Typography.Text>
          <Input
            size="large"
            value={keyword}
            prefix={<SearchOutlined />}
            placeholder="输入展品名称、年代或展厅"
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={() => navigate(`/exhibits?q=${encodeURIComponent(keyword)}`)}
          />
          <div className="stats-strip">
            <Statistic title="馆藏展品" value={data.total_exhibits} />
            <Statistic title="在展展览" value={data.total_exhibitions} />
          </div>
          {nextExhibition ? (
            <div className="hero-note">
              <Tag color={statusColor(nextExhibition.status)}>{nextExhibition.status}</Tag>
              <Typography.Title level={5}>{nextExhibition.title}</Typography.Title>
              <Typography.Paragraph type="secondary">
                {formatDateRange(nextExhibition.start_date, nextExhibition.end_date)}
              </Typography.Paragraph>
            </div>
          ) : null}
        </div>
      </section>

      <section className="block-section">
        <div className="section-head">
          <div>
            <Typography.Title level={3}>推荐展品</Typography.Title>
            <Typography.Text type="secondary">从最新录入的藏品中挑选了几件适合先看的重点展品。</Typography.Text>
          </div>
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
                <Space wrap className="card-tags">
                  <Tag color="gold">{item.category}</Tag>
                  <Tag>{item.era}</Tag>
                </Space>
                <Typography.Title level={5}>{item.name}</Typography.Title>
                <Typography.Paragraph className="clamp-3">{excerpt(item.summary, 120)}</Typography.Paragraph>
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
            <Card className="soft-card section-card">
              <div className="section-head">
                <div>
                  <Typography.Title level={3}>近期展览</Typography.Title>
                  <Typography.Text type="secondary">查看当前和即将开展的专题展览，快速掌握时间与地点。</Typography.Text>
                </div>
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
                        <Tag color={statusColor(item.status)}>{item.status}</Tag>
                        <Space className="meta-line">
                          <EnvironmentOutlined />
                          <span>{item.location}</span>
                        </Space>
                      </Space>
                      <Typography.Title level={5}>{item.title}</Typography.Title>
                      <Typography.Paragraph className="clamp-2">{item.summary}</Typography.Paragraph>
                      <Space className="meta-line">
                        <CalendarOutlined />
                        <span>{formatDateRange(item.start_date, item.end_date)}</span>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card className="soft-card notice-card">
              <div className="section-head">
                <div>
                  <Typography.Title level={3}>公告与提示</Typography.Title>
                  <Typography.Text type="secondary">重要信息会优先置顶，方便你在来馆前快速确认。</Typography.Text>
                </div>
              </div>
              <List
                dataSource={data.announcements}
                renderItem={(item) => (
                  <List.Item>
                    <div className="announcement-item">
                      <Space wrap>
                        {item.pinned ? <Tag color="red">置顶</Tag> : null}
                        <Typography.Text strong>{item.title}</Typography.Text>
                      </Space>
                      <Typography.Paragraph className="clamp-2">{excerpt(item.content, 150)}</Typography.Paragraph>
                    </div>
                  </List.Item>
                )}
              />
              <div className="guide-short">
                <Typography.Title level={5}>今日参观信息</Typography.Title>
                <p>{data.guide.open_hours}</p>
                <p>{data.guide.address}</p>
                <Button type="default" onClick={() => navigate("/guide")}>
                  查看完整导览
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
