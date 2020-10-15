import React, { Component } from 'react';
import PropTypes from 'prop-types';

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/

export default class Tab extends Component {
  static propTypes = {
    label: PropTypes.string,
    selected: PropTypes.bool,
    action: PropTypes.func,
    id: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      selected: props.selected,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.action();
  }

  render() {
    return (
      <button id={`tab-button-${this.props.id}`} className={`tab-button ${this.props.selected ? 'tab-button-selected' : ''}`} onClick={this.handleClick}>
        {this.props.label}
      </button>
    );
  }
};
