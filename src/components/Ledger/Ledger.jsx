import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';
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
            <h4>{i18n.t('recent-activity')}</h4>
          </div>
          <Vote address={this.props.address} view={this.props.view} proposalId={this.props.proposalId} first={5} skip={0} orderBy={'createdAt'} orderDirection={'desc'} />
          <div className="ledger-footer" />
        </div>
      </div>
    );
  }
}


