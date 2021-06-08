import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import { check404 } from 'components/Token/Token';
import { ERC20abi } from 'lib/abi/erc20';

import web3 from 'web3';
import { config } from 'config';

import BigNumber from 'bignumber.js/bignumber';
import i18n from 'i18n';
import { defaults } from 'lib/const';


import 'styles/material.css';

const Web3 = require('web3');

const response = (err, res) => {
  if (err) {
    console.log(err);
  }
  return res;
}

/**
* @summary renders a post in the timeline
*/
export default class Wallet extends Component {
  static propTypes = {
    styleClass: PropTypes.string,
    label: PropTypes.string,
    url: PropTypes.string,
    tooltip: PropTypes.string,
    symbol: PropTypes.string,
    tokenAddress: PropTypes.string,
    contractAddress: PropTypes.string,
    accountAddress: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: '',
      approved: false,
    };

    this.web3 = new Web3(window.web3.currentProvider);
    this.checkAllowance = this.checkAllowance.bind(this);
  }

  async componentDidUpdate(prevProps) {
    this.token = await new this.web3.eth.Contract(ERC20abi, this.props.tokenAddress);
    if (this.props.accountAddress !== prevProps.accountAddress) {
      await this.checkAllowance();
    }
  }

  async checkAllowance() {
    if (this.props.accountAddress !== defaults.EMPTY) {
      const allowance = new BigNumber(await this.token.methods.allowance(this.props.accountAddress, this.props.contractAddress).call({}, response)).toString();
      this.setState({
        approved: (allowance !== '0')
      });
    }
  }

  render() {
    let image;
    let imageExists;
    if (this.props.tokenAddress) {
      image = `${config.web.icons.replace('{{publicAddress}}', web3.utils.toChecksumAddress(this.props.tokenAddress))}`;
      imageExists = check404(image);
    }

    return (
      <div className="wallet">
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">{i18n.t('amount')}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={this.state.amount}
            placeholder='0.00'
            inputProps={{ type: 'number', inputMode: 'numeric', pattern: '[0-9]*' }}
            startAdornment={
              <InputAdornment position="start">
                {(this.props.tokenAddress && imageExists) ?
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
        {(this.state.approved) ?
          <>
            <Button className="wallet-button" variant="contained" disabled>{i18n.t('approved')}</Button>
            <Button className="wallet-button" color="primary" variant="contained">{i18n.t('deposit')}</Button>
            <Button className="wallet-button" color="primary" variant="contained">{i18n.t('withdraw')}</Button>
          </>
          :
          <>
            <Button className="wallet-button" color="primary" variant="contained">{i18n.t('approve')}</Button>
            <Button className="wallet-button" variant="contained" disabled>{i18n.t('deposit')}</Button>
            <Button className="wallet-button" variant="contained" disabled>{i18n.t('withdraw')}</Button>
          </>
        }
      </div>
    );
  }
}
