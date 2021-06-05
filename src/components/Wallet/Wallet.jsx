import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';

import i18n from 'i18n';

import 'styles/material.css';

/**
* @summary renders a post in the timeline
*/
export default class Wallet extends Component {
  static propTypes = {
    styleClass: PropTypes.string,
    label: PropTypes.string,
    url: PropTypes.string,
    tooltip: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: '',
      password: '',
      weight: '',
      weightRange: '',
      showPassword: false,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (prop) => (event) => {
    this.setState({ ...this.state, [prop]: event.target.value });
  };

  render() {
    return (
      <div className="wallet">
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={this.state.amount}
            onChange={this.handleChange('amount')}
            startAdornment={<InputAdornment position="start">DAI</InputAdornment>}
            labelWidth={60}
          />
        </FormControl>
        <Button className="wallet-button" color="primary" variant="contained">{i18n.t('approve')}</Button>
        <Button className="wallet-button" variant="contained" disabled>{i18n.t('deposit')}</Button>
        <Button className="wallet-button" variant="contained" disabled>{i18n.t('withdraw')}</Button>
      </div>
    );
  }
}
