var ctx = document.getElementById('line-chart').getContext('2d');
var chart;

var startDate;
var endDate;
var startIndex = 0;
var endIndex = 10;
var symbol;

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
                text: getChartTitle() + ' : ' + sel_key_value, // Call the function to get updated title
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
                display: false,
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


var startDatePicker = flatpickr("#startDate", {
    dateFormat: "l, F j, Y", // Format for displaying dates
    altFormat: "l, F j, Y", // Custom format for user input
    altInput: true, // Use alternate input field for user input
    onChange: function(selectedDates, dateStr, instance) {
        startDate = instance.formatDate(startDatePicker.selectedDates[0],  "l, F j, Y")
        console.log(startDate)
        var index = df_securities.labels.indexOf(startDate)
        console.log(index)
        if (index==-1) {
            startDate = findStartDate(selectedDates, instance, df_securities)
        }
        console.log('startDate: ', startDate)
        populateTable(startDate, endDate)
    }
});
var endDatePicker = flatpickr("#endDate", {
    dateFormat: "l, F j, Y", // Format for displaying dates
    altFormat: "l, F j, Y", // Custom format for user input
    altInput: true, // Use alternate input field for user input
    onChange: function(selectedDates, dateStr, instance) {
        endDate = instance.formatDate(endDatePicker.selectedDates[0],  "l, F j, Y");
        console.log(endDate);
        index = df_securities.labels.indexOf(endDate);
        console.log(index);
        if (index == -1) {
            endDate = findEndDate(selectedDates, instance, df_securities);
        }
        populateTable(startDate, endDate)
    }
});

function findStartDate(selectedDates, instance, df_securities) {
    var i = 0;
    var direction = 1;
    var index = -1;
    var startDate = '';

    while (index === -1) {
        i++;
        document.getElementById('error-message').textContent = '';
        var selectedDateObj = new Date(selectedDates[0]);
        selectedDateObj.setDate(selectedDateObj.getDate() - (i * direction));
        var previousDate = instance.formatDate(selectedDateObj, "l, F j, Y");
        console.log("Previous Date:", previousDate, ' <<< assigned to startDate.');
        index = df_securities.labels.indexOf(previousDate);
        console.log(index);
        startDate = previousDate;

        // Check if the date is not recognized and change direction
        if (i === 20 && index === -1) {
            if (direction === 1) {
                direction = -1;
                i = 0;
            } else {
                document.getElementById('error-message').textContent = 'no stock information within 20 days up/down.';
                break;
            }
        }
    }
    return startDate;
}
function findEndDate(selectedDates, instance, df_securities) {
    var i = 0;
    var direction = 1;
    var index = -1;
    var endDate = '';

    while (index === -1) {
        i++;
        document.getElementById('error-message').textContent = '';
        var selectedDateObj = new Date(selectedDates[0]);
        selectedDateObj.setDate(selectedDateObj.getDate() - (i * direction));
        var previousDate = instance.formatDate(selectedDateObj, "l, F j, Y");
        console.log("Previous Date:", previousDate, ' <<< assigned to endDate.');
        index = df_securities.labels.indexOf(previousDate);
        console.log(index);
        endDate = previousDate;

        // Check if the date is not recognized and change direction
        if (i === 20 && index === -1) {
            if (direction === 1) {
                direction = -1;
                i = 0;
            } else {
                document.getElementById('error-message').textContent = 'no stock information within 20 days up/down.';
                break;
            }
        }
    }
    return endDate;
}

function alldate_show() {
    updateChartData(alldate=true);
}


var previous_all = false;
// Function to update chart data based on selected date range
function updateChartData(alldate=false) {
    document.getElementById('error-message').textContent = '';
    try {
        if (!alldate){
            previous_all = false;
            console.log("update Start Date:", startDate);
            console.log("update End Date:", endDate);
            startIndex = df_securities.labels.indexOf(startDate)+1
            endIndex = df_securities.labels.indexOf(endDate)
        }
        else {
            
            console.log('ALL DATE')
            tmp_start = findEndDate([df_securities.labels[df_securities.labels.length - 1]], endDatePicker, df_securities);
            tmp_end = findStartDate([df_securities.labels[0]], startDatePicker, df_securities);
            startIndex = df_securities.labels.indexOf(tmp_start)+1
            endIndex = df_securities.labels.indexOf(tmp_end)
            if (previous_all==false){
                populateTable(tmp_start, tmp_end)
                previous_all = true;
            }
        }
        symbol = document.getElementById('symbolInput').value;
        for (var key in df_securities) {
            if (key === symbol) {
                var count = 0;
                for (var i = startIndex; i >= endIndex; i--) {
                    if (parseFloat(df_securities[key][i]) > 0) {
                        console.log('i=',i)
                        count++;
                    }
                }
                sel_key_value = count;
                console.log('sel_key_value: ',sel_key_value,count)
            }
        }
        drawChart(df_securities, closing_prices, symbol, chartOptionsDefault)
    }
    catch (error) {
        document.getElementById('error-message').textContent = 'ERROR DETECTED';
    }
}

// Function to get chart title based on selected data
function getChartTitle() {
    symbol = document.getElementById('symbolInput').value;
    console.log('symbol in getChartTitle: ',symbol)
    return symbol
}

// Function to draw the chart with given data
function drawChart(df_securities, closing_prices, stock_name, chartOption=chartOptionsDefault) {
    if (chart) {
        chart.resetZoom();
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
}


