import { Template } from 'meteor/templating';

import '/imports/ui/templates/widgets/chart/chart.html';

const Chart = require('chart.js');

const _setupChart = (collectiveId) => {
  const ctx = $(`#collectiveChart-${collectiveId}`); // document.getElementById(`collectiveChart-${collectiveId}`);
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      datasets: [{
        label: 'Total Scorer',
        data: [5904, 5993, 6040, 6493, 6599, 7005, 3040, 5030, 4500, 6000, 5960, 7690],
        backgroundColor: [
          '#00c0912e',
        ],
        borderColor: [
          '#00c091',
        ],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      legend: {
        display: false,
      },
      scales: {
        yAxes: [{
          display: false,
          gridLines: {
            display: false,
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 6,
            suggestedMin: 5904,
            suggestedMax: 7690,
          },
        }],
        xAxes: [{
          display: false,
          gridLines: {
            display: false,
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
            maxTicksLimit: 6,
            suggestedMin: 5904,
            suggestedMax: 7690,
          },
        }],
      },
    },
  });
};

Template.chart.onRendered(function () {
  _setupChart(Template.instance().data.collectiveId);
});
