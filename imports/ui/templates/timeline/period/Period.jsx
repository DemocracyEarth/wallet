import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

/**
* @summary renders a post in the timeline
*/
export default class Period extends Component {
  constructor(props) {
    super(props);

    this.state = {
      now: _.findWhere(Session.get('blockTimes'), { collectiveId: 'ETH' }).timestamp,
      beginning: new Date(parseInt(this.props.votingPeriodBegins.toNumber() * 1000, 10)).getTime(),
      end: new Date(parseInt(this.props.votingPeriodEnds.toNumber() * 1000, 10)).getTime(),
      graceEnd: new Date(parseInt(this.props.gracePeriodEnds.toNumber() * 1000, 10)).getTime(),
    };
  }

  render() {
    return (
      <div>
        <div className="warning-list animate">
          <div className="warning period period-passed">
            {this.state.now}
          </div>
        </div>
      </div>
    );
  }
}

Period.propTypes = {
  votingPeriodBegins: PropTypes.string,
  votingPeriodEnds: PropTypes.string,
  gracePeriodEnds: PropTypes.string,
};
