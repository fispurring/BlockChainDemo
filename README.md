# BlockChainDemo
## 介绍

区块链demo，推荐用 `Codespace` 部署运行，也可以把代码下载到本地部署运行。
## 前置条件

- 安装docker-compose
- 安装pnpm

## 安装

1. 配置 `docker-compose.yaml` 文件中的 `ALCHEMY_API_KEY` 环境变量
2. 安装依赖
```bash
pnpm i
```
3. 启动mysql服务
```bash
docker-compose up -d mysql
```
4. 初始化数据库
```bash
node createDatabase.js
```

## 运行
1. 编译代码
```bash
pnpm build
```
2. 启动服务
```bash
docker-compose up -d
```

## 测试  
```bash
# network使用的是alchemy的枚举值
curl --location 'http://localhost:3000/get-assets' \
--header 'Content-Type: application/json' \
--data '{
    "loginToken": "sadsa",
    "assets": [
        {
            "address": "0x279A7Fb0458dA6c0b18E189DA693dF9cf5db2C78",
            "network": "eth-sepolia"
        }
    ]
}'
```
