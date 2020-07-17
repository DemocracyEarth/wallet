import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { displayModal, alert } from '/imports/ui/modules/modal';
import { defaults } from '/lib/const';
import { setupWeb3, getWeb3Wallet } from '/imports/startup/both/modules/metamask';
import { noWallet, alreadyVoted, pollClosed, notLogged, notSynced, notMember, walletError } from '/imports/ui/templates/timeline/choice/messages';
import { molochABI } from '/imports/ui/templates/timeline/abi';

const numeral = require('numeral');

const modal = {
  icon: Meteor.settings.public.app.logo,
  title: TAPi18n.__('wallet'),
  cancel: TAPi18n.__('close'),
  alertMode: true,
};

/**
* @summary displays the contents of a poll
*/
export default class Choice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      now: _.findWhere(Session.get('blockTimes'), { collectiveId: 'ETH' }).timestamp,
    };
  }

  getlabelClass() {
    if (this.props.percentage.toNumber() < 10) {
      return 'poll-score-percentage poll-score-small';
    }
    return 'poll-score-percentage';
  }

  getBarStyle() {
    if (this.props.label === TAPi18n.__('no')) {
      return 'poll-score-bar-fill poll-score-bar-fill-negative';
    }
    return 'poll-score-bar-fill';
  }

  pollOpen() {
    return (this.props.votingPeriodBegins > this.state.now && this.props.votingPeriodEnds < this.state.now);
  }

  canVote = async (accountAddress) => {
    const web3 = getWeb3Wallet();
    const dao = await new web3.eth.Contract(molochABI, this.props.publicAddress);
    const response = await dao.methods.members(accountAddress).call({}, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      return res;
    });
    return response.exists;
  };

  hasVoted = async (accountAddress) => {
    const web3 = getWeb3Wallet();
    const dao = await new web3.eth.Contract(molochABI, this.props.publicAddress);
    const response = await dao.methods.getMemberProposalVote(accountAddress, this.props.proposalIndex).call({}, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      return res;
    });
    return (response === 0 || response === '0');
  };

  execute = async () => {
    const web3 = getWeb3Wallet();
    const dao = await new web3.eth.Contract(molochABI, this.props.publicAddress);
    await dao.methods.submitVote(this.props.proposalIndex, this.props.voteValue).send({ from: this.props.accountAddress }, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      if (res) {
        displayModal(false, modal);
        alert(TAPi18n.__('voting-interaction').replace('{{collective}}', this.props.daoName).replace('{{etherscan}}', `${Meteor.settings.public.web.sites.blockExplorer}/tx/${res}`), 10000);
      }
      return res;
    });
  };

  vote = async () => {
    // blockchain sync
    const blockTimes = Session.get('blockTimes');
    if (!blockTimes || blockTimes.length === 0) {
      return notSynced();
    }

    // no web3 wallet
    if (!setupWeb3(true)) {
      return noWallet();
    }

    // user log in
    if (!Meteor.user()) {
      return notLogged();
    }

    // dao membership
    if (!await this.canVote(this.props.accountAddress)) {
      return notMember();
    }

    // already voted
    if (!await this.hasVoted(this.props.accountAddress)) {
      return alreadyVoted();
    }

    // poll date
    if (!this.pollOpen()) {
      return pollClosed();
    }

    // vote
    const icon = Meteor.settings.public.app.logo;
    let message;
    switch (this.props.voteValue) {
      case defaults.YES:
        message = TAPi18n.__('dao-confirm-tally').replace('{{voteValue}}', TAPi18n.__('yes')).replace('{{proposalName}}', this.props.title);
        break;
      case defaults.NO:
        message = TAPi18n.__('dao-confirm-tally').replace('{{voteValue}}', TAPi18n.__('no')).replace('{{proposalName}}', this.props.title);
        break;
      default:
        message = TAPi18n.__('dao-default-tally').replace('{{proposalName}}', this.props.title);
    }
    displayModal(
      true,
      {
        icon,
        title: TAPi18n.__('place-vote'),
        message,
        cancel: TAPi18n.__('close'),
        awaitMode: true,
        displayProfile: false,
      },
    );
    return await this.execute();
  }

  render() {
    return (
      <div className="poll-choice">
        <button className="button half choice" onClick={this.vote}>
          <div className="checkbox-mini check-mini-unselected-box">
            <div className="checkmark_kick check-mini-unselected-mark" />
            <div className="checkmark_stem check-mini-unselected-mark" />
          </div>
          {this.props.label}
          <div className="micro-button micro-button-feed no-underline micro-button-poll">
            <div className="micro-label">
              {this.props.children}
            </div>
          </div>
          <div className="poll-score poll-score-button">
            <div className="poll-score-bar">
              <div className={this.getBarStyle()} style={{ width: `${this.props.percentage}%` }} />
            </div>
            <div className={this.getlabelClass()}>
              {`${numeral(this.props.percentage).format('0.00')}%`}
            </div>
          </div>
        </button>
      </div>
    );
  }
}

Choice.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  accountAddress: PropTypes.string,
  percentage: PropTypes.string,
  label: PropTypes.string,
  voteValue: PropTypes.number,
  votingPeriodBegins: PropTypes.string,
  votingPeriodEnds: PropTypes.string,
  title: PropTypes.string,
  proposalIndex: PropTypes.string,
  publicAddress: PropTypes.string,
  daoName: PropTypes.string,
};

