import {LightningElement, api, track, wire} from 'lwc';
import getTimeseries from '@salesforce/apex/timeseriesHelper.getPortfolioTimeseries';
import { getConfigPortfolioCandleChart, getConfigPortfolioVolumeChart, getConfigPortfolioMountainChart } from 'c/chartHelper'

const SPLIT_LENGTH = 50;
const SMOOTHING = 2;
const INTERVAL = '1month';
const TYPE = 'candlestick';

export default class PortfolioChart extends LightningElement {
    @api stock;
    @track data;
    @track preData;
    chart;
    isLoaded;
    isShowModal;
    intervalValue = INTERVAL;
    typeValue = TYPE;

    @wire(getTimeseries, { stockId : '$stock.Id', interval : '$intervalValue' })
    wiredTimeseries({ error, data }) {
        if (data) {
            this.preData = data.slice(0, SPLIT_LENGTH);
            this.data = data.slice(SPLIT_LENGTH, SPLIT_LENGTH * 2);
            this.buildChart();
        } else if (error) {
            console.log(error);
        }
    }

    get isDisabled() {
        return !this.isLoaded;
    }

    get stockLogo() {
        return this.stock.Logo__c;
    }

    get stockCompanyName() {
        return this.stock.Company_Name__c;
    }

    get stockExchange() {
        return this.stock.Exchange__c;
    }

    get stockPrice() {
        return this.roundNum(this.stock.Close__c) + ' ' + this.stock.Currency_Code__c;
    }

    get stockChange() {
        return this.ifStockPositive
            ? '+' + this.roundNum(this.stock.Change__c)
            : this.roundNum(this.stock.Change__c);
    }

    get stockChangePercent() {
        return this.ifStockPositive
            ? '+' + this.roundNum(this.stock.Change_Percent__c) + '%'
            : this.roundNum(this.stock.Change_Percent__c) + '%';
    }

    get ifStockPositive() {
        return Math.sign(this.stock.Change__c) >= 0
    }

    get intervalOptions() {
        return [
            { label: 'Months', value: '1month' },
            { label: 'Weeks', value: '1week' },
            { label: 'Days', value: '1day' },
        ];
    }

    get typeOptions() {
        return [
            { label: 'Mountain', value: 'mountain' },
            { label: 'Volume', value: 'volume' },
            { label: 'Candlestick', value: 'candlestick' },
        ];
    }

    get labels() {
        return this.data.map((series) => {
            if (this.intervalValue !== INTERVAL) {
                return new Date(series.Moment__c).toDateString().split(' ').slice(1, 3).join(' ');
            }
            let dateArr = new Date(series.Moment__c).toDateString().split(' ').slice(1, 4);
            return dateArr[0] + ' ' + dateArr[2];
        });
    }

    get dataPrice() {
        return this.data.map((series) => {
            return this.roundNum(series.Close__c);
        });
    }

    get dataVolume() {
        return this.data.map((series) => {
            return series.Volume__c;
        });
    }

    get dataLowBars() {
        return this.data.map((series) => {
           return [
               this.roundNum(series.Low__c),
               this.roundNum(series.Open__c < series.Close__c ? series.Open__c : series.Close__c)
           ];
        });
    }

    get dataMidBars() {
        return this.data.map((series) => {
           return [
               this.roundNum(series.Open__c < series.Close__c ? series.Open__c : series.Close__c),
               this.roundNum(series.Open__c < series.Close__c ? series.Close__c : series.Open__c)
           ];
        });
    }

    get dataHighBars() {
        return this.data.map((series) => {
            return [
                this.roundNum(series.Open__c < series.Close__c ? series.Close__c : series.Open__c),
                this.roundNum(series.High__c)
            ];
        });
    }

    get dataEMA() {
        let calculateEMA = function (values, prevEMA) {
            let data = (prevEMA === undefined ? [] : [prevEMA]);

            values.forEach((series) => {
                data.push(series.Close__c * (SMOOTHING / (1 + values.length)) + (data.length !== 0 ? data[data.length - 1] * (1 - (SMOOTHING / (1 + values.length))) : 0));
            });

            return data;
        }

        return this.roundData(calculateEMA(this.data, calculateEMA(this.preData).pop()).slice(1, SPLIT_LENGTH + 1));
    }

    get dataSMA() {
        let sum = function(arr) {
            return arr.reduce((partialSum, a) => partialSum + a.Close__c, 0);
        }

        let calculateSMA = function (preValues, values) {
            return (sum(preValues) + sum(values)) / (preValues.length + values.length);
        }

        let data = [];

        for (let i = 1; i <= SPLIT_LENGTH; i++) {
            data.push(calculateSMA(this.preData.slice(i, SPLIT_LENGTH), this.data.slice(0, i)));
        }

        return this.roundData(data);
    }

    get colors() {
        switch (this.typeValue) {
            case 'candlestick':
                return [['#12b818', '#4abd4e'], ['#f12727', '#f35a5a']];
            case 'volume':
                return [['#24A6FE', '#83CDFE'], ['#ff7708', '#f3a871']];
            case 'mountain':
                return [['#36A2EB', '#36A2EB'], ['#36A2EB', '#36A2EB']];
        }
    }

    get barColors() {
        let barBorderColors = [];
        let barBackgroundColors = [];
        let colorsArr = this.colors;

        this.data.forEach((series) => {
            barBorderColors.push(series.Close__c >= series.Open__c ? colorsArr[0][0] : colorsArr[1][0]);
            barBackgroundColors.push(series.Close__c >= series.Open__c ? colorsArr[0][1] : colorsArr[1][1]);
        });

        return [barBorderColors, barBackgroundColors];
    }

    roundNum(num) {
        return Math.round(num * 100) / 100;
    }

    roundData(data) {
        return data.map((num) => this.roundNum(num));
    }


    buildChart() {
        let [barBorderColors, barBackgroundColors] = this.barColors;

        try {
            const context = this.template.querySelector('canvas').getContext('2d');

            switch (this.typeValue) {
                case 'candlestick':
                    this.chart = new Chart(context, getConfigPortfolioCandleChart(
                        this.labels,
                        this.dataMidBars,
                        this.dataLowBars,
                        this.dataHighBars,
                        this.dataEMA,
                        this.dataSMA,
                        barBorderColors,
                        barBackgroundColors,
                    ));
                    break;
                case 'volume':
                    this.chart = new Chart(context, getConfigPortfolioVolumeChart(
                        this.labels,
                        this.dataVolume,
                        barBorderColors,
                        barBackgroundColors,
                    ));
                    break;
                case 'mountain':
                    let gradient = context.createLinearGradient(0, 0, 0, 600);
                    gradient.addColorStop(0, 'rgb(155, 213, 255)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

                    this.chart = new Chart(context, getConfigPortfolioMountainChart(
                        this.labels,
                        this.dataPrice,
                        barBorderColors[0],
                        gradient,
                    ));
                    break;
            }

            this.isLoaded = true;
        } catch (error) {
            console.log(error);
        }
    }

    handleIntervalChange(event) {
        this.destroyChart();
        this.intervalValue = event.detail.value;
    }

    handleTypeChange(event) {
        this.destroyChart();
        this.typeValue = event.detail.value;
        this.buildChart();
    }

    @api
    destroyChart() {
        this.isLoaded = false;
        this.chart.destroy();
    }

    handleHistoryClick() {
        this.isShowModal = true;
    }

    handleCloseModal() {
        this.isShowModal = false;
    }
}