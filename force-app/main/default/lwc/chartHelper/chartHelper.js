const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const getConfigStockChart = (data, background) => {
    let minY = Math.min.apply(Math, data) - 1;

    return {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: '# of Votes',
                data: data,
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

export {getConfigStockChart, getRandomInt}