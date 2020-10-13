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
  };

  constructor(props) {
    super(props);

    this.state = {
      selected: props.selected,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ selected: true });
    this.props.action();
  }

  render() {
    return (
      <h4 id='tab-button' className={`tab-button ${this.state.selected ? 'tab-button-selected' : null}`} onClick={this.handleClick}>
        {this.props.label}
      </h4>
    );
  }
};
