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

export {getConfigStockChart, DAY_LABELS}