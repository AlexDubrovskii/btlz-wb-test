/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable("tariffs", (table) => {
    table.increments("id").primary();
    table.date("tariff_date").notNullable();
    table.timestamp("fetched_at").defaultTo(knex.fn.now());
    table.string("box_type");
    table.decimal("coefficient", 10, 4).notNullable();
    table.decimal("min_weight_kg", 10, 2);
    table.decimal("max_weight_kg", 10, 2);
    table.decimal("price_rub", 10, 2);
    table.unique(["tariff_date", "box_type"]);
    table.index("tariff_date");
  });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable("tariffs");
}
