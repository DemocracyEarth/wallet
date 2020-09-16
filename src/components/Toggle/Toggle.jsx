import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from "react-switch";

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
export default class Toggle extends Component {
  constructor(props) {
    super(props);
    this.state = { checked: props.checked };
    this.handleChange = this.handleChange.bind(this);
  }

  static propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool, 
    disabled: PropTypes.bool, 
  }

  handleChange(checked) {
    this.setState({ checked });
  }
  
  render() {
    return (
      <div className="toggle">
        <div className="toggle-label">
          {this.props.label}
        </div>
        <div className="toggle-switch">
          <Switch onChange={this.handleChange} checked={this.state.checked} disabled={this.props.disabled} checkedIcon={false} uncheckedIcon={false} height={20} width={42} onColor={'#01c190'} />
        </div>
      </div>
    );
  }
};
