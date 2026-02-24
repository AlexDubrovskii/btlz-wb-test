import axios from 'axios';

export interface WBTariffItem {
  warehouseName: string;
  geoName: string;
  boxDeliveryBase?: string;
  boxDeliveryCoefExpr?: string;
  boxDeliveryLiter?: string;
  boxDeliveryMarketplaceBase?: string;
  boxDeliveryMarketplaceCoefExpr?: string;
  boxDeliveryMarketplaceLiter?: string;
  boxStorageBase?: string;
  boxStorageCoefExpr?: string;
  boxStorageLiter?: string;
}

export interface WBTariffResponse {
  response: {
    data: {
      dtNextBox: string;
      dtTillMax: string;
      warehouseList: WBTariffItem[];
    };
  };
}

export class WildberriesAPI {
  private apiToken: string;
  private baseURL: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
    this.baseURL = 'https://common-api.wildberries.ru/api/v1/tariffs/box';
  }

   /**
   * Получить тарифы коробов
   * @param date - Дата в формате YYYY-MM-DD (по умолчанию сегодня)
   */
  async fetchBoxTariffs(date?: string): Promise<WBTariffItem[]> {
    try {
      const queryDate = date || new Date().toISOString().split('T')[0];
      const response = await axios.get<WBTariffResponse>(this.baseURL, {
        headers: {
          'Authorization': this.apiToken,
        },
        params: {
          date: queryDate
        },
        timeout: 10000,
      });

      const tariffs = response.data?.response?.data?.warehouseList || [];
      
      console.log('WB API: Получено тарифов за', queryDate, ':', tariffs.length);

      return tariffs;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('WB API Error:', error.response?.status, error.response?.data);
      } else {
        console.error('WB API:', error);
      }
      throw error;
    }
  }
}