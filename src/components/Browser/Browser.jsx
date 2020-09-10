import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { defaults } from 'lib/const';
import { withRouter } from 'react-router-dom';

import Search from 'components/Search/Search';
import Account from 'components/Account/Account';
import DAO from 'components/DAO/DAO';

import close from 'images/close.svg';
import logo from 'images/logo.png';

import i18n from 'i18n';
import 'styles/Dapp.css';

// scroll settings
let lastScrollTop = 0;

/**
* @summary displays the contents of a poll
*/
class Browser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      node: document.getElementById('browser'),
      scrollUp: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  getScrollClass() {
    if (this.state.scrollUp) {
      return 'hero-navbar topbar hero-navbar-scroller hero-navbar-up';
    }
    return 'hero-navbar topbar hero-navbar-scroller hero-navbar-down';
  }

  handleScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if ((st > lastScrollTop) && !this.state.scrollUp) {
      this.setState({ scrollUp: true });
    } else if ((st <= lastScrollTop) && this.state.scrollUp) {
      this.setState({ scrollUp: false });
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }

  connectedWallet() {
    return (this.props.address !== defaults.EMPTY);
  }

  renderTitle() {
    if (this.props.match.params.address) {
      return <Account publicAddress={this.props.match.params.address} format="searchBar" />
    }
    
    if (this.props.match.params.dao) {
      return <DAO publicAddress={this.props.match.params.dao} format="searchBar" />
    }
    
    /*
    if (this.props.match.params.proposal) {
      return {
        id: this.props.match.url,
        text: i18n.t('search-dao', { searchTerm: this.props.match.params.proposal }),
        value: this.props.match.params.proposal,
        type: 'SEARCH'
      }
    }
    */

    return <Search />;
  }

  render() {
    return (
      <div id="browser" className={this.getScrollClass()}>
        <div className="topbar-max">
          <div id="nav-home" className="hero-home-button">
            <img className="hero-logo" alt="" src={logo} />
          </div>
          {(this.connectedWallet()) ?
            <div className="hero-button hero-button-mobile hero-signin">
              <button id="sign-out-button" className="hero-menu-link hero-menu-link-signin-simple hero-menu-link-signin-simple-icon" onClick={this.props.walletReset} target="_blank">
                <img src={close} alt="" title={i18n.t('sign-out')} className="signout" />
              </button>
              <div id="collective-login" className="hero-menu-link hero-menu-link-signin-simple" target="_blank">
                <Account publicAddress={this.props.address} width="20px" height="20px" format="plainText" />
              </div>
            </div>
            :
            <div className="hero-button hero-button-mobile hero-signin">
              <div id="collective-login" className="hero-button hero-button-mobile">
                <button className="hero-menu-link hero-menu-link-signin" target="_blank" onClick={this.props.walletConnect}>
                  {i18n.t('sign-in')}
                </button>
              </div>
            </div>
          }
          {this.renderTitle()}
        </div>
      </div>
    );
  }
}

Browser.propTypes = {
  address: PropTypes.string,
  walletConnect: PropTypes.func,
  walletReset: PropTypes.func,
};

export default withRouter(Browser);
