import {LightningElement, track, wire} from 'lwc';
import {loadScript} from "lightning/platformResourceLoader";
import ChartJs from '@salesforce/resourceUrl/ChartJs';
import getStocks from '@salesforce/apex/stockHelper.getStocks';

export default class StockContainer extends LightningElement {
    @track stocks = [];
    stockId;
    ticker;
    data;
    amount;
    isChartJSInitialized = false;
    isOneActive = true;
    isShowModal;

    @wire(getStocks)
    wiredStocks({ error, data }) {
        if (data) {
            this.data = data;
            this.amount = data.length;
            this.initStocks();
        } else if (error) {
            console.log(error);
        }
    }

    fillStocks() {
        this.stocks = this.data.map((stock) => {
            return {
                Id : stock.Id,
                CompanyName: stock.Company_Name__c,
                Name: stock.Name,
                Exchange: stock.Exchange__c,
                Close: stock.Close__c,
                CurrencyCode: stock.Currency_Code__c,
                Change: stock.Change__c,
                ChangePercent: stock.Change_Percent__c,
                Logo: stock.Logo__c,
                Volume: stock.Volume__c,

                columns: [
                    {label: 'Open', value: stock.Open__c},
                    {label: 'Prev Close', value: stock.Close_Previous__c},
                    {label: 'Volume', value: stock.Volume__c},
                    {label: 'Average Volume', value: stock.Volume_Average__c},
                    {label: 'Day Range', value: stock.Day_Range__c},
                    {label: '52 Week Range', value: stock.Weeks_Range__c},
                ]
            }
        });
        this.sortByOrder(undefined, 'none');
    }

    initStocks() {
        for (let i = 0; i < this.amount; i++) {
            this.stocks.push({});
        }
    }

    renderedCallback() {
        if (this.amount !== undefined) {
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

    handleFilter(event) {
        const filter = event.detail;

        this.filterByKey(filter.key);
        this.sortByOrder(filter.field, filter.order);
    }

    filterByKey(key) {
        let isOneActive = false;

        this.template.querySelectorAll('ul').forEach((el) => {
            if(el.dataset.name.toLowerCase().includes(key.toLowerCase()) || el.dataset.company.toLowerCase().includes(key.toLowerCase())) {
                el.classList.remove('nonactive_container');
                isOneActive = true;
            } else {
                el.classList.add('nonactive_container');
            }
        });

        this.isOneActive = isOneActive;
    }

    sortByOrder(field, order) {
        this.stocks.sort(function (a, b) {
            if (order === 'none') {
                return a.Name.localeCompare(b.Name);
            }
            else {
                return order === 'ASC'
                    ? b[field] - a[field]
                    : a[field] - b[field]
            }
        });
    }

    handleCloseAnalysis() {
        this.isShowModal = false;
    }

    handleStockClick(event) {
        this.stockId = event.detail.id;
        this.ticker = event.detail.name;
        this.isShowModal = true;
    }
}