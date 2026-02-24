import { WildberriesAPI } from './wildberries/api.js';
import { TariffsRepository } from './tariffs/repository.js';
import { GoogleSheetsService } from './googleSheets/client.js';
import type { SheetRow } from './googleSheets/client.ts';

export class Synchronizer {
  constructor(
    private wbAPI: WildberriesAPI,
    private repo: TariffsRepository,
    private sheets: GoogleSheetsService,
  ) {}

  /**
   * Полный цикл синхронизации
   */
  async sync(): Promise<void> {
    console.log('\nЗапуск синхронизации...');
    console.log('═'.repeat(50));

    try {
      console.log('1. Получение тарифов из Wildberries...');
      const wbTariffs = await this.wbAPI.fetchBoxTariffs();

      if (wbTariffs.length === 0) {
        console.log('WB API: нет данных, пропускаем синхронизацию');
        return;
      }

      console.log('2: Сохранение в PostgreSQL...');
      await this.repo.upsertDailyTariffs(wbTariffs);

      console.log('3: Подготовка данных для Google Sheets...');
      const tariffs = await this.repo.getTariffsForExport();

      if (tariffs.length === 0) {
        console.log('DB: нет данных для экспорта');
        return;
      }

      // Отформатировать для Google Sheets
      const sheetRows: SheetRow[] = tariffs.map(t => ({
        warehouse: t.box_type,
        coefficient: t.coefficient,
        price: t.price_rub,
        minWeight: t.min_weight_kg,
        updatedAt: new Date().toISOString(),
      }));

      console.log('4: Обновление Google Sheets...');
      await this.sheets.updateStocksCoefs(sheetRows);

      console.log('═'.repeat(50));
      console.log('Синхронизация завершена успешно!');
      console.log(`Тарифов: ${sheetRows.length}`);
      console.log(`Дата: ${new Date().toISOString()}`);

    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      throw error;
    }
  }
}