module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "mysql",
      user: "root",
      password: "root",
      database: "block_chain",
    },
    migrations: {
      directory: "./migrations", // 指定迁移文件的目录
    },
  },
};