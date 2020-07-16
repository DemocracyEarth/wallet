import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';
import { TAPi18n } from 'meteor/tap:i18n';

import { wrapURLs } from '/lib/utils';

import Account from '/imports/ui/templates/timeline/account/Account.jsx';
import Stamp from '/imports/ui/templates/timeline/stamp/Stamp.jsx';
import Parameter from '/imports/ui/templates/timeline/parameter/Parameter.jsx';
import Token from '/imports/ui/templates/timeline/token/Token.jsx';
import Countdown from '/imports/ui/templates/timeline/countdown/Countdown.jsx';
import Poll from '/imports/ui/templates/timeline/poll/Poll.jsx';
import Choice from '/imports/ui/templates/timeline/choice/Choice.jsx';
import Period from '/imports/ui/templates/timeline/period/Period.jsx';


/**
* @summary quick function to determine if a string is a JSON
* @param {string} str ing
*/
const _isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};


const _getPercentage = (percentageAmount, remainder) => {
  return parseFloat((percentageAmount * 100) / (percentageAmount + remainder), 10);
};

/**
* @summary renders a post in the timeline
*/
export default class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yesPercentage: _getPercentage(this.props.yesShares.toNumber(), this.props.noShares.toNumber()).toString(),
      noPercentage: _getPercentage(this.props.noShares.toNumber(), this.props.yesShares.toNumber()).toString(),
    };
    this.state = Object.assign(this.getDescription(), this.state);
  }

  getDescription() {
    // content formatting
    let content;
    if (_isJSON(this.props.description)) {
      const json = JSON.parse(this.props.description);

      content = {
        title: json.title ? json.title : json,
        description: json.description ? wrapURLs(json.description) : '',
        link: (typeof json.link === 'function' || !json.link) ? '' : json.link,
      };
    } else {
      content = {
        title: wrapURLs(this.props.description),
        description: null,
        link: null,
      };
    }
    return content;
  }

  getPeriodLabel() {
    return this.props.yesVotes;
  }

  getPeriodStatus() {
    return this.props.yesVotes;
  }

  totalVoters() {
    return parseInt(this.props.yesVotes.toNumber() + this.props.noVotes.toNumber(), 10).toString();
  }

  render() {
    return (
      <div id={this.props.id} className="vote vote-search vote-feed nondraggable vote-poll" href={`/dao/${this.props.daoName}/proposal/${this.props.proposalIndex}`}>
        <div className="checkbox checkbox-custom">
          <div className="meta meta-search meta-bar">
            <Account
              id={`avatar-${this.props.memberAddress}`}
              publicAddress={this.props.memberAddress}
              width="24px"
              height="24px"
            />
          </div>
          <div className="option-proposal">
            <div className="option-title option-link option-search title-input">
              <div className="title-input title-feed">
                <div className="title-header">
                  {typeof this.state.title === 'string' ? parser(this.state.title) : this.state.title}
                </div>
                <div className="title-description">
                  {typeof this.state.description === 'string' ? parser(this.state.description) : this.state.description}
                </div>
                {
                  (this.state.link) ?
                    <div className="title-description">
                      <a href={this.state.link} target="_blank" rel="noopener noreferrer">{this.state.link}</a>
                    </div>
                    :
                    null
                }
              </div>
            </div>
          </div>
          <Stamp timestamp={this.props.timestamp} />
          <div className="smart-contract">
            <Parameter label={TAPi18n.__('moloch-applicant')}>
              <Account id={`avatar-${this.props.applicantAddress}`} publicAddress={this.props.applicantAddress} width="24px" height="24px" />
            </Parameter>
            <Parameter label={TAPi18n.__('moloch-request')}>
              <Token quantity={this.props.sharesRequested.toString()} symbol="SHARES" />
            </Parameter>
            <Parameter label={TAPi18n.__('moloch-tribute')}>
              <Token quantity={this.props.tokenTribute.toString()} symbol="WETH" />
            </Parameter>
          </div>
          <Countdown votingPeriodBegins={this.props.votingPeriodBegins} votingPeriodEnds={this.props.votingPeriodEnds} gracePeriodEnds={this.props.gracePeriodEnds} totalVoters={this.totalVoters()} />
          <Poll>
            <Choice accountAddress={this.props.accountAddress} daoName={this.props.daoName} publicAddress={this.props.publicAddress} proposalIndex={this.props.proposalIndex} label={TAPi18n.__('yes')} percentage={this.state.yesPercentage} voteValue={1} votingPeriodEnds={this.props.votingPeriodEnds} votingPeriodBegins={this.props.votingPeriodBegins}>
              <Token quantity={this.props.yesVotes} symbol="SHARES" />
            </Choice>
            <Choice accountAddress={this.props.accountAddress} daoName={this.props.daoName} publicAddress={this.props.publicAddress} proposalIndex={this.props.proposalIndex} label={TAPi18n.__('no')} percentage={this.state.noPercentage} barStyle="poll-score-bar-fill-negative" voteValue={2} votingPeriodEnds={this.props.votingPeriodEnds} votingPeriodBegins={this.props.votingPeriodBegins}>
              <Token quantity={this.props.noVotes} symbol="SHARES" />
            </Choice>
          </Poll>
          <Period votingPeriodBegins={this.props.votingPeriodBegins} votingPeriodEnds={this.props.votingPeriodEnds} gracePeriodEnds={this.props.gracePeriodEnds} />
        </div>
      </div>
    );
  }
}

Post.propTypes = {
  id: PropTypes.string,
  publicAddress: PropTypes.string,
  accountAddress: PropTypes.string,
  description: PropTypes.string,
  proposalIndex: PropTypes.string,
  daoName: PropTypes.string,
  memberAddress: PropTypes.string,
  applicantAddress: PropTypes.string,
  timestamp: PropTypes.string,
  sharesRequested: PropTypes.string,
  tokenTribute: PropTypes.string,
  votingPeriodBegins: PropTypes.string,
  votingPeriodEnds: PropTypes.string,
  gracePeriodEnds: PropTypes.string,
  yesVotes: PropTypes.string,
  noVotes: PropTypes.string,
  yesShares: PropTypes.string,
  noShares: PropTypes.string,
};
