import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import { wrapURLs } from '/lib/utils';

import Account from '/imports/ui/components/Account/Account.jsx';
import DAO from '/imports/ui/components/DAO/DAO.jsx';

/**
* @summary renders a post in the timeline
*/
export default class Vote extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="vote vote-search vote-feed vote-delegation">
        {this.props.children}
      </div>
    );
  }
}

Vote.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
