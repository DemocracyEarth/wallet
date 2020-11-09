import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { defaults } from 'lib/const';
import { noWallet, alreadyVoted, pollClosed, notSynced, notMember, walletError } from 'components/Choice/messages';
import { abiLibrary } from 'lib/abi';

import logo from 'images/logo.png';

import { config } from 'config'
import i18n from 'i18n';
import 'styles/Dapp.css';

const Web3 = require('web3');
const numeral = require('numeral');

/**
* @summary displays the contents of a poll
*/
export default class Choice extends Component {
  static propTypes = {
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
    abi: PropTypes.string,
  }

  constructor (props) {
    super(props);

    this.state = {
      showModal: false,
    }
  }

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
    const web3 = new Web3(window.web3.currentProvider);
    const dao = await new web3.eth.Contract(abiLibrary[this.props.abi], this.props.publicAddress);
    const response = await dao.methods.members(web3.utils.toChecksumAddress(accountAddress)).call({}, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      return res;
    });
    return response.exists;
  };

  hasVoted = async (accountAddress) => {
    const web3 = new Web3(window.web3.currentProvider);
    const dao = await new web3.eth.Contract(abiLibrary[this.props.abi], this.props.publicAddress);
    const response = await dao.methods.getMemberProposalVote(web3.utils.toChecksumAddress(accountAddress), this.props.proposalIndex).call({}, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      return res;
    });
    return (response === 0 || response === '0');
  };

  execute = async () => {
    const web3 = new Web3(window.web3.currentProvider);
    const dao = await new web3.eth.Contract(abiLibrary[this.props.abi], this.props.publicAddress);
    await dao.methods.submitVote(this.props.proposalIndex, this.props.voteValue).send({ from: this.props.accountAddress }, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      if (res) {
        // displayModal(false, modal);
        this.setState({ showModal: false })
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
    if (!window.web3 || !window.web3.currentProvider) {
      return noWallet();
    }

    // dao membership
    if (!await this.canVote(this.props.accountAddress)) {
      return notMember();
    }
/*
    // already voted
    if (!await this.hasVoted(this.props.accountAddress)) {
      return alreadyVoted();
    }

    // poll date
    if (!this.pollOpen()) {
      return pollClosed();
    }
*/

    // vote
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

    window.modal = {
      icon: logo,
      title: i18n.t('place-vote'),
      message,
      cancel: i18n.t('close'),
      mode: 'AWAIT'
    }
    window.showModal.value = true;
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

