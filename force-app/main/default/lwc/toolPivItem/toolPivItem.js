import {LightningElement} from 'lwc';

export default class ToolPivItem extends LightningElement {
    data = [];

    get columns() {
        return [
            { label: 'Results', fieldName: 'results', type: 'string', cellAttributes: {alignment: 'center'}},
            { label: 'Classic', fieldName: 'classic', type: 'string', cellAttributes: {alignment: 'center'}},
            { label: 'Woodie`s', fieldName: 'woodie', type: 'string', cellAttributes: {alignment: 'center'}},
            { label: 'Camarilla', fieldName: 'camarilla', type: 'string', cellAttributes: {alignment: 'center'}},
            { label: 'DeMark`s', fieldName: 'demark', type: 'string', cellAttributes: {alignment: 'center'}}
        ]
    }

    get results() {
        return [
            '4 Resistance', '3 Resistance', '2 Resistance', '1 Resistance',
            'Pivot Point',
            '1 Support', '2 Support', '3 Support', '4 Support',
        ];
    }

    initData() {
        let data = [];

        this.results.forEach((res) => {
            data.push({
                'results': res,
                'classic': '-',
                'woodie': '-',
                'camarilla': '-',
                'demark': '-'
            });
        });

        this.data = data;
    }

    connectedCallback() {
        this.initData();
    }

    handleButtonClick() {
        let values = {};
        this.template.querySelectorAll('lightning-input').forEach((el) => {
            values[el.name] = +el.value;
        });

        this.constructData(values);
    }

    constructData(values) {
        let data = [];

        let arrClassic = this.formatData(this.calculateClassic(values['high'], values['low'], values['close']));
        let arrWoodie = this.formatData(this.calculateWoodie(values['high'], values['low'], values['close']));
        let arrCamarilla = this.formatData(this.calculateCamarilla(values['high'], values['low'], values['close']));
        let arrDemark = this.formatData(this.calculateDemark(values['high'], values['low'], values['close'], values['open']));

        this.results.forEach((res) => {
            data.push({
                'results': res,
                'classic': arrClassic.shift(),
                'woodie': arrWoodie.shift(),
                'camarilla': arrCamarilla.shift(),
                'demark': arrDemark.shift()
            });
        });

        this.data = data;
    }

    formatData(values) {
        return values.map((el) => typeof el === 'number'
            ? el !== 0
                ? el.toFixed(4).toString()
                : 0
            : el
        );
    }

    calculateClassic(high, low, close) {
        let pivot = (high + low + close) / 3;

        return [
            '-',
            high + 2 * (pivot - low),
            pivot + high - low,
            2 * pivot - low,
            pivot,
            2 * pivot - high,
            pivot - high + low,
            low - 2 * (high - pivot),
            '-'
        ];

    }

    calculateWoodie(high, low, close) {
        let pivot = (high + low + 2 * close) / 4;

        return [
            '-',
            '-',
            pivot + high - low,
            2 * pivot - low,
            pivot,
            2 * pivot - high,
            pivot - high + low,
            '-',
            '-'
        ];
    }

    calculateCamarilla(high, low, close) {
        return [
            (high - low) * 1.1 / 2 + close,
            (high - low) * 1.1 / 4 + close,
            (high - low) * 1.1 / 6 + close,
            (high - low) * 1.1 / 12 + close,
            '-',
            close - (high - low) * 1.1 / 12,
            close - (high - low) * 1.1 / 6,
            close - (high - low) * 1.1 / 4,
            close - (high - low) * 1.1 / 2,
        ];
    }

    calculateDemark(high, low, close, open) {
        let X = close < open
            ? (high + 2 * low + close)
            : (close > open
                ? (2 * high + low + close)
                : (high + low + 2 * close))

        return [
            '-',
            '-',
            X / 2 - low,
            '-',
            X / 2 - high,
            '-',
            '-',
            '-',
        ];
    }
}