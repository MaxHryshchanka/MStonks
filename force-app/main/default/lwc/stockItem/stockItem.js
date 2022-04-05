import {LightningElement, api, track} from 'lwc';
import { getConfigStockChart, getRandomInt } from 'c/chartHelper'

export default class StockItem extends LightningElement {
    @api stock;
    loaded = false;
    @track columns;
    renderedCallback() {
        if (!this.loaded && Object.keys(this.stock).length !== 0) {
            try {
                const ctx = this.template.querySelector('canvas').getContext('2d');

                var gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgb(155, 213, 255)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

                let data = [
                    getRandomInt(10, 30),
                    getRandomInt(10, 30),
                    getRandomInt(10, 30),
                    getRandomInt(10, 30),
                    getRandomInt(10, 30),
                    getRandomInt(10, 30),
                    getRandomInt(10, 30),
                ]

                const myChart = new Chart(ctx, getConfigStockChart(data, gradient));


                this.loaded = true;
                this.columns = this.stock.columns;
            }
            catch (error) {
                console.log(error);
            }
        }
    }
}