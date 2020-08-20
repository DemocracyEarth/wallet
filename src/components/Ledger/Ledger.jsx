import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';
import Vote from 'components/Vote/Vote';
import 'styles/Dapp.css';

const _getScrollTop = () => {
  const ledgerHeight = document.getElementById('ledger').offsetHeight;
  const windowHeight = window.innerHeight;
  document.getElementById('alternative-feed').style.minHeight = `${document.getElementById('proposals').getBoundingClientRect().height}px`;
  return parseInt(windowHeight - ledgerHeight - 40, 10);
};

/**
* @summary displays the contents of a poll
*/
export default class Ledger extends Component {
  static propTypes = {
    address: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  constructor() {
    super();
    this.state = {
      top: '0px',
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
    this.setState({ top: `${_getScrollTop()}px` });
  }

  render() {
    return (
      <div id="agora" className="content content-agora" style={{ top: this.state.top }}>
        <div id="ledger" className="ledger">
          <div className="ledger-title">
            <h4>{i18n.t('recent-activity')}</h4>
          </div>
          <Vote address={this.props.address} />
          <div className="ledger-footer" />
        </div>
      </div>
    );
  }
}


