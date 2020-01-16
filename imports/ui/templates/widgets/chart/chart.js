import { Template } from 'meteor/templating';
import { Collectives } from '/imports/api/collectives/Collectives';

import '/imports/ui/templates/widgets/chart/chart.html';

const Chart = require('chart.js');

const defaultChart = {
  type: 'line',
  data: {
    datasets: [{
      data: [],
    }],
  },
  options: {
    elements: {
      point: {
        radius: 0,
      },
    },
    responsive: true,
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
        },
      }],
      xAxes: [{
        display: false,
        type: 'time',
        distribution: 'linear',
        gridLines: {
          display: false,
        },
        stacked: true,
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 6,
        },
      }],
    },
  },
};

const _setupChart = (collectiveId, guildLabel) => {
  const ctx = document.getElementById(`collectiveChart-${collectiveId}`);
  const collective = Collectives.findOne({ _id: collectiveId });

  const finalChart = defaultChart;
  finalChart.data.datasets = _.findWhere(collective.profile.chart, { guildLabel }).dataset;
  finalChart.data.datasets[0].backgroundColor = ['#00c0912e'];
  finalChart.data.datasets[0].borderColor = ['#00c091'];
  finalChart.data.datasets[0].borderWidth = 0;

  return new Chart(ctx, finalChart);
};

Template.chart.onRendered(function () {
  _setupChart(Template.instance().data.collectiveId, Template.instance().data.guildLabel);
});
