import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import Account from 'components/Account/Account';

import vault from 'images/vault.svg';
import strategy from 'images/strategy.svg';

import 'styles/Dapp.css';

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
      title: 'UBI DAI',
      description: null,
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
          {this.props.children}
        </div>
      </div>
    );
  }
}
