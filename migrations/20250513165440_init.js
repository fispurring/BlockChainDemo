/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("assets", (table) => {
    table.bigIncrements("id").primary();
    table.string("address", 64).notNullable();
    table.string("network", 32).notNullable();
    table.string("type", 32).notNullable();
    table.string("contract_address", 64).nullable();
    table.string("symbol", 64).nullable();
    table.string("name", 128).nullable();
    table.string("balance", 128).notNullable();
    table.string("token_id", 64).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.unique(["address", "network", "contract_address", "type"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("user_assets");
};
