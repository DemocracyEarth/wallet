import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { shortenCryptoName } from 'utils/strings';
import Account from 'components/Account/Account';
import Human from 'components/Human/Human';
import Stamp from 'components/Stamp/Stamp';
import Transaction from 'components/Transaction/Transaction';

import { defaults, zeroAddress } from 'lib/const';

import { sortBy } from 'lodash';

import { ubidaiABI } from 'components/Vault/ubidai-abi.js';
import { getBalanceLabel } from 'components/Token/Token';

import vault from 'images/vault.svg';
import 'styles/Dapp.css';
import i18n from 'i18n';

import { config } from 'config';
import { getProvider } from 'lib/web3';

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
    symbol: PropTypes.string,
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

    this.web3 = new Web3(getProvider());
    this.getFeed = this.getFeed.bind(this);
  }


  async shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.address !== this.props.address) {
      await this.refresh(nextProps.address);
    }
  }

  async componentDidMount() {
    if (this.web3 !== null) {
      await this.refresh(this.props.address);
    }
  }

  async refresh(address) {
    this.vault = await new this.web3.eth.Contract(ubidaiABI, address);
    await this.getFeed();
    this.setState({
      loading: false
    });
  }

  async getFeed() {
    const log = [];
    const currentBlock = await this.web3.eth.getBlockNumber();

    await this.vault.events.allEvents({
      fromBlock: parseInt(currentBlock - 100000, 10),
      toBlock: 'latest'
    }, async (error, tx) => {
      if (error) {
        console.log(error);
        return;
      }
      if (tx.event === 'Transfer') {
        const block = await this.web3.eth.getBlock(tx.blockNumber);
        tx.timestamp = block.timestamp;
        let found = false;
        for (const item of log) {
          if (item.transactionHash === tx.transactionHash) {
            found = true;
            break;
          }
        }
        if (!found) {
          log.push(tx);
        }
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

    const sortedFeed = sortBy(this.state.feed, (item) => { return (item.timestamp * -1) })

    return sortedFeed.map((post) => {
      return (
        <div key={post.id} className="event-vote" onClick={() => { window.open(`https://etherscan.io/tx/${post.transactionHash}`); }} target="_blank" rel="noopener noreferrer" >
          {(post.event === 'Transfer') ?
            <>
              {(post.returnValues.sender !== zeroAddress) ?
                <Human publicAddress={post.returnValues.sender} width="16px" height="16px" />
                :
                <>
                  {(post.returnValues.receiver !== zeroAddress) ?
                    <Human publicAddress={post.returnValues.receiver} width="16px" height="16px" />
                    :
                    <Human publicAddress={post.returnValues.receiver} width="16px" height="16px" />
                  }
                </>
              }
              <div className="avatar-editor identity-vault">
                <img src={vault} className="symbol dao-pic" alt="" style={{ width: '16px', height: '16px' }} />
                <div className="identity-peer">
                  <a href={`${config.web.explorer.replace('{{publicAddress}}', post.address)}`} title={post.address} target="_blank" rel="noopener noreferrer" className="identity-label identity-label-micro identity-label-dao">
                    {shortenCryptoName(post.address)}
                  </a>
                </div>
              </div>
              {(post.returnValues.sender !== zeroAddress && post.returnValues.sender !== post.address && post.returnValues.receiver === "0x0000000000000000000000000000000000000000") ?
                <Transaction kind={defaults.WITHDRAW} quantity={`${getBalanceLabel(post.returnValues.value, 18, '0,0.[000]')}`} symbol={this.props.symbol} />
                :
                <>
                  {(post.returnValues.receiver !== zeroAddress && post.returnValues.receiver !== post.address && post.returnValues.sender === "0x0000000000000000000000000000000000000000") ?
                    <Transaction kind={defaults.DEPOSIT} quantity={`${getBalanceLabel(post.returnValues.value, 18, '0,0.[000]')}`} symbol={this.props.symbol} />
                    :
                    <Transaction kind={defaults.BURN} quantity={`${getBalanceLabel(post.returnValues.value, 18, '0,0.[0000]')}`} symbol={this.props.symbol} />
                  }
                </>
              }
              
              <Stamp timestamp={post.timestamp.toString()} format="timeSince" />
            </>
            :
            null
          }
        </div>
      )
    });
  }
};
