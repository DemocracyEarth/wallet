import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import Account from 'components/Account/Account';
import ProgressBar from 'components/ProgressBar/ProgressBar';
import Contract from 'components/Contract/Contract';
import Token from 'components/Token/Token';
import Parameter from 'components/Parameter/Parameter';
import { view as routerView } from 'lib/const';
import Expand from 'components/Expand/Expand';
import Wallet from 'components/Wallet/Wallet';

import vault from 'images/vault.svg';
import contract from 'images/contract.svg';
import price from 'images/price.svg';
import priceActive from 'images/price-active.svg';
import share from 'images/share.svg';
import shareActive from 'images/share-active.svg';
import capital from 'images/coins.svg';
import capitalActive from 'images/coins-active.svg';


import 'styles/Dapp.css';
import i18n from 'i18n';


/**
* @summary renders a post in the timeline
*/
export default class Vault extends Component {
  static propTypes = {
    styleClass: PropTypes.string,
    label: PropTypes.string,
    url: PropTypes.string,
    tooltip: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      title: i18n.t('ubi-dai-title'),
      description: i18n.t('ubi-dai-description'),
      link: 'https://youtu.be/6008FYXc3IU',
    }
  }

  render() {

    const capitalization = `${i18n.t('vault-capitalization')}: 1,645.46 DAI`;
    const prices = `${i18n.t('market-prices')}: 0.9976 USD per DAI`;
    const assets = `${i18n.t('your-share')}: 400 Shares`;

    return (
      <div className="vote vote-search vote-feed nondraggable vote-poll">
        <div className="checkbox checkbox-custom">
          <div className="meta meta-search meta-bar">
            <div className="identity">
              <div className="avatar-editor">
                <img src={vault} className={`symbol profile-pic icon`} alt="" style={{ width: '16px', height: '16px' }} />
                <a href="https://yearn.finance" target="_blank" rel="noopener noreferrer" className="identity-label identity-label-micro">
                  <div className="identity-peer">
                    {i18n.t('yearn-vault')}
                  </div>
                </a>
              </div>
            </div>
            <div className="dao">
              <Account publicAddress={'0x8EBd041213218953109724e60c9cE91B57887288'} icon={contract} format="icon" width="16px" height="16px" href={'https://etherscan.io/address/0x8EBd041213218953109724e60c9cE91B57887288'} />
              {/*<Account publicAddress={'0xf2eefca91a179c5Eb38CaA0Ea2BCB79ad1E46A79'} icon={strategy} format="icon" width="16px" height="16px" href={'https://etherscan.io/address/0xf2eefca91a179c5Eb38CaA0Ea2BCB79ad1E46A79#code'} />*/}
            </div>
          </div>
          <div className="option-proposal">
            <div className="option-title option-link option-search title-input">
              <div className="title-input title-feed">
                <div className="title-header">
                  {typeof this.state.title === 'string' ? parser(this.state.title) : this.state.title}
                </div>
                {
                  (this.state.description) ?
                    <div className="title-description">
                      {typeof this.state.description === 'string' ? parser(this.state.description) : this.state.description}
                    </div>
                    :
                    null
                }
                {
                  (this.state.link) ?
                    <div className="title-description">
                      <a href={this.state.link} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); }}>{this.state.link}</a>
                    </div>
                    :
                    null
                }
              </div>
            </div>
          </div>
          <div className="expanders">
            <Expand url={'/'} label={capitalization} open={true}
              icon={capital} iconActive={capitalActive}
            >
              <Contract hidden={false} view={routerView.PROPOSAL} href={'https://etherscan.io/address/0x8EBd041213218953109724e60c9cE91B57887288'}>
                <Parameter label={i18n.t('deposit-limit')}>
                  <Token quantity={'50000000000000000000000'} publicAddress={'0x6b175474e89094c44da98b954eedeac495271d0f'} symbol={'DAI'} decimals={18} />
                </Parameter>
                <Parameter label={i18n.t('total-assets')}>
                  <Token quantity={'1645460000000000000000'} publicAddress={'0x6b175474e89094c44da98b954eedeac495271d0f'} symbol={'DAI'} decimals={18} />
                </Parameter>
                <Parameter label={i18n.t('total-aum')}>
                  <Token quantity={'1641470000000000000000'} publicAddress={'0x6b175474e89094c44da98b954eedeac495271d0f'} symbol={'DAI'} decimals={18} />
                </Parameter>
                <Parameter label={i18n.t('available-limit')}>
                  <Token quantity={'48354530000000000000000'} publicAddress={'0x6b175474e89094c44da98b954eedeac495271d0f'} symbol={'DAI'} decimals={18} />
                </Parameter>
              </Contract>
            </Expand>
            <Expand url={'/'} label={prices} open={false}
              icon={price} iconActive={priceActive}
            >
              <Contract hidden={false} view={routerView.PROPOSAL} href={'https://etherscan.io/address/0x8EBd041213218953109724e60c9cE91B57887288'}>
                <Parameter label={i18n.t('dai-price')}>
                  <Token quantity={'0000997600000000000000'} displayDecimals={true} symbol={'USD'} decimals={18} />
                </Parameter>
                <Parameter label={i18n.t('price-per-share')}>
                  <Token quantity={'1000000000000000000'} displayDecimals={true} symbol={'USD'} decimals={18} />
                </Parameter>
              </Contract>
            </Expand>
            <Expand url={'/'} label={assets} open={false}
              icon={share} iconActive={shareActive}
            >
              <Contract hidden={false} view={routerView.PROPOSAL} href={'https://etherscan.io/address/0x8EBd041213218953109724e60c9cE91B57887288'}>
                <Parameter label={i18n.t('vault-shares')}>
                  <Token quantity={'400000000000000000000'} symbol={'SHARES'} decimals={18} />
                </Parameter>
                <Parameter label={i18n.t('shares-value')}>
                  <Token quantity={'399030000000000000000'} symbol={'USD'} decimals={18} />
                </Parameter>
              </Contract>
            </Expand>
            {/*<div className="countdown">
              <div id="timer" className="countdown-label">
                {i18n.t('vault-capacity')}
              </div>
            </div>
              <ProgressBar percentage="3.29" />*/}
          </div>
          <Wallet />
        </div>
      </div>
    );
  }
}
