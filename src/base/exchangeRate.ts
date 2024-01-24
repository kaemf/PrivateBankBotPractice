import axios from 'axios';
import { convertRateExchange } from '../data/convertRateExchange';

class ExchangeRates{
    private async getExchangeRates(current: string){
      try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/b685c994b24ddc1625b36221/latest/${current}`),
            data = response.data;
        
        return data.conversion_rates;
      } catch (error) {
        console.error('Error fetching exchange rates: ', error);
        return false;
      }
    }

    async getAllRates(current: string){
        try {
            const data = await this.getExchangeRates(current);

            return data;
        } catch (error) {
            console.log('Error to process conversion rates: ', error);
            return false;
        }
    }

    async getSpecificRates(current: string, specific: string){
        try {
            const data = await this.getExchangeRates(current),
                processedSpecificRate = Object.keys(convertRateExchange).includes(specific) ? convertRateExchange[specific] : -1;

            return processedSpecificRate !== -1 ? data[processedSpecificRate] : false;
        } catch (error) {
            console.log(`Error to get exchange rate for ${specific}`, error);
            return false;
        }
    }

    async convertRateToTarget(current: string, specific: string, value: number){
        try {
            const processedSpecificRate = await this.getSpecificRates(current, specific);

            return value * processedSpecificRate;
        } catch (error) {
            console.log('Error to convert rate: ', error);
            return false;
        }
    }

}

const exchangeRateS = new ExchangeRates;
export default exchangeRateS;