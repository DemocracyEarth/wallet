import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';

import Vote from '/imports/ui/components/Vote/Vote.jsx';

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
            <h4>{TAPi18n.__('recent-activity')}</h4>
          </div>
          <Vote />
          <div className="ledger-footer" />
        </div>
      </div>
    );
  }
}

Ledger.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
