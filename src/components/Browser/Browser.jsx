import React, { useEffect, useContext } from 'react';

import { defaults } from 'lib/const';

import Search from 'components/Search/Search';
import Account from 'components/Account/Account';

import close from 'images/close.svg';
import logo from 'images/logo.png';

import i18n from 'i18n';
import 'styles/Dapp.css';
import { WalletContext } from 'contexts/Wallet/WalletContext';

// scroll settings
let lastScrollTop = 0;

/**
* @summary displays the contents of a poll
*/
export default Browser = () => {

  const { address, onConnect, onReset } = useContext(WalletContext);

  const [scrollUp, setScrollUp] = useState(false)

  const handleScroll = useMemo(() => () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if ((st > lastScrollTop) && !scrollUp) {
      setScrollUp(true);
    } else if ((st <= lastScrollTop) && scrollUp) {
      setScrollUp(false);
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll])

  const scrollClass = `hero-navbar topbar hero-navbar-scroller hero-navbar-${scrollUp ? 'up' : 'down'}`;
  const connectedWallet = address !== defaults.EMPTY

  return (
    <div id="browser" className={scrollClass}>
      <div className="topbar-max">
        <div id="nav-home" className="hero-home-button">
          <img className="hero-logo" alt="" src={logo} />
        </div>
        {connectedWallet ?
          <div className="hero-button hero-button-mobile hero-signin">
            <button id="sign-out-button" className="hero-menu-link hero-menu-link-signin-simple hero-menu-link-signin-simple-icon" onClick={onReset} target="_blank">
              <img src={close} alt="" title={i18n.t('sign-out')} className="signout" />
            </button>
            <div id="collective-login" className="hero-menu-link hero-menu-link-signin-simple" target="_blank">
              <Account publicAddress={address} width="20px" height="20px" format="plainText" />
            </div>
          </div>
          :
          <div className="hero-button hero-button-mobile hero-signin">
            <div id="collective-login" className="hero-button hero-button-mobile">
              <button className="hero-menu-link hero-menu-link-signin" target="_blank" onClick={onConnect}>
                {i18n.t('sign-in')}
              </button>
            </div>
          </div>
        }
        <Search />
      </div>
    </div>
  );
}