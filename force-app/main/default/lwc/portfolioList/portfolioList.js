import {LightningElement, wire} from 'lwc';
import getStocks from '@salesforce/apex/stockHelper.getStocks';

const SORT = 'all';
const DELAY = 300;

export default class PortfolioList extends LightningElement {
    sortValue = SORT;
    data;
    stocks;
    isLoaded;
    isShowModal;
    isOneActive;

    get isDisabled() {
        return !this.isLoaded;
    }

    @wire(getStocks)
    wiredStocks({ error, data }) {
        if (data) {
            this.data = data;
            this.filterHandler('');
            this.isLoaded = true;
        } else if (error) {
            console.log(error);
        }
    }

    get sortOptions() {
        return [
            { label: 'All', value: 'all' },
            { label: 'Subscriptions', value: 'subscriptions' },
        ];
    }

    handleClick(event) {
        this.dispatchEvent(new CustomEvent('stockchange', { detail: event.currentTarget.dataset.id }));
    }

    handleModalClick() {
        this.isShowModal = true;
    }

    handleCloseModal() {
        this.isShowModal = false;
    }

    handleShowStock(event) {
        this.dispatchEvent(new CustomEvent('stockchange', { detail: event.detail }));
        this.handleCloseModal();
    }

    handleInputChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.filterHandler(searchKey);
        }, DELAY);
    }

    filterHandler(searchKey) {
        let isOneActive = false;
        let stocks = [];

        this.data.forEach((stock) => {
            if(stock.Name.toLowerCase().includes(searchKey.toLowerCase()) || stock.Company_Name__c.toLowerCase().includes(searchKey.toLowerCase())) {
                stocks.push(stock);
                isOneActive = true;
            }
        });

        this.isOneActive = isOneActive;
        this.stocks = stocks;
    }
}