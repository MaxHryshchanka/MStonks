import {LightningElement, api, track} from 'lwc';

export default class PortfolioHistory extends LightningElement {
    @api timeseries;
    @api ticker;
    @api interval;
    @track data;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    isLoaded = false;

    renderedCallback() {
        if (this.timeseries !== undefined && this.isLoaded === false) {
            this.data = this.constructData();
            this.isLoaded = true;
        }
    }

    constructData() {
        let data = [];

        for (let i = 1; i < this.timeseries.length; i++) {
            data.push({
                moment: this.timeseries[i].Moment__c,
                high: this.convertNum(this.timeseries[i].High__c),
                close: this.convertNum(this.timeseries[i].Close__c),
                open: this.convertNum(this.timeseries[i].Open__c),
                low: this.convertNum(this.timeseries[i].Low__c),
                change: this.convertNum(this.timeseries[i].Close__c - this.timeseries[i-1].Close__c),
                change_percent: ((this.timeseries[i].Close__c - this.timeseries[i-1].Close__c) / this.timeseries[i-1].Close__c).toFixed(4),
                volume: this.convertNum(this.timeseries[i].Volume__c / 1000000)
            })
        }

        return data.reverse();
    }

    get columns() {
        return [
            { label: 'Moment', fieldName: 'moment', type: "date", typeAttributes:{ day: "2-digit", month: "short", year: 'numeric' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'High', fieldName: 'high', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Close', fieldName: 'close', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Open', fieldName: 'open', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Low', fieldName: 'low', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Change', fieldName: 'change', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Change (%)', fieldName: 'change_percent', type: 'percent', typeAttributes: { step: '0.00001', minimumFractionDigits: '2', maximumFractionDigits: '2'}, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Volume (M)', fieldName: 'volume', type: 'number', sortable: true, cellAttributes: { alignment: 'center' }}
        ];
    }

    convertNum(num) {
        return Math.round(num * 100) / 100;
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                return primer(x[field]);
            }
            : function (x) {
                return x[field];
            };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    get convertedInterval() {
        switch (this.interval) {
            case '1month':
                return 'Month';
            case '1week':
                return 'Week';
            case '1day':
                return 'Day';
        }
    }
}