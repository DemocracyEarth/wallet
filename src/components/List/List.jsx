import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Item from 'components/Item/Item';
import { getScrollClass } from 'components/Menu/fx';

import i18n from 'i18n';

import 'styles/Dapp.css';

// scroll settings
let lastScrollTop = 0;

/**
* @summary renders a post in the timeline
*/
export default class List extends Component {
  static propTypes = {
    styleClass: PropTypes.string,
    label: PropTypes.string,
    url: PropTypes.string,
    tooltip: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      node: document.getElementById('sidebar'),
      scrollUp: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentDidMount() {
    if (document.getElementById('dapp')) {
      document.getElementById('dapp').addEventListener('scroll', this.handleScroll);
    }
  }

  componentWillUnmount() {
    if (document.getElementById('dapp')) {
      document.getElementById('dapp').removeEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll() {
    const st = document.getElementById('dapp').scrollTop;

    if ((st > lastScrollTop) && (st > 60) && !this.state.scrollUp) {
      this.setState({ scrollUp: true });
    } else if ((st <= lastScrollTop) && this.state.scrollUp) {
      this.setState({ scrollUp: false });
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }

  render() {
    return (
      <div id="sidebar" className={getScrollClass(this.state.scrollUp)}>
        <div className="menu">
          <div className="separator">
            {i18n.t('proposals-vault')}
          </div>
          <div className="submenu">
            <Item sharp label={i18n.t('vault-ubi-dai')} score={0} status={i18n.t('live')} key={0} href={'/vault/ubi-dai'} />
            <Item sharp label={i18n.t('vault-ubi-eth')} score={0} status={i18n.t('live')} key={1} href={'/vault/ubi-weth'} />
            <Item sharp label={i18n.t('vault-ubi-wbtc')} score={0} status={i18n.t('soon')} disabled key={2} href={'/vault/ubi-wbtc'} />
          </div>
        </div>
      </div>
    );
  }
}
