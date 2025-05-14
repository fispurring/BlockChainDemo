const knex = require("knex");
const config = require("./knexfile");

// 使用 development 配置
const db = knex({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "root",
  },
});

async function createDatabase() {
  const databaseName = "block_chain"; // 要创建的数据库名称

  try {
    // 执行 CREATE DATABASE 语句
    await db.raw(`CREATE DATABASE IF NOT EXISTS ??`, [databaseName]);
    console.log(`Database "${databaseName}" created successfully.`);
  } catch (error) {
    console.error("Error creating database:", error);
  } finally {
    // 关闭连接
    await db.destroy();
  }
}

createDatabase();
