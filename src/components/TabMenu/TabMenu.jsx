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
      key: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      action: PropTypes.func.isRequired,
      selected: PropTypes.bool,
    })).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      scrollUp: false,
      selectedTab: 0
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.handleClick = this.handleClick.bind(this);
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
    // up
    if (this.state.scrollUp) {
      if (document.getElementById('browser')) {
        document.getElementById('browser').className = 'hero-navbar topbar hero-navbar-scroller hero-navbar-up';
      }
      if (document.getElementById('sidebar')) {
        document.getElementById('sidebar').className = 'sidebar sidebar-desktop sidebar-up';
      }
      return 'tab-menu tab-menu-up';
    }

    // down
    if (document.getElementById('browser')) {
      document.getElementById('browser').className = 'hero-navbar topbar hero-navbar-scroller hero-navbar-down';
    }
    if (document.getElementById('sidebar')) {
      document.getElementById('sidebar').className = 'sidebar sidebar-desktop sidebar-down';
    }
    return 'tab-menu tab-menu-down';
  }

  handleClick(e) {
    this.setState({ selectedTab: Number(e.target.id.replace('tab-button-', '')) });
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

  getTabs(selected) {
    return this.props.tabs.map((item) => {
      return (
        <Tab key={item.key} id={item.key} label={item.label} action={item.action} selected={(selected === item.key)} />
      );
    })
  }

  render() {
    return (
      <>
        <div className={this.getScrollClass()} onClick={this.handleClick}>
          {this.getTabs(this.state.selectedTab)}
        </div>
      </>
    );
  }
};

