import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import { check404 } from 'components/Token/Token';

import web3 from 'web3';
import { config } from 'config';
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
    publicAddress: PropTypes.string,
    symbol: PropTypes.string
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
    let image;
    let imageExists;
    if (this.props.publicAddress) {
      image = `${config.web.icons.replace('{{publicAddress}}', web3.utils.toChecksumAddress(this.props.publicAddress))}`;
      imageExists = check404(image);
    }

    return (
      <div className="wallet">
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={this.state.amount}
            onChange={this.handleChange('amount')}
            startAdornment={
              <InputAdornment position="start">
                {(this.props.publicAddress && imageExists) ?
                  <>
                    <img className="token-icon" src={image} alt="" />DAI
                  </>
                  :
                  "DAI"
                }
              </InputAdornment>}
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
