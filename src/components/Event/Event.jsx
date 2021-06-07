import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { useHistory } from "react-router-dom";
import { Link } from 'react-router-dom';

import { shortenCryptoName } from 'utils/strings';
import Account from 'components/Account/Account';
import DAO from 'components/DAO/DAO';
import Stamp from 'components/Stamp/Stamp';
import Transaction from 'components/Transaction/Transaction';

import { gui, defaults, view as routerView } from 'lib/const';

import parser from 'html-react-parser';
import { query } from 'components/Vote/queries'
import { config } from 'config'

import { ubidaiABI } from 'components/Vault/ubidai-abi.js';
import { getBalanceLabel } from 'components/Token/Token';

import vault from 'images/vault.svg';
import 'styles/Dapp.css';
import i18n from 'i18n';

const Web3 = require('web3');


/**
* @summary displays the contents of a poll
*/
/**
* @summary graph query of token
* @param {string} publicAddress of the token contract
* @param {string} quantity with a big number
* @param {string} symbol with a ticker
* @param {string} decimal numbers this token takes
*/
// const EventQuery = (props) => {

export default class Event extends Component {
  static propTypes = {
    proposalId: PropTypes.string,
    address: PropTypes.string,
    first: PropTypes.number,
    skip: PropTypes.number,
    orderBy: PropTypes.string,
    orderDirection: PropTypes.string,
    view: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      feed: [],
      loading: true,
    }

    this.web3 = new Web3(window.web3.currentProvider);
    this.getFeed = this.getFeed.bind(this);
  }

  async componentDidMount() {
    this.vault = await new this.web3.eth.Contract(ubidaiABI, this.props.address);

    await this.getFeed();

    this.setState({
      loading: false
    });
  }

  async getFeed() {
    const log = [];
    await this.vault.events.allEvents({
      fromBlock: 0,
      toBlock: 'latest'
    }, async (error, tx) => {
      if (tx.event === 'Transfer') {
        const block = await this.web3.eth.getBlock(tx.blockNumber);
        console.log('block:');
        console.log(block);
        tx.timestamp = block.timestamp;
        log.push(tx);
        this.setState({
          feed: log
        });
      }
      return tx;
    })
  }

  render() {
    if (this.state.feed.length === 0) {
      if (this.state.loading) {
        return (
          <div className="event-vote">
          </div>
        );
      } else {
        return (
          <div className="event-vote event-vote-empty">
            <div className="preview-info">
              <div className="transaction-action transaction-action-empty">
                {i18n.t('no-events-found')}
              </div>
            </div>
          </div>
        )
      }
    }

    return this.state.feed.map((post) => {
      console.log(post);

      return (
        <div key={post.id} className="event-vote">
          {(post.event === 'Transfer') ?
            <>
              <Account publicAddress={post.returnValues.sender} width="16px" height="16px" />
              <div className="avatar-editor identity-vault">
                <img src={vault} className="symbol dao-pic" alt="" style={{ width: '16px', height: '16px' }} />
                <div className="identity-peer">
                  <a href={`${config.web.explorer.replace('{{publicAddress}}', post.address)}`} title={post.address} target="_blank" rel="noopener noreferrer" className="identity-label identity-label-micro identity-label-dao">
                    {shortenCryptoName(post.address)}
                  </a>
                </div>
              </div>
              {(post.returnValues.receiver === "0x0000000000000000000000000000000000000000") ?
                <Transaction uintVote={defaults.WITHDRAW} quantity={`${getBalanceLabel(post.returnValues.value, 18, '0,0.[00]')}`} />
                :
                <Transaction uintVote={defaults.DEPOSIT} quantity={`${getBalanceLabel(post.returnValues.value, 18, '0,0.[00]')}`} />
              }
              
              <Stamp timestamp={post.timestamp} format="timeSince" />
            </>
            :
            null
          }
        </div>
      )
    });
    /*
    const { address, first, skip, orderBy, orderDirection, proposalId } = this.props;
    
    if (loading) {
      return (
        <div className="event-vote">
        </div>
      );
    }
    if (error) return <div className="empty failure">{parser(i18n.t('failure', { errorMessage: error }))}</div>;

    if (data.votes.length === 0) {
      return (
        <div className="event-vote event-vote-empty">
          <div className="preview-info">
            <div className="transaction-action transaction-action-empty">
              {i18n.t('moloch-ledger-empty')}
            </div>
          </div>
        </div>
      )
    }

    const label = `UBI DAI vault`;

    var modes = ['DEPOSIT', 'WITHDRAW', 'BURN'];

    return data.votes.map((vote) => {
      return (
        <div key={vote.id} className="event-vote" onClick={() => { history.push(`/proposal/${vote.proposal.id}`); }}>
          <Account publicAddress={vote.memberAddress} width="16px" height="16px" />
          <div className="avatar-editor identity-vault">
            <img src={vault} className="symbol dao-pic" alt="" style={{ width: '16px', height: '16px' }} />
            <div className="identity-peer">
              <Link to={'/'} title={'0x8EBd041213218953109724e60c9cE91B57887288'} className="identity-label identity-label-micro identity-label-dao" onClick={(e) => { e.stopPropagation(); }}>
                {(label.length > gui.MAX_LENGTH_ACCOUNT_NAMES) ? `${label.substring(0, gui.MAX_LENGTH_ACCOUNT_NAMES)}...` : label}
              </Link>
            </div>
          </div>
          <Transaction uintVote={modes[Math.floor(Math.random() * modes.length)]} quantity={`${(Math.floor(Math.random() * 5000))}`} />
          <Stamp timestamp={vote.createdAt} format="timeSince" />
        </div>
      );
    });
    */
  }
};
