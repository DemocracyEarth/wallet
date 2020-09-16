import React, { Component } from 'react';
import PropTypes from 'prop-types';

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
export default class Toggle extends Component {
  static propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,    
  }

  render() {
    return (
      <div className="toggle">
        <div className="toggle-label">
          {this.props.label}
        </div>
        <div className="toggle-switch">
          {'test'}
        </div>
      </div>
    );
  }
};
