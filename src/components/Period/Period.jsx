import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';
import 'styles/Dapp.css';

/**
* @summary renders a post in the timeline
*/
export default class Period extends Component {
  constructor(props) {
    super(props);

    this.state = {
      beginning: new Date(parseInt(Number(this.props.votingPeriodBegins) * 1000, 10)).getTime(),
      end: new Date(parseInt(Number(this.props.votingPeriodEnds) * 1000, 10)).getTime(),
      graceEnd: new Date(parseInt(Number(this.props.gracePeriodEnds) * 1000, 10)).getTime(),
    };
  }

  getStyle() {
    if (this.props.now > this.state.graceEnd) {
      return `warning period period-${this.props.status.toLowerCase()}`;
    } else if (this.props.now > this.state.end) {
      return 'warning period period-grace';
    } else if (this.props.now > this.state.beginning) {
      return 'warning period period-voting';
    }
    return 'warning period period-queue';
  }

  getLabel() {
    if (this.props.now > this.state.graceEnd) {
      return i18n.t(`moloch-period-${this.props.status.toLowerCase()}`);
    } else if (this.props.now > this.state.end) {
      return i18n.t('moloch-period-grace');
    } else if (this.props.now > this.state.beginning) {
      return i18n.t('moloch-period-voting');
    }
    return i18n.t('moloch-period-queue');
  }

  render() {
    return (
      <div>
        <div className="warning-list animate">
          <div className={this.getStyle()}>
            {this.getLabel()}
          </div>
        </div>
      </div>
    );
  }
}

Period.propTypes = {
  now: PropTypes.number,
  votingPeriodBegins: PropTypes.string,
  votingPeriodEnds: PropTypes.string,
  gracePeriodEnds: PropTypes.string,
  status: PropTypes.string,
};
