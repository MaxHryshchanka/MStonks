import { LightningElement } from 'lwc';

const PRICE_MOVEMENT_VALUE = 'up';

export default class ToolFibItem extends LightningElement {
    priceMovementValue = PRICE_MOVEMENT_VALUE;
    retracementsData;
    extensionsData;

    get retracementsColumns() {
        return [
            { label: 'Levels', fieldName: 'level', type: 'string', cellAttributes: {alignment: 'center'}},
            { label: 'Retracements', fieldName: 'value', type: 'string', cellAttributes: {alignment: 'center'}}
        ]
    }

    get retracementsLevels() {
        return [
            '138.2%',
            '100%',
            '76.4%',
            '61.8%',
            '50%',
            '38.2%',
            '23.6%',
            '0%',
        ];
    }

    get extensionsColumns() {
        return [
            { label: 'Levels', fieldName: 'level', type: 'string', cellAttributes: {alignment: 'center'}},
            { label: 'Extensions', fieldName: 'value', type: 'string', cellAttributes: {alignment: 'center'}}
        ]
    }

    get extensionsLevels() {
        return [
            '23.6%',
            '38.2%',
            '50%',
            '61.8%',
            '100%',
            '138.2%',
            '161.8%',
            '200%'
        ];
    }

    get priceMovementOptions() {
        return [
            { label: 'Uptrend', value: 'up' },
            { label: 'Down', value: 'down' }
        ]
    }

    get isUptrend() {
        return this.priceMovementValue === PRICE_MOVEMENT_VALUE;
    }

    handleRadioChange(event) {
        this.priceMovementValue = event.detail.value;
        this.initData();
    }

    initData() {
        this.retracementsData = this.constructData(this.retracementsLevels);
        this.extensionsData = this.constructData(this.extensionsLevels);
    }

    constructData(levels, values) {
        let data = levels.map((el) => {
            return {
                'level': el,
                'value': values === undefined ? '-' : values.shift()
            }
        });

        return this.isUptrend ? data.reverse() : data;
    }

    calculateData(values) {
        let max = values.high;
        let min = values.low;
        let custom = values.custom;

        this.retracementsData = this.retracementsData.map((el) => {
            let percent = Number(el.level.slice(0, -1));
            return {
                'level': el.level,
                'value': this.isUptrend
                    ? this.convertNum(max - ((max - min) * percent / 100))
                    : this.convertNum(min + ((max - min) * percent / 100))
            }
        });

        this.extensionsData = this.extensionsData.map((el) => {
            let percent = Number(el.level.slice(0, -1));
            return {
                'level': el.level,
                'value': this.isUptrend
                    ? this.convertNum(custom + ((max - min) * percent / 100))
                    : this.convertNum(custom - ((max - min) * percent / 100))
            }
        });
    }

    handleButtonClick(event) {
        let values = {};

        this.template.querySelectorAll('lightning-input').forEach((el) => {
            values[el.name] = +el.value;
        });

        this.calculateData(values);
    }

    connectedCallback() {
        this.initData();
    }

    convertNum(num) {
        return Math.round(num * 10000) / 10000;
    }
}