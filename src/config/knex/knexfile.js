// src/config/knex/knexfile.js
export default {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  },
  migrations: {
    directory: '/app/src/postgres/migrations',  // ✅ Просто и надёжно!
    extension: 'ts',
  },
  seeds: {
    directory: '/app/src/postgres/seeds',
  },
};