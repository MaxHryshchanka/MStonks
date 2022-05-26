import {LightningElement, api, track} from 'lwc';

export default class PortfolioListModal extends LightningElement {
    @api stocks;
    @api ticker;
    @api interval;
    @track data;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    isLoaded = false;
    updatedDate;

    renderedCallback() {
        if (this.stocks !== undefined && this.isLoaded === false) {
            this.data = this.constructData();
            this.updatedDate = this.convertDate(this.stocks[0].LastModifiedDate);
            this.isLoaded = true;
        }
    }

    constructData() {
        return this.stocks.map((stock) => {
            return {
                id : stock.Id,
                ticker: stock.Name,
                close: this.convertNum(stock.Close__c),
                open: this.convertNum(stock.Open__c),
                change: this.convertNum(stock.Change__c),
                change_percent: (stock.Change_Percent__c / 100).toFixed(4),
                volume: this.convertNum(stock.Volume__c / 1000000)
            }
        }).reverse();
    }

    get columns() {
        return [
            { label: 'Ticker', fieldName: 'ticker', sortable: true, cellAttributes: { alignment: 'left' }},
            { label: 'Close', fieldName: 'close', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Open', fieldName: 'open', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Change', fieldName: 'change', type: 'currency', typeAttributes: { currencyCode: 'USD', step: '0.01' }, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Change (%)', fieldName: 'change_percent', type: 'percent', typeAttributes: { step: '0.00001', minimumFractionDigits: '2', maximumFractionDigits: '2'}, sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Volume (M)', fieldName: 'volume', type: 'number', sortable: true, cellAttributes: { alignment: 'right' }},
            { label: 'Action', type: "button", typeAttributes: {label: 'Show'}, cellAttributes: { alignment: 'center' }}
        ];
    }

    convertNum(num) {
        return Math.round(num * 100) / 100;
    }

    convertDate(dateStr) {
        let dateArr = new Date(dateStr).toDateString().split(' ').slice(1, 4);
        return dateArr[1] + ' ' + dateArr[0] + ' ' + dateArr[2];
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }

    handleRowAction(event) {
        this.dispatchEvent(new CustomEvent('showstock', { detail: event.detail.row.id }));
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
}