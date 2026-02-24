import { google } from 'googleapis';
import { readFileSync } from 'fs';

export interface SheetRow {
  warehouse: string;
  coefficient: number;
  price: number | null;
  minWeight: number | null;
  updatedAt: string;
}

export class GoogleSheetsService {
  private sheets;
  private spreadsheetIds: string[];

  constructor(keyFilePath: string, spreadsheetIds: string) {
    this.spreadsheetIds = spreadsheetIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (this.spreadsheetIds.length === 0) {
      throw new Error('GOOGLE_SHEET_IDS не указан в .env');
    }

    // Авторизация через Service Account
    const credentials = JSON.parse(readFileSync(keyFilePath, 'utf-8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets: авторизация успешна');
  }

  /**
   * Обновить лист stocks_coefs в таблицах
   */
  async updateStocksCoefs(data: SheetRow[]): Promise<void> {
    // Форматируем данные для Google Sheets
    const values = [
      ['Склад', 'Коэффициент', 'Цена (руб)', 'Мин. вес (кг)', 'Обновлено'], // Заголовок
      ...data.map(row => [
        row.warehouse,
        row.coefficient,
        row.price ?? '-',
        row.minWeight ?? '-',
        row.updatedAt,
      ]),
    ];

    // Обновляем все таблицы из списка
    for (const spreadsheetId of this.spreadsheetIds) {
      try {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'stocks_coefs!A1',
          valueInputOption: 'RAW',
          requestBody: { values },
        });
        console.log(`Google Sheets: обновлена таблица ${spreadsheetId}`);
      } catch (error) {
        console.error(`Google Sheets: ошибка таблицы ${spreadsheetId}`, error);
        throw error;
      }
    }
  }

  /**
   * Очистить лист (опционально)
   */
  async clearSheet(spreadsheetId: string, range: string): Promise<void> {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
  }
}