import {LightningElement, api, track} from 'lwc';
import { getConfigStockChart, DAY_LABELS } from 'c/chartHelper'
import getTimeseries from '@salesforce/apex/timeseriesHelper.getPortfolioTimeseries'

export default class StockItem extends LightningElement {
    @api stock;
    @track columns;
    loaded = false;

    get isStockInit() {
        return Object.keys(this.stock).length !== 0;
    }

    get ifStockPositive() {
        return Math.sign(this.stock.Change) >= 0
    }

    get stockChange() {
        return this.ifStockPositive
            ? '+' + this.stock.Change
            : this.stock.Change;
    }

    get stockChangePercent() {
        return this.ifStockPositive
            ? '+' + this.stock.ChangePercent + '%'
            : this.stock.ChangePercent + '%';
    }

    buildChart(data) {
        try {
            const context = this.template.querySelector('canvas').getContext('2d');
            let gradient = context.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgb(155, 213, 255)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

            let values = data.map((series) => { return series.Close__c });
            let labels = data.map((series) => { return DAY_LABELS[new Date(series.Moment__c).getDay()] });

            const myChart = new Chart(context, getConfigStockChart(values, labels, gradient));

            this.loaded = true;
            this.columns = this.stock.columns;
        }
        catch (error) {
            console.log(error);
        }
    }

    renderedCallback() {
        if (!this.loaded && Object.keys(this.stock).length !== 0) {
            getTimeseries({ stockId: this.stock.Id, interval: '1day'})
                .then((result) => {
                    this.buildChart(result.slice(-5));
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }
}