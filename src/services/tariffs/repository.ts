import knex from 'knex';
import knexConfig from '../../config/knex/knexfile.js';

const db = knex(knexConfig);

export interface Tariff {
  id: number;
  tariff_date: string;
  fetched_at: string;
  box_type: string;
  coefficient: number;
  min_weight_kg: number | null;
  max_weight_kg: number | null;
  price_rub: number | null;
}

export interface TariffInput {
  tariff_date: string;
  box_type: string;
  coefficient: number;
  min_weight_kg: number | null;
  max_weight_kg: number | null;
  price_rub: number | null;
}

export class TariffsRepository {
  async upsertDailyTariffs(tariffs: any[]): Promise<void> {
    if (!tariffs || tariffs.length === 0) {
      console.log('DB: Нет тарифов для сохранения');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    
    const data: TariffInput[] = tariffs.map(t => {
      // Заменяем запятую на точку для parseFloat (RU → EN формат)
      const parseDecimal = (val: string | undefined): number | null => {
        if (!val || val === '-') return null;
        const num = parseFloat(val.replace(',', '.'));
        return isNaN(num) ? null : num;
      };

      return {
        tariff_date: today,
        box_type: t.warehouseName || t.geoName || 'unknown',
        coefficient: parseDecimal(t.boxDeliveryCoefExpr) || 0,
        min_weight_kg: parseDecimal(t.boxDeliveryLiter),
        max_weight_kg: null,
        price_rub: parseDecimal(t.boxDeliveryBase),
      };
    });

    await db('tariffs')
      .insert(data)
      .onConflict(['tariff_date', 'box_type'])
      .merge();

    console.log('DB: Сохранено тарифов за', today, ':', data.length);
  }

  async getTodayTariffs(): Promise<Tariff[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const tariffs = await db('tariffs')
      .where('tariff_date', today)
      .orderBy('coefficient', 'asc');

    return tariffs;
  }
}