import {LightningElement} from 'lwc';

const DELAY = 300;

export default class StockFilter extends LightningElement {
    value = 'none';
    filterSettings = {
        'key' : '',
        'field' : this.value,
        'order' : this.value
    }

    get priceOptions() {
        return [
            { label: 'None', value: 'none' },
            { label: 'Price▼', value: 'DESC' },
            { label: 'Price▲', value: 'ASC' }
        ];
    }

    get percentOptions() {
        return [
            { label: 'None', value: 'none' },
            { label: 'Fall %', value: 'DESC' },
            { label: 'Rise %', value: 'ASC' },
        ];
    }

    get volumeOptions() {
        return [
            { label: 'None', value: 'none' },
            { label: 'Volume▼', value: 'DESC' },
            { label: 'Volume▲', value: 'ASC' },
        ];
    }

    handleRadioChange(event) {
        this.filterSettings.field = event.target.name;
        this.filterSettings.order = event.detail.value

        this.template.querySelectorAll('lightning-radio-group').forEach((el) => {
            if (el.name !== event.target.name) {
                el.value = 'none';
            }
        })

        this.filterHandler();
    }

    handleInputChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.filterSettings.key = searchKey;
            this.filterHandler();
        }, DELAY);
    }

    filterHandler() {
        const filterEvent = new CustomEvent('filter', { detail: this.filterSettings });
        this.dispatchEvent(filterEvent);
    }
}