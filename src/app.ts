import { migrate, seed } from "#postgres/knex.js";
import { WildberriesAPI } from './services/wildberries/api.js';
import { TariffsRepository } from './services/tariffs/repository.js';
import { GoogleSheetsService } from './services/googleSheets/client.js';
import { Synchronizer } from './services/synchronizer.js';
import cron from 'node-cron';
import env from './config/env/env.js';

async function main() {
  try {
    console.log('Применение миграций...');
    await migrate.latest();
    await seed.run();
    console.log('Миграции применены');

    console.log('Инициализация сервисов...');
    const wbAPI = new WildberriesAPI(env.WB_API_TOKEN);
    const repo = new TariffsRepository();
    const sheets = new GoogleSheetsService(
      env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      env.GOOGLE_SHEET_IDS,
    );
    const orchestrator = new Synchronizer(wbAPI, repo, sheets);

    console.log('Первая синхронизация...');
    await orchestrator.sync();

    // Для тестирования (каждую минуту)
    // cron.schedule('* * * * *', async () => {
    // console.log('Cron запуск каждую минуту...');
    // await orchestrator.sync();
    // });

    // Для прода (каждый час)
    console.log('Cron: запуск каждый час...');
    cron.schedule('0 * * * *', async () => {
      await orchestrator.sync();
    });

    console.log('Приложение запущено!');
  } catch (error) {
    console.error('Ошибка запуска:', error);
    process.exit(1);
  }
}

main();