import { Template } from 'meteor/templating';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getCoin } from '/imports/api/blockchain/modules/web3Util';

import '/imports/ui/templates/widgets/chart/chart.html';

const Chart = require('chart.js');

/**
 * Shorten number to thousands, millions, billions, etc.
 * http://en.wikipedia.org/wiki/Metric_prefix
 *
 * @param {number} num Number to shorten.
 * @param {number} [digits=0] The number of digits to appear after the decimal point.
 * @returns {string|number}
 *
 * @example
 * // returns '12.5k'
 * shortenLargeNumber(12543, 1)
 *
 * @example
 * // returns '-13k'
 * shortenLargeNumber(-12567)
 *
 * @example
 * // returns '51M'
 * shortenLargeNumber(51000000)
 *
 * @example
 * // returns 651
 * shortenLargeNumber(651)
 *
 * @example
 * // returns 0.12345
 * shortenLargeNumber(0.12345)
 */
const shortenLargeNumber = (num, digits) => {
  const units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  let decimal;

  for (let i = units.length - 1; i >= 0; i -= 1) {
    decimal = Math.pow(1000, i + 1);

    if (num <= -decimal || num >= decimal) {
      return +(num / decimal).toFixed(digits) + units[i];
    }
  }

  return num;
};

const defaultChart = {
  type: 'line',
  data: {
    datasets: [{
      data: [],
    }],
  },
  options: {
    animation: {
      duration: 0,
    },
    tooltips: { enabled: false },
    hover: { mode: null },
    elements: {
      point: {
        radius: 0,
      },
      line: {
        tension: 0,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      yAxes: [{
        display: true,
        gridLines: {
          drawBorder: false,
          zeroLineWidth: 0,
          borderDash: [2, 2],
          display: true,
          color: '#f1f1f1',
        },
        stacked: true,
        ticks: {
          fontColor: '#7d849f',
          fontSize: 9,
          beginAtZero: false,
          maxTicksLimit: 6,
        },
      }],
      xAxes: [{
        display: true,
        type: 'time',
        distribution: 'linear',
        gridLines: {
          borderDash: [2, 2],
          zeroLineWidth: 0,
          display: true,
          color: '#f1f1f1',
        },
        stacked: true,
        ticks: {
          fontSize: 9,
          fontColor: '#7d849f',
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
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
  const token = getCoin(_.findWhere(collective.profile.guild, { name: guildLabel }).type.replace('token.', ''));
  const finalChart = defaultChart;
  finalChart.data.datasets = _.findWhere(collective.profile.chart, { guildLabel }).dataset;
  finalChart.data.datasets[0].backgroundColor = [`${token.color}33`];
  finalChart.data.datasets[0].borderColor = [token.color];
  finalChart.data.datasets[0].borderWidth = 1.5;
  finalChart.data.datasets[0].lineTension = 0.5;
  finalChart.options.scales.yAxes[0].ticks.callback = (value) => {
    return token ? shortenLargeNumber(value, 0) : value;
  };
  return new Chart(ctx, finalChart);
};

Template.chart.onRendered(function () {
  _setupChart(Template.instance().data.collectiveId, Template.instance().data.guildLabel);
});
