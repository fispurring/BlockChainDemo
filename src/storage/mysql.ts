import Knex from "knex";
import config from "../config";

// Knex配置
const knexConfig = {
  client: "mysql2",
  connection: {
    host: config.get("MYSQL_HOST"),
    user: config.get("MYSQL_USER"),
    password: config.get("MYSQL_PASSWORD"),
    database: config.get("MYSQL_DATABASE"),
  },
  migrations: {
    directory: "./migrations",
    tableName: "knex_migrations",
  },
};

const knex = Knex(knexConfig);

export default knex;
