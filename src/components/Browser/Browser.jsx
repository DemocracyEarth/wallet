import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { defaults } from 'lib/const';
import { withRouter } from 'react-router-dom';

import Search from 'components/Search/Search';
import Account from 'components/Account/Account';
import DAO from 'components/DAO/DAO';
import Timeline from 'components/Timeline/Timeline';

import { view as routerView } from 'lib/const'
import signout from 'images/signout.svg';
import logo from 'images/logo.png';
import logoActive from 'images/logo-white.png';

import i18n from 'i18n';
import 'styles/Dapp.css';

// scroll settings
let lastScrollTop = 0;

const _openBurger = () => {
  const dapp = document.getElementById("dapp");
  const burger = document.getElementById("burger");
  const cover = document.getElementById("cover");
  if (dapp) {
    dapp.classList.remove('dapp-closed');
    dapp.classList.add('dapp-sidebar');
    if (burger) {
      burger.classList.add('burger-menu-open');
      burger.classList.remove('burger-menu-close');
      if (cover) {
        cover.classList.add('cover-open');
        cover.classList.remove('cover-close');
      }
    }
  }
}

const _closeBurger = () => {
  const dapp = document.getElementById("dapp");
  const burger = document.getElementById("burger");
  const cover = document.getElementById("cover");
  if (dapp) {
    dapp.classList.remove('dapp-sidebar');
    dapp.classList.add('dapp-closed');
    if (burger) {
      burger.classList.add('burger-menu-close');
      burger.classList.remove('burger-menu-open');
      if (cover) {
        cover.classList.add('cover-close');
        cover.classList.remove('cover-open');
      }
    }
  }
}

/**
* @summary displays the contents of a poll
*/
class Browser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      node: document.getElementById('browser'),
      mobileSidebar: false,
      scrollUp: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  async componentDidMount() {
    document.getElementById('dapp').addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    document.getElementById('dapp').removeEventListener('scroll', this.handleScroll);
  }

  getScrollClass() {
    if (this.state.scrollUp) {
      return 'hero-navbar topbar hero-navbar-scroller hero-navbar-up';
    }
    return 'hero-navbar topbar hero-navbar-scroller hero-navbar-down';
  }

  handleScroll() {
    const st = document.getElementById('dapp').scrollTop;

    if (document.getElementById('alternative-feed').style.minHeight !== `${document.getElementById('proposals').scrollHeight}px`) {
      document.getElementById('alternative-feed').style.minHeight = `${document.getElementById('proposals').scrollHeight}px`;
    }
    if ((st > lastScrollTop) && (st > 60) && !this.state.scrollUp) {
      this.setState({ scrollUp: true });
    } else if ((st <= lastScrollTop) && this.state.scrollUp) {
      this.setState({ scrollUp: false });
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }

  handleClick() {
    if (window.innerWidth < 768) {
      if (!this.state.mobileSidebar) {
        _openBurger();
      } else {
        _closeBurger();
      }
      this.setState({ mobileSidebar: !this.state.mobileSidebar });
    } else {
      this.props.history.push('/');
    }
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

    if (this.props.match.params.proposal) {
      return <Timeline proposalId={this.props.match.params.proposal} view={routerView.PROPOSAL} format="searchBar" />
    }

    if (this.props.match.params.search) {
      return <Timeline param={this.props.match.params.search} view={routerView.SEARCH} format="searchBar" />
    }

    if (this.props.match.params.token) {
      return <Search contextTag={{ id: this.props.match.params.token, text: i18n.t('search-token', { searchTerm: this.props.match.params.token }) }} />
    }

    if (this.props.match.params.date) {
      let options = { year: 'numeric', month: 'short', day: 'numeric' };
      var today = new Date(this.props.match.params.date);
      return <Search contextTag={{ id: this.props.match.params.date, text: i18n.t('search-date', { searchTerm: today.toLocaleDateString('en-US', options) }) }} />
    }

    return <Search />;
  }

  render() {
    return (
      <>
        <div id="browser" className={this.getScrollClass()}>
          <div className="topbar-max">
            <div id="nav-home" className="hero-home-button">
              <img className="hero-logo" alt=""
                src={logo} 
                onMouseOver={e => (e.currentTarget.src = logoActive)}
                onMouseOut={e => (e.currentTarget.src = logo)}
                onClick={this.handleClick}
              />
            </div>
            {(this.connectedWallet()) ?
              <div className="hero-button hero-button-mobile hero-signin">
                <button id="sign-out-button" className="hero-menu-link hero-menu-link-signin-simple hero-menu-link-signin-simple-icon" onClick={this.props.walletReset} target="_blank">
                  <img src={signout} alt="" title={i18n.t('sign-out')} className="signout" />
                </button>
                <div id="collective-login" className="hero-menu-link hero-menu-link-signin-simple" target="_blank">
                  <Account publicAddress={this.props.address} width="20px" height="20px" format="plainText" />
                </div>
              </div>
              :
              <div className="hero-button hero-button-mobile hero-signin">
                <div id="collective-login" className="hero-button hero-button-mobile">
                  <button className="hero-menu-link hero-menu-link-signin" target="_blank" onClick={this.props.walletConnect}>
                    {(window.innerWidth < 768) ? i18n.t('connect') : i18n.t('sign-in')}
                  </button>
                </div>
              </div>
            }
            {this.renderTitle()}
          </div>
        </div>
        <div id="cover" className="cover" onClick={this.handleClick} />
      </>
    );
  }
}

Browser.propTypes = {
  address: PropTypes.string,
  walletConnect: PropTypes.func,
  walletReset: PropTypes.func,
};

export default withRouter(Browser);
