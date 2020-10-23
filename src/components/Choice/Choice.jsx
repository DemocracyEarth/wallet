import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { defaults } from 'lib/const';
import { getWallet } from 'lib/wallet';
import { noWallet, alreadyVoted, pollClosed, notSynced, notMember, walletError } from 'components/Choice/messages';
import { molochABI } from 'lib/abi';

import { displayModal } from 'components/Modal/Modal';
import logo from 'images/logo.png';

import { config } from 'config'
import i18n from 'i18n';
import 'styles/Dapp.css';

const numeral = require('numeral');

const modal = {
  icon: logo,
  title: i18n.t('wallet'),
  cancel: i18n.t('close'),
  alertMode: true,
};

/**
* @summary displays the contents of a poll
*/
export default class Choice extends Component {
  getlabelClass() {
    if (Number(this.props.percentage) < 10) {
      return 'poll-score-percentage poll-score-small';
    }
    return 'poll-score-percentage';
  }

  getBarStyle() {
    if (this.props.label === i18n.t('no')) {
      return 'poll-score-bar-fill poll-score-bar-fill-negative';
    }
    return 'poll-score-bar-fill';
  }

  pollOpen() {
    const now = parseInt(this.props.now / 1000, 10);
    return ((this.props.votingPeriodBegins < now) && (this.props.votingPeriodEnds > now));
  }

  canVote = async (accountAddress) => {
    const web3 = getWallet();
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
    const web3 = getWallet();
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
    const web3 = getWallet();
    const dao = await new web3.eth.Contract(molochABI, this.props.publicAddress);
    await dao.methods.submitVote(this.props.proposalIndex, this.props.voteValue).send({ from: this.props.accountAddress }, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      if (res) {
        displayModal(false, modal);
        alert(i18n.t('voting-interaction', { collective: this.props.daoName, etherscan: `${config.web.explorer}/tx/${res}` }), 10000);
      }
      return res;
    });
  };

  vote = async () => {
    // blockchain sync
    if (!this.props.now || this.props.now === 0) {
      return notSynced();
    }

    // no web3 wallet
    if (!getWallet()) {
      return noWallet();
    }

    // user log in
    /**
      TODO: verify user properly
    if (!Meteor.user()) {
      return notLogged();
    }*/

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
    const icon = logo;
    let message;
    switch (this.props.voteValue) {
      case defaults.YES:
        message = i18n.t('dao-confirm-tally', { voteValue: i18n.t('yes'), proposalName: this.props.title });
        break;
      case defaults.NO:
        message = i18n.t('dao-confirm-tally', { voteValue: i18n.t('no'), proposalName: this.props.title });
        break;
      default:
        message = i18n.t('dao-default-tally', { proposalName: this.props.title });
    }
    displayModal(
      true,
      {
        icon,
        title: i18n.t('place-vote'),
        message,
        cancel: i18n.t('close'),
        awaitMode: true,
        displayProfile: false,
      },
    );
    return await this.execute();
  }

  render() {
    return (
      <div className="poll-choice">
        <button className="button half choice"> {/* onClick={this.vote} */}
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
  now: PropTypes.number,
};

