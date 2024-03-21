var ctx = document.getElementById('line-chart').getContext('2d');
var chart;

var startDate;
var endDate;
var startIndex = 0;
var endIndex = 10;
let currentMode = 'small'; // Initially set to small mode

// add data from html code

// Merge default values with provided containerSize (if any)
var chartContainerSize = {
    width: 5,
    height: 5
};

var chartContainer = document.getElementById('chartContainer');

var chartOptionsDefault  = {
    responsive: true,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    stacked: false,
    plugins: {
        get title() {
            return {
                display: true,
                text: getChartTitle(), // Call the function to get updated title
                font: {
                    size: 32 // Change font size as needed
                }
            };
        },
        zoom: {
            pan: {
                enabled: true,
                mode: 'x',
                scaleMode: 'y'
            },
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true,
                },
                mode: 'x',
                scaleMode: 'y'
            }
        }
    },
    scales: {
        x: {
            display: true,
            title: {
                display: true,
                text: 'DateTime'
            },
            ticks: {
                maxRotation: 90,
                minRotation: 90
            }
        },
        y1: {
            type: 'linear',
            title: {
                display: true,
                text: '%Trading by Programming.'
            },
            position: 'left',
        },
        y2: {
            type: 'linear',
            title: {
                display: true,
                text: 'Closing Price.'
            },
            position: 'right'
        }
    }
};
var sel_chartOption = Object.assign({}, chartOptionsDefault);

// Initialize flatpickr date pickers
var startDatePicker = flatpickr("#startDate", {
    dateFormat: "l, F j, Y", // Format for displaying dates
    altFormat: "l, F j, Y", // Custom format for user input
    altInput: true, // Use alternate input field for user input
    onChange: function(selectedDates, dateStr, instance) {
        startDate = instance.formatDate(startDatePicker.selectedDates[0],  "l, F j, Y")
        console.log(startDate)
        var index = df_securities.labels.indexOf(startDate)
        console.log(index)
        var i = 0;
        var direction = 1;
        while (index==-1) {
            document.getElementById('error-message').textContent = '';
            i = i + 1
            var selectedDateObj = new Date(selectedDates[0]);
            selectedDateObj.setDate(selectedDateObj.getDate() - (i * direction));
            var previousDate = instance.formatDate(selectedDateObj, "l, F j, Y");
            console.log("Previous Date:", previousDate, ' <<< assigned to startDate.');
            index = df_securities.labels.indexOf(previousDate)
            console.log(index)
            startDate = previousDate;
            if (i === 20 && index == -1) {
                if (direction === -1) {
                    document.getElementById('error-message').textContent = 'no stock information within 20 days up/down.';
                    break
                }
                i = 0;
                direction = -1; // Change direction
            }
            console.log(i)
        }
    }
});
var endDatePicker = flatpickr("#endDate", {
    dateFormat: "l, F j, Y", // Format for displaying dates
    altFormat: "l, F j, Y", // Custom format for user input
    altInput: true, // Use alternate input field for user input
    onChange: function(selectedDates, dateStr, instance) {
        endDate = instance.formatDate(endDatePicker.selectedDates[0],  "l, F j, Y")
        console.log(endDate)
        index = df_securities.labels.indexOf(endDate)
        console.log(index)
        var i = 0;
        while (index==-1) {
            i = i + 1
            var selectedDateObj = new Date(selectedDates[0]);
            selectedDateObj.setDate(selectedDateObj.getDate() - i);
            var previousDate = instance.formatDate(selectedDateObj, "l, F j, Y");
            console.log("Previous Date:", previousDate, ' <<< assigned to startDate.');
            index = df_securities.labels.indexOf(previousDate)
            console.log(index)
            endDate = previousDate;
        }
    }
});

// Function to update chart data based on selected date range

function updateChartData() {
    document.getElementById('error-message').textContent = '';
    try {
        startIndex = df_securities.labels.indexOf(startDate)+1
        endIndex = df_securities.labels.indexOf(endDate)
        updateChart()
    }
    catch (error) {
        document.getElementById('error-message').textContent = 'ERROR DETECTED';
    }
}

// Function to update the chart based on user input
function updateChart() {
    symbol = document.getElementById('symbolInput').value;
    drawChart(df_securities, closing_prices, symbol, chartOptionsDefault)
}

// Function to get chart title based on selected data
function getChartTitle() {
    symbol = document.getElementById('symbolInput').value;
    return symbol
}

// Function to draw the chart with given data
function drawChart(df_securities, closing_prices, stock_name, chartOption=chartOptionsDefault) {
    if (chart) {
        chart.destroy(); // If chart already exists, destroy it
        console.log('chart destroy')
    }
    console.log('start=',startIndex,' end=',endIndex, 'stockname=',stock_name)
    var labels = df_securities.labels.slice(endIndex, startIndex).reverse();
    try {
        var column1Data = df_securities[stock_name].slice(endIndex, startIndex).reverse();
    }
    catch {

    }
    try {
        var column2Data = closing_prices[stock_name].slice(endIndex, startIndex).reverse();
    }
    catch {

    }
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '% Program Trading',
                data: column1Data,
                yAxisID: 'y1',
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.5)',
            }, {
                label: 'Closing Price',
                data: column2Data,
                yAxisID: 'y2',
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
            }]
        },
        options: chartOptionsDefault
    });
    chart.canvas.parentNode.style.height    = '600px';
    chart.canvas.parentNode.style.width     = '80%';
    console.log('last row here.')
    console.log('current wh: ',chart.canvas.parentNode.style.width, ':', chart.canvas.parentNode.style.height)
}

// Function to toggle chart size
function toggleChartSize() {

    // Toggle between small and full mode sizes
    if (chartContainer.classList.contains('small-mode')) {
        // Switch to full mode
        chartContainer.style.width = fullModeSize.width;
        chartContainer.style.height = fullModeSize.height + 'px';
        chart.options.scales.x.ticks.display = true;
        chart.data.datasets.forEach(function(dataset) {
            dataset.showLine = true; // Show line
            
            dataset.pointRadius = 4; // Set point radius

            dataset.pointBorderColor = dataset.borderColor; // Set point border color
            dataset.pointBackgroundColor = dataset.backgroundColor; // Set point background color
        });
    } else {
        // Switch to small mode
        chartContainer.style.width = smallModeSize.width + 'px';
        chartContainer.style.height = smallModeSize.height + 'px';
        chart.options.scales.x.ticks.display = false;
        // chart.plugins.title.font = 15;
        chart.data.datasets.forEach(function(dataset) {
            dataset.showLine = true; // Show line

            dataset.pointRadius = 0; // Set point radius

        });
    }

    // Toggle small and full mode classes
    chartContainer.classList.toggle('small-mode');
    chartContainer.classList.toggle('full-size-mode');
    console.log('w ',chartContainer.style.width)
    console.log('h ',chartContainer.style.height)
}

var smallModeSize = {
    width: 400,
    height: 200
};

var fullModeSize = {
    width: '100%',
    height: 900
};
