import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';
import { view } from 'lib/const';
import Vote from 'components/Vote/Vote';
import 'styles/Dapp.css';

// scroll settings
let lastScrollTop = 0;

const _getScrollClass = (isUp) => {
  if (isUp) {
    return `content content-agora content-up`;
  }
  return `content content-agora content-down`;
};

/**
* @summary displays the contents of a poll
*/
export default class Ledger extends Component {
  static propTypes = {
    address: PropTypes.string,
    view: PropTypes.string,
    proposalId: PropTypes.string,
    first: PropTypes.number,
    skip: PropTypes.number,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  constructor() {
    super();
    this.state = {
      top: '0px',
      scrollUp: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  titleLabel() {
    switch (this.props.view) {
      case view.DAO:
        return i18n.t('moloch-ledger-dao-votes');
      case view.PROPOSAL:
        return i18n.t('moloch-ledger-proposal-votes');
      case view.ADDRESS:
        return i18n.t('moloch-ledger-address-votes');
      default:
    }
    return i18n.t('recent-activity')
  }

  handleScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if ((st > lastScrollTop) && (st > 60) && !this.state.scrollUp) {
      this.setState({ scrollUp: true });
    } else if ((st <= lastScrollTop) && this.state.scrollUp) {
      this.setState({ scrollUp: false });
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }

  render() {
    return (
      <div id="agora" className={_getScrollClass(this.state.scrollUp)}> {/* style={{ top: this.state.top }}>*/}
        <div id="ledger" className="ledger">
          <div className="ledger-title">
            <h4>{this.titleLabel()}</h4>
          </div>
          <div className="shadow-top" />
          <div className="ledger-wrapper">
            <Vote address={this.props.address} view={this.props.view} proposalId={this.props.proposalId} first={this.props.first} skip={this.props.skip} orderBy={'createdAt'} orderDirection={'desc'} />
          </div>
          <div className="shadow-bottom" />
          <div className="ledger-footer" />
        </div>
      </div>
    );
  }
}


