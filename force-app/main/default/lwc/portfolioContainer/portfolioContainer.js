import {LightningElement, wire} from 'lwc';
import {loadScript} from "lightning/platformResourceLoader";
import getStock from '@salesforce/apex/stockHelper.getStock';
import ChartJs from '@salesforce/resourceUrl/ChartJs';

export default class PortfolioContainer extends LightningElement {
    isChartJSInitialized = false;
    isLoaded = false;
    stock;
    stockId = null;

    @wire(getStock, { stockId : "$stockId" })
    wiredStock({ error, data }) {
        if (data) {
            this.stock = data;

            if (this.stockId === null) {
                this.stockId = this.stock.Id;
            }

            this.isLoaded = true;
        } else if (error) {
            console.log(error);
        }
    }

    renderedCallback() {
        if (this.isChartJSInitialized) {
            return;
        }
        this.isChartJSInitialized = true;

        Promise.all([
            loadScript(this, ChartJs)
        ])
            .catch((error) => {
                console.log(error);
            })
    }

    handleStockChange(event) {
        if (this.stockId != event.detail) {
            this.stockId = event.detail;
            this.template.querySelector('c-portfolio-chart').destroyChart();
        }
    }
}