import {LightningElement, track} from 'lwc';
import {loadScript} from "lightning/platformResourceLoader";
import ChartJs from '@salesforce/resourceUrl/ChartJs';

const amount = 12;
const stock =  {
    CompanyName: 'Apple Inc.',
    Ticker: 'AAPL',
    Market: 'NASDAQ',
    Value: '111.81',
    Currency: 'USD',
    Difference: '+1.73',
    Percentage: '+1.57%',
    Url: 'https://api.twelvedata.com/logo/nvidia.com',

    columns: [
        {label: 'Open', value: '112.68'},
        {label: 'Prev Close', value: '110.08'},
        {label: 'Volume', value: '183,055,376'},
        {label: 'Market Cap', value: '1.883T'},
        {label: 'Day Range', value: '109.16 - 112.86'},
        {label: '52 Week Range', value: '53.15 - 137.98'},
    ]
}


export default class StockContainer extends LightningElement {
    @track stocks = [];
    isChartJSInitialized = false;

    /**
     * Methods
     */
    fillStocks() {
        for (let i = 0; i < amount; i++) {
            this.stocks[i] = stock;
        }
    }

    initStocks() {
        for (let i = 0; i < amount; i++) {
            this.stocks.push({});
        }
    }

    /**
     * Lifecycle
     */
    connectedCallback() {
        this.initStocks();
    }

    renderedCallback() {
        if (this.isChartJSInitialized) {
            return;
        }
        this.isChartJSInitialized = true;

        Promise.all([
            loadScript(this, ChartJs)
        ])
            .then(() => {
                this.fillStocks();
            })
            .catch((error) => {
                console.log(error);
            })
    }
}