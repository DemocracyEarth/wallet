import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';
import { config } from 'config';

import Account from 'components/Account/Account';
import ProgressBar from 'components/ProgressBar/ProgressBar';
import Contract from 'components/Contract/Contract';
import Token from 'components/Token/Token';
import Parameter from 'components/Parameter/Parameter';
import { view as routerView } from 'lib/const';
import Expand from 'components/Expand/Expand';
import Wallet from 'components/Wallet/Wallet';
import Warning from 'components/Warning/Warning';

import { walletError, awaitTransaction } from 'components/Choice/messages';
import vault from 'images/vault.svg';
import ethereum from 'images/ethereum.svg';
import share from 'images/share.svg';
import shareActive from 'images/share-active.svg';
import capital from 'images/coins.svg';
import capitalActive from 'images/coins-active.svg';
import logo from 'images/logo.png';
import detectEthereumProvider from '@metamask/detect-provider'

import 'styles/Dapp.css';

import { getBalanceLabel } from 'components/Token/Token';

import BigNumber from 'bignumber.js/bignumber';
import i18n from 'i18n';

import { getProvider } from 'lib/web3';

const Web3 = require('web3');
const numeral = require('numeral');

const response = (err, res) => {
  if (err) {
    console.log(err);
  }
  return res;
}

/**
* @summary renders a post in the timeline
*/
export default class Vault extends Component {
  static propTypes = {
    address: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    link: PropTypes.string,
    account: PropTypes.string,
    deprecated: PropTypes.string,
    token: PropTypes.string,
    oracle: PropTypes.string,
    symbol: PropTypes.string,
    vaultTicker: PropTypes.string,
    fiat: PropTypes.string,
    oracleABI: PropTypes.arrayOf(PropTypes.object),
    vaultABI: PropTypes.arrayOf(PropTypes.object),
    decimals: PropTypes.string,
    fiatDecimals: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      depositLimit: '',
      totalAssets: '',
      totalDebt: '',
      availableDepositLimit: '',
      lockedProfit: '',
      balanceOf: '',
      pricePerShare: '',
      oraclePrice: '',
      sharesValue: '',
      deprecatedBalance: '',
      displayDeprecatedVault: false,
      capitalization: '',
      prices: '',
      assets: '',
      percentage: '',
      showFullText: false,
      web3Enabled: true,
      displayWETHWarning: false,
    }

    console.log(`Vault.jsx`);
    this.web3 = new Web3(getProvider());
    this.refresh = this.refresh.bind(this);
    this.getDepositLimit = this.getDepositLimit.bind(this);
    this.getTotalAssets = this.getTotalAssets.bind(this);
    this.getLockedProfit = this.getLockedProfit.bind(this);
    this.getAvailableDepositLimit = this.getAvailableDepositLimit.bind(this);
    this.getBalanceOf = this.getBalanceOf.bind(this);
    this.getPricePerShare = this.getPricePerShare.bind(this);
    this.getOraclePrice = this.getOraclePrice.bind(this);
    this.getDeprecatedBalance = this.getDeprecatedBalance.bind(this);
    this.getWrappedEtherWarning = this.getWrappedEtherWarning.bind(this);
    this.withdrawDeprecated = this.withdrawDeprecated.bind(this);
    this.setLabels = this.setLabels.bind(this);
    this.parse = this.parse.bind(this);
  }

  async shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.account !== this.props.account || nextProps.address !== this.props.address) {
      console.log('Vault.jsx -> shouldComponentUpdate()');
      this.web3 = new Web3(getProvider());
      await this.getOraclePrice(nextProps);
      await this.refresh();
    }
  }

  async componentDidMount() {
    console.log('Vault.jsx -> componentDidMount()');
    this.web3 = new Web3(getProvider());
    await this.refresh();
  }

  async refresh() {
    if (this.web3 !== null) {
      
      this.vault = await new this.web3.eth.Contract(this.props.vaultABI, this.props.address);
      await this.getDepositLimit();
      await this.getTotalAssets();
      await this.getLockedProfit();
      await this.getAvailableDepositLimit();
      await this.getBalanceOf();
      await this.getPricePerShare();
      this.getWrappedEtherWarning();
      this.getSharesValue();

      const provider = await detectEthereumProvider();
      if (provider && provider.isConnected()) {
        if (this.props.deprecated) {
          this.accountWeb3 = new Web3(provider);
          this.deprecatedVault = await new this.accountWeb3.eth.Contract(this.props.vaultABI, this.props.deprecated);
          await this.getDeprecatedBalance();
        } else {
          this.setState({ displayDeprecatedVault: false });
        }
      } else if (!provider) {
        this.setState({ web3Enabled: false });
      }

      await this.setLabels();
    }
  }

  async setLabels() {
    this.setState({
      capitalization: `${i18n.t('vault-capitalization')}: ${getBalanceLabel(this.state.totalAssets, 18, '0,0.[00]')} ${this.props.symbol}`,
      prices: `${i18n.t('market-prices')}: ${getBalanceLabel(this.state.oraclePrice, 8, '0,0.0000')} ${this.props.fiat} per ${this.props.symbol}`,
      assets: `${i18n.t('your-share')}: ${getBalanceLabel(this.state.balanceOf, 18, '0,0.[00]')} Shares`,
      percentage: new BigNumber(this.state.totalAssets).multipliedBy(100).dividedBy(this.state.depositLimit),
    });
  }

  async getOraclePrice(nextProps) {
    this.priceFeed = await new this.web3.eth.Contract(nextProps.oracleABI, nextProps.oracle);
    const oraclePrice = await this.priceFeed.methods.latestAnswer().call({}, response);
    this.setState({
      oraclePrice, 
    });
  }

  getSharesValue() {
    const oracle = new BigNumber(this.state.oraclePrice).dividedBy(Math.pow(10, 8));
    const shares = new BigNumber(this.state.balanceOf).dividedBy(Math.pow(10, 18));
    const sharesValue = numeral(oracle.multipliedBy(shares).toNumber()).format('0,0.00');
    this.setState({
      sharesValue,
    });
  }

  async getDepositLimit() {
    this.setState({ 
      depositLimit: await this.vault.methods.depositLimit().call({}, response) 
    });
  }

  async getTotalAssets() {
    this.setState({
      totalAssets: await this.vault.methods.totalAssets().call({}, response)
    });
  }

  async getLockedProfit() {
    this.setState({
      lockedProfit: await this.vault.methods.lockedProfit().call({}, response)
    });
  }

  async getAvailableDepositLimit() {
    this.setState({
      availableDepositLimit: await this.vault.methods.availableDepositLimit().call({}, response)
    });
  }

  async getBalanceOf() {
    this.setState({
      balanceOf: await this.vault.methods.balanceOf(this.props.account).call({}, response)
    });
  }

  async getDeprecatedBalance() {
    if (!this.props.deprecated || this.props.deprecated === '') {
      this.setState({ displayDeprecatedVault: false });
    } else {
      const deprecatedBalance = await this.deprecatedVault.methods.balanceOf(this.props.account).call({}, response);
      this.setState({
        deprecatedBalance,
        displayDeprecatedVault: new BigNumber(deprecatedBalance).isGreaterThan(0)
      });
    }
  }

  getWrappedEtherWarning() {
    if (this.props.symbol === 'WETH') {
      this.setState({ displayWETHWarning: true });
    } else {
      this.setState({ displayWETHWarning: false });
    }
  }

  async getPricePerShare() {
    this.setState({
      pricePerShare: await this.vault.methods.pricePerShare().call({}, response)
    });
  }

  withdrawDeprecated() {
    awaitTransaction(i18n.t('token-withdrawal-await-deprecated', { assets: this.props.symbol }));
    this.deprecatedVault.methods.withdraw().send({ from: this.props.account }, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      if (res) {
        window.showModal.value = false;
        window.modal = {
          icon: logo,
          title: i18n.t('withdraw'),
          message: i18n.t('token-withdraw', { etherscan: `https://etherscan.io/tx/${res}` }),
          cancelLabel: i18n.t('close'),
          mode: 'ALERT'
        }
        window.showModal.value = true;
      }
      return res;
    }).then((receipt) => {
      this.refresh();
    });
  }

  parse(text) {
    if (this.state.showFullText) {
      if (typeof text === 'string') {
        return parser(text);
      }
      return text;
    }
    if (typeof text === 'string') {
      return parser(`${text.slice(0, text.indexOf('<br><br>'))}<br><br>`);
    }
    return text.slice(0, text.indexOf('<br><br>'));
  }

  render() {
    return (
      <div className="vote vote-search vote-feed nondraggable vote-poll">
        <div className="checkbox checkbox-custom">
          <div className="meta meta-search meta-bar">
            <div className="identity">
              <div className="avatar-editor">
                <img src={ethereum} className={`symbol profile-pic icon`} alt="" style={{ width: '16px', height: '16px' }} />
                <a href="https://yearn.finance" target="_blank" rel="noopener noreferrer" className="identity-label identity-label-micro">
                  <div className="identity-peer">
                    {i18n.t('yearn-vault')}
                  </div>
                </a>
              </div>
            </div>
            <div className="dao">
              <Account publicAddress={this.props.address} icon={vault} format="icon" width="16px" height="16px" href={`${config.web.explorer.replace('{{publicAddress}}', this.props.address)}`} />
              {/*<Account publicAddress={'0xf2eefca91a179c5Eb38CaA0Ea2BCB79ad1E46A79'} icon={strategy} format="icon" width="16px" height="16px" href={'https://etherscan.io/address/0xf2eefca91a179c5Eb38CaA0Ea2BCB79ad1E46A79#code'} />*/}
            </div>
          </div>
          <div className="option-proposal">
            <div className="option-title option-link option-search title-input">
              <div className="title-input title-feed">
                <div className="title-header">
                  {typeof this.props.title === 'string' ? parser(this.props.title) : this.props.title}
                </div>
                {
                  (this.props.description) ?
                    <div className="title-description">
                      {this.parse(this.props.description)}
                      {
                        (this.state.showFullText) ?
                          <div className="read-more" onClick={() => { this.setState({ showFullText: false })}}>{i18n.t('hide-full-text')}</div>
                        :
                          <div className="read-more" onClick={() => { this.setState({ showFullText: true }) }}>{i18n.t('show-full-text')}</div>
                      }
                    </div>
                    :
                    null
                }
                {
                  (this.props.link) ?
                    <div className="title-description">
                      <a href={this.props.link} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); }}>{this.props.link}</a>
                    </div>
                  :
                  null
                }
              </div>
            </div>
          </div>
          <div className="expanders">
            <Expand url={'/'} label={this.state.capitalization} open={true}
              icon={capital} iconActive={capitalActive}
            >
              <Contract hidden={false} view={routerView.PROPOSAL} href={`${config.web.explorer.replace('{{publicAddress}}', this.props.address)}`}>
                <Parameter label={i18n.t('deposit-limit')}>
                  <Token quantity={this.state.depositLimit} publicAddress={this.props.token} symbol={this.props.symbol} decimals={'18'} />
                </Parameter>
                <Parameter label={i18n.t('available-limit')}>
                  <Token quantity={this.state.availableDepositLimit} publicAddress={this.props.token} symbol={this.props.symbol} decimals={'18'} />
                </Parameter>
                <Parameter label={i18n.t('total-assets')}>
                  <Token quantity={this.state.totalAssets} publicAddress={this.props.token} symbol={this.props.symbol} decimals={'18'} />
                </Parameter>
                <Parameter label={i18n.t('locked-profit')}>
                  <Token quantity={this.state.lockedProfit} publicAddress={this.props.token} symbol={this.props.symbol} decimals={'18'} />
                </Parameter>
                <Parameter label={i18n.t('vault-capacity')} fullWidth>
                  <ProgressBar percentage={this.state.percentage.toString()} />
                </Parameter>
              </Contract>
            </Expand>
            {(this.state.web3Enabled) ?
              <Expand url={'/'} label={this.state.assets} open={true}
                icon={share} iconActive={shareActive}
              >
                <Contract hidden={false} view={routerView.PROPOSAL} href={`${config.web.explorer.replace('{{publicAddress}}', this.props.address)}`}>
                  <Parameter label={i18n.t('vault-shares')}>
                    <Token quantity={this.state.balanceOf} symbol={this.props.vaultTicker} decimals={'18'} />
                  </Parameter>
                  <Parameter label={i18n.t('shares-value')}>
                    <Token quantity={this.state.sharesValue} symbol={this.props.fiat} noFormatting={true} />
                  </Parameter>
                </Contract>
              </Expand>
              :
              <Warning label={i18n.t('web3-not-found')}
                hasCallToAction
                callToActionLabel={'install-web3-wallet'}
                callToAction={() => { this.withdrawDeprecated() }}
              />
            }
          </div>
          {(this.state.displayDeprecatedVault) ?
            <Warning label={i18n.t('vault-warning-ubi-dai', { balance: `${getBalanceLabel(this.state.deprecatedBalance, 18, '0,0.[00]')} ${this.props.vaultTicker}` })} 
              hasCallToAction 
              callToActionLabel={'vault-warning-withdraw'}
              callToAction={() => { this.withdrawDeprecated() }}
            />
          :
            null
          }
          {(this.state.displayWETHWarning) ?
            <Warning label={i18n.t('vault-warning-weth')}
              hasCallToAction
              callToActionLabel={'vault-warning-swap-weth'}
              callToAction={() => { window.open('https://app.uniswap.org/#/swap'); }}
            />
          :
            null
          }
          {(this.state.web3Enabled) ?
            <Wallet 
              symbol={this.props.symbol} 
              tokenAddress={this.props.token}
              contractAddress={this.props.address}
              accountAddress={this.props.account}
              abi={this.props.vaultABI}
              refresh={() => { this.refresh(); }}
            />
            :
            null
          }
        </div>
      </div>
    );
  }
}
