import {LightningElement, api, wire, track} from 'lwc';
import getTimeseries from '@salesforce/apex/timeseriesHelper.getPortfolioTimeseries';

const INTERVAL_VALUE = '1day';
const SPLIT_LENGTH = 49;
const SMOOTHING = 2;
const INDEX_INTERVAL = 15;

export default class IndexModal extends LightningElement {
    @api stockId;
    @api ticker;
    @track data;
    indexData;
    isLoaded = false;
    weight = 0;
    styleSummary;
    intervalValue = INTERVAL_VALUE;

    @wire(getTimeseries, { stockId : '$stockId', interval : '$intervalValue' })
    wiredTimeseries({ error, data }) {
        if (data) {
            this.data = data.slice(SPLIT_LENGTH, data.length);
            this.indexData = this.constructData();
            this.styleSummary = this.getStyleSummary() + ' slds-p-left_xx-small';
            this.isLoaded = true;
        } else if (error) {
            console.log(error);
        }
    }

    constructData() {
        return [
            this.constructRsiRow(),
            this.constructRRow(),
            this.constructStockRow(),
            this.constructMovingRow(10),
            this.constructMovingRow(20),
            this.constructMovingRow(50),
        ];
    }

    get indexColumns() {
        return [
            { label: 'Name', fieldName: 'name', cellAttributes: { alignment: 'center' }},
            { label: 'Value', fieldName: 'value', cellAttributes: { alignment: 'center' }},
            { label: 'Action', fieldName: 'action', cellAttributes: { alignment: 'center', class: {fieldName: 'format'}, }, }
        ]
    }

    get summary() {
        if (this.weight >= 7) {
            return 'Strong Buy';
        }
        if (this.weight >= 3) {
            return 'Buy';
        }
        if (this.weight > -3) {
            return 'Neutral';
        }
        if (this.weight > -7) {
            return 'Sell';
        }
        return 'Strong Sell';
    }

    getStyleSummary() {
        if (this.weight >= 3) {
            return this.styleBuy;
        }
        if (this.weight <= -3) {
            return this.styleSell;
        }
        return '';
    }

    get lastPrice() {
        return this.data.slice(-1)[0].Close__c;
    }

    get styleBuy() {
        return 'slds-text-color_success';
    }

    get styleSell() {
        return 'slds-text-color_error';
    }


    constructRsiRow() {
        let rsi = this.convertNum(this.calculateRsi());
        let [action, format] = this.actionRsi(rsi);

        return {
            name: 'RSI (14)',
            value: rsi + '%',
            action: action,
            format: format
        }
    }

    calculateRsi() {
        let upArr = [];
        let downArr = [];

        const data = this.data.slice(-1 * INDEX_INTERVAL);

        for (let i = 1; i < INDEX_INTERVAL; i++) {
            let val = data[i].Close__c - data[i-1].Close__c;
            upArr.push(val > 0 ? val : 0 );
            downArr.push(val < 0 ? Math.abs(val) : 0);
        }

        return (100 - 100 / (1 + this.calculateSMA(upArr, INDEX_INTERVAL - 1) / this.calculateSMA(downArr, INDEX_INTERVAL - 1)))
    }

    actionRsi(value) {
        if (value >=  70) {
            return ['Overbought', '']
        }
        else if (value >= 55) {
            this.weight += 2;
            return ['Buy', this.styleBuy]
        }
        else if (value >= 45) {
            return ['Neutral', '']
        }
        else if (value >= 30) {
            this.weight -= 2;
            return ['Sell', this.styleSell]
        }
        return ['Oversell', '']
    }

    constructRRow() {
        let r = this.convertNum(this.calculateR());
        let [action, format] = this.actionR(r)

        return {
            name: 'Williams %R',
            value: r + '%',
            action: action,
            format: format
        }
    }

    calculateR() {
        const data = this.data.slice(-1 * (INDEX_INTERVAL - 1));

        let maxPrice = Math.max.apply(null, data.map((series) => series.High__c))
        let minPrice = Math.min.apply(null, data.map((series) => series.Low__c))

        return ((maxPrice - data.slice(-1)[0].Close__c) / (maxPrice - minPrice) * -100);
    }

    actionR(value) {
        if (value >= -20) {
            return ['Overbought', '']
        }
        else if (value >= -45) {
            this.weight += 2;
            return ['Buy', this.styleBuy]
        }
        else if (value >= -55) {
            return ['Neutral', '']
        }
        else if (value >= -80) {
            this.weight -= 2;
            return ['Sell', this.styleSell]
        }
        return ['Oversell', '']
    }

    constructStockRow() {
        let stoc = this.convertNum(this.calculateStoc());
        let [action, format] = this.actionStoc(stoc)

        return {
            name: 'STOCH (14)',
            value: stoc + '%',
            action: action,
            format: format
        }
    }

    calculateStoc() {
        const data = this.data.slice(-1 * (INDEX_INTERVAL - 1));

        let maxPrice = Math.max.apply(null, data.map((series) => series.High__c))
        let minPrice = Math.min.apply(null, data.map((series) => series.Low__c))

        return (data.slice(-1)[0].Close__c - minPrice) / (maxPrice - minPrice) * 100;
    }

    actionStoc(value) {
        if (value >= 80) {
            return ['Overbought', '']
        }
        else if (value >= 55) {
            this.weight += 2;
            return ['Buy', this.styleBuy]
        }
        else if (value >= 45) {
            return ['Neutral', '']
        }
        else if (value >= 20) {
            this.weight -= 2;
            return ['Sell', this.styleSell]
        }
        return ['Oversell', '']
    }

    constructMovingRow(n) {
        const data = this.data.slice(-1 * n).map((series) => series.Close__c);
        let sma = this.convertNum(this.calculateSMA(data, data.length));
        let ema = this.convertNum(this.calculateEMA(data, data[0], data.length));

        return {
            name: 'SMA / EMA (' + n + ')',
            value: sma + ' / ' + ema,
            action: this.actionMoving(sma) + ' / ' + this.actionMoving(ema),
            format: this.formatMoving(sma, ema),
        }
    }

    calculateSMA(values, n) {
        return values.reduce((partialSum, a) => partialSum + a, 0) / n;
    }

    calculateEMA(values, prevEMA, n) {
        values.forEach((price) => {
            prevEMA = (price * (SMOOTHING / (1 + n)) + prevEMA * (1 - (SMOOTHING / (1 + n))));
        });

        return prevEMA;
    }

    actionMoving(value) {
        if (value < this.lastPrice) {
            this.weight += 0.5;
            return 'Buy';
        }
        else {
            this.weight -= 0.5;
            return 'Sell';
        }
    }

    formatMoving(sma, ema) {
        if (ema < this.lastPrice && sma < this.lastPrice) {
            return this.styleBuy;
        }
        else if (ema > this.lastPrice && sma > this.lastPrice) {
            return this.styleSell;
        }
        return '';
    }

    convertNum(num) {
        return Math.round(num * 100) / 100;
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }
}