import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import Account from 'components/Account/Account';
import ProgressBar from 'components/ProgressBar/ProgressBar';
import Contract from 'components/Contract/Contract';
import Token, { getBalanceLabel } from 'components/Token/Token';
import Parameter from 'components/Parameter/Parameter';
import { view as routerView } from 'lib/const';

import money from 'images/money.svg';
import vault from 'images/vault.svg';
import status from 'images/status.svg';
import strategy from 'images/strategy.svg';

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
      link: null,
    }
  }

  render() {
    return (
      <div className="vote vote-search vote-feed nondraggable vote-poll">
        <div className="checkbox checkbox-custom">
          <div className="meta meta-search meta-bar">
            <Account publicAddress={'0x8EBd041213218953109724e60c9cE91B57887288'} icon={vault} format="icon" width="16px" height="16px" href={'https://etherscan.io/address/0x8EBd041213218953109724e60c9cE91B57887288'} />
            <div className="dao">
              <Account publicAddress={'0xf2eefca91a179c5Eb38CaA0Ea2BCB79ad1E46A79'} icon={strategy} format="icon" width="16px" height="16px" href={'https://etherscan.io/address/0xf2eefca91a179c5Eb38CaA0Ea2BCB79ad1E46A79#code'} />
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
          <div className="countdown">
          </div>
          <div class="details-wrapper">
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
              <Parameter label={i18n.t('dai-price')}>
                <Token quantity={'0000997600000000000000'} displayDecimals={true} symbol={'USD'} decimals={18} />
              </Parameter>
              <Parameter label={i18n.t('price-per-share')}>
                <Token quantity={'1000000000000000000'} displayDecimals={true} symbol={'USD'} decimals={18} />
              </Parameter>
              <Parameter label={i18n.t('available-limit')}>
                <Token quantity={'48354530000000000000000'} publicAddress={'0x6b175474e89094c44da98b954eedeac495271d0f'} symbol={'DAI'} decimals={18} />
              </Parameter>
            </Contract>
          </div>
          <div className="countdown">
            <div id="timer" className="countdown-label">
              {i18n.t('vault-capacity')}
            </div>
          </div>
          <ProgressBar percentage="3.29" />
          {this.props.children}
        </div>
      </div>
    );
  }
}
