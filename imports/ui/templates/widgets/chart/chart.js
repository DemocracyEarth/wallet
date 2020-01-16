import { Template } from 'meteor/templating';
import { Collectives } from '/imports/api/collectives/Collectives';

import '/imports/ui/templates/widgets/chart/chart.html';

const Chart = require('chart.js');

const defaultChart = {
  type: 'line',
  data: {
    datasets: [{
      data: [
        {
          t: new Date("2015-3-15 13:3"),
          y: 12,
        },
        {
          t: new Date("2015-3-25 13:2"),
          y: 21,
        },
        {
          t: new Date("2015-4-25 14:12"),
          y: 32,
        },
      ],
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

  console.log(JSON.stringify(defaultChart.data.datasets));

  console.log(JSON.stringify(collective.profile.chart));

  const finalChart = defaultChart;
  finalChart.data.datasets = _.findWhere(collective.profile.chart, { guildLabel }).dataset;
  finalChart.data.datasets[0].backgroundColor = ['#00c0912e'];
  finalChart.data.datasets[0].borderColor = ['#00c091'];
  finalChart.data.datasets[0].borderWidth = 0;

  console.log(JSON.stringify(finalChart.data.datasets));
  console.log(JSON.stringify(collective.profile.guild));


  return new Chart(ctx, finalChart);
};

Template.chart.onRendered(function () {
  _setupChart(Template.instance().data.collectiveId, Template.instance().data.guildLabel);
});
