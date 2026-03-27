# 博物馆门户类软件

## 🛠 技术栈
- Frontend: React 19 + Vite + Ant Design + TypeScript
- Backend: FastAPI + SQLAlchemy + JWT Cookie 鉴权
- Database: PostgreSQL 15

## 🚀 启动指南
1. 确保 Docker Desktop 已启动。
2. 在项目根目录执行：`docker compose up --build`
3. 等待前后端与数据库容器全部完成启动。
4. 如果本机端口被占用，可临时覆盖：
   `FRONTEND_PORT=3217 BACKEND_PORT=8000 DB_PORT=5432 docker compose up --build`

## 📦 轻量打包
- 执行：`./scripts/package_release.sh`
- 打包过程不执行自动测试，只归档运行所需文件。
- 发布包会自动剔除 `node_modules`、`dist`、`venv`、`target`、缓存目录、软著文档、源码整理脚本及测试相关残留文件。
- 输出目录：`release/`

## 🔗 服务地址
- Frontend: 默认 [http://localhost:3000](http://localhost:3000)
- Backend Swagger: 默认 [http://localhost:8000/docs](http://localhost:8000/docs)
- Database: 默认 `localhost:5432`
  用户名：`museum_user`
  密码：`museum_pass`
  数据库：`museum_portal`

## 🧪 测试账号
- 管理员：`admin@museumportal.com / 123456`
- 普通用户：`user@example.com / 123456`

## 📦 项目说明
- 首页提供公告、推荐展品、近期展览和参观入口。
- 展品模块支持搜索、详情查看和真实评论写入。
- 预约模块要求登录后提交，数据写入 PostgreSQL，并支持用户侧取消预约。
- 后台支持展品、展览、公告、指南、预约记录、评论的管理与删除确认弹窗。
