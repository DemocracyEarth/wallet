import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Tab from 'components/TabMenu/Tab';

import 'styles/Dapp.css';

// scroll settings
let lastScrollTop = 0;

/**
* @summary displays the contents of a poll
*/
export default class TabMenu extends Component {
  static propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func.isRequired,
      selected: PropTypes.bool,
    })).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      scrollUp: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentDidMount() {
    const viewport = document.getElementById('content');
    viewport.addEventListener('scroll', this.handleScroll, false);
  }

  componentWillUnmount() {
    const viewport = document.getElementById('content');
    viewport.removeEventListener('scroll', this.handleScroll, false);
  }

  getScrollClass() {
    if (this.state.scrollUp) {
      if (document.getElementById('browser')) {
        document.getElementById('browser').className = 'hero-navbar topbar hero-navbar-scroller hero-navbar-up';
      }
      return 'tab-menu tab-menu-up';
    }
    if (document.getElementById('browser')) {
      document.getElementById('browser').className = 'hero-navbar topbar hero-navbar-scroller hero-navbar-down';
    }
    return 'tab-menu tab-menu-down';
  }

  handleScroll() {
    const viewport = document.getElementById('content');
    const st = viewport.scrollTop;

    if ((st > lastScrollTop) && (st > 60) && !this.state.scrollUp) {
      this.setState({ scrollUp: true });
    } else if ((st <= lastScrollTop) && this.state.scrollUp) {
      this.setState({ scrollUp: false });
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }


  render() {
    return (
      <>
        <div className={this.getScrollClass()}>
          {
            this.props.tabs.map((item, key) => {
              return (
                <Tab key={key} label={item.label} action={item.action} selected={item.selected} />
              );
            })
          }
        </div>
      </>
    );
  }
};

