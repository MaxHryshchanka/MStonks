const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const getConfigStockChart = (values, labels, background) => {
    let minY = Math.min.apply(Math, values) - 1;

    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Close Price',
                data: values,
                tension: 0.4,
                fill: true,
                borderColor: '#36A2EB',
                backgroundColor: background
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    min: minY,
                    beginAtZero: true,
                    display: false,
                    grid: {
                        display: false
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                },
            }
        }
    };
}

const getConfigPortfolioCandleChart = (labels, dataMidBars, dataLowBars, dataHighBars, dataEMA, dataSMA, barBorderColors, barBackgroundColors) => {
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Trade Price',
                    data: dataMidBars,
                    borderColor: barBorderColors,
                    backgroundColor: barBackgroundColors,
                    borderWidth: 2,
                    borderRadius: 2,
                    borderSkipped: false,
                    minBarLength: 15,
                    maxBarThickness: 16,
                },
                {
                    label: 'Lowest Price',
                    data: dataLowBars,
                    backgroundColor: barBorderColors,
                    maxBarThickness: 2,
                },
                {
                    label: 'Highest Price',
                    data: dataHighBars,
                    backgroundColor: barBorderColors,
                    maxBarThickness: 2,
                },
                {
                    type: 'line',
                    label: 'EMA (50)',
                    data: dataEMA,
                    backgroundColor: '#fdbd91',
                    borderColor: '#f18033',
                    tension: 0.3,
                },
                {
                    type: 'line',
                    label: 'SMA (50)',
                    data: dataSMA,
                    backgroundColor: '#93c8f3',
                    borderColor: '#58b1f8',
                    tension: 0.3,
                },
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        filter: function (label) {
                            if (label.text === 'Lowest Price' || label.text === 'Highest Price') {
                                return false;
                            }
                            return true;
                        }
                    },
                    onClick: function (e, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;

                        if (ci.isDatasetVisible(index)) {
                            if (index === 0) {
                                ci.setDatasetVisibility(1, false);
                                ci.setDatasetVisibility(2, false);
                            }
                            ci.hide(index);
                            legendItem.hidden = true;
                        } else {
                            if (index === 0) {
                                ci.setDatasetVisibility(1, true);
                                ci.setDatasetVisibility(2, true);
                            }
                            ci.show(index);
                            legendItem.hidden = false;
                        }
                    }
                },
                title: {
                    align: 'end',
                    display: true,
                    text: 'Candlestick Chart'
                }
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function (value, index, ticks) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    }
}

const getConfigPortfolioVolumeChart = (labels, dataBars, barBorderColors, barBackgroundColors) => {
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Volume (in millions)',
                    data: dataBars,
                    borderColor: barBorderColors,
                    backgroundColor: barBackgroundColors,
                    borderWidth: 2,
                    borderRadius: 5,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    align: 'end',
                    display: true,
                    text: 'Volume Chart'
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, ticks) {
                            return value / 1000000 + 'm';
                        }
                    }
                }
            }
        }
    }
}

const getConfigPortfolioMountainChart = (labels, dataPrice, barBorderColors, barBackgroundColors) => {
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Close Price',
                    data: dataPrice,
                    borderColor: barBorderColors,
                    backgroundColor: barBackgroundColors,
                    fill: true,
                    tension: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    align: 'end',
                    display: true,
                    text: 'Mountain Chart'
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, ticks) {
                            return value + '$';
                        }
                    }
                }
            }
        }
    }
}

export {getConfigStockChart, getConfigPortfolioCandleChart, getConfigPortfolioVolumeChart, getConfigPortfolioMountainChart, DAY_LABELS}