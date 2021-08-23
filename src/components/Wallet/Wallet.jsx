import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import { check404 } from 'components/Token/Token';

import { walletError, awaitTransaction } from 'components/Choice/messages';
import logo from 'images/logo.png';
import { ERC20abi } from 'lib/abi/erc20';
import { ubidaiABI } from 'components/Vault/ubidai-abi.js';
import web3 from 'web3';
import { config } from 'config';
import BigNumber from 'bignumber.js/bignumber';
import i18n from 'i18n';
import { zeroAddress } from 'lib/const';
import detectEthereumProvider from '@metamask/detect-provider'

import 'styles/material.css';

const Web3 = require('web3');
const MAX_UINT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

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
    refresh: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: '',
      approved: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.checkAllowance = this.checkAllowance.bind(this);
    this.approve = this.approve.bind(this);
    this.deposit = this.deposit.bind(this);
    this.withdraw = this.withdraw.bind(this);
  }

  async componentDidUpdate(prevProps) {
    const provider = await detectEthereumProvider();
    if (provider && provider.isConnected()) {
      this.web3 = new Web3(provider);
      this.token = await new this.web3.eth.Contract(ERC20abi, this.props.tokenAddress);
      this.vault = await new this.web3.eth.Contract(ubidaiABI, this.props.contractAddress);
      if (this.props.accountAddress !== prevProps.accountAddress || this.props.contractAddress !== prevProps.contractAddress) {
        await this.checkAllowance();
      }
    }
  }

  async checkAllowance() {
    if (this.props.accountAddress !== zeroAddress) {
      const allowance = new BigNumber(await this.token.methods.allowance(this.props.accountAddress, this.props.contractAddress).call({}, response)).toString();
      this.setState({
        approved: (allowance !== '0')
      });
    }
  }

  handleChange = (prop) => (event) => {
    this.setState({ [prop]: event.target.value });
  };

  approve() {
    this.token.methods.approve(this.props.contractAddress, MAX_UINT).send({ from: this.props.accountAddress }, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      if (res) {
        window.showModal.value = false;
        window.modal = {
          icon: logo,
          title: i18n.t('approval'),
          message: i18n.t('token-approval', { etherscan: `https://etherscan.io/tx/${res}` }),
          cancelLabel: i18n.t('close'),
          mode: 'ALERT'
        }
        this.setState({ approved: true });
        window.showModal.value = true;
      }
      return res;
    }).then((receipt) => {
      this.props.refresh();
    });
  }

  deposit() {
    if (!isNaN(document.getElementById('outlined-adornment-amount').value) && document.getElementById('outlined-adornment-amount').value > 0) {
      awaitTransaction(i18n.t('token-deposit-await', { asset: `${document.getElementById('outlined-adornment-amount').value} ${this.props.symbol}` }));
      const amount = Web3.utils.toWei(document.getElementById('outlined-adornment-amount').value, 'ether');
      this.vault.methods.deposit(amount).send({ from: this.props.accountAddress }, (err, res) => {
        if (err) {
          walletError(err);
          return err;
        }
        if (res) {
          window.showModal.value = false;
          window.modal = {
            icon: logo,
            title: i18n.t('deposit'),
            message: i18n.t('token-deposit', { etherscan: `https://etherscan.io/tx/${res}` }),
            cancelLabel: i18n.t('close'),
            mode: 'ALERT'
          }
          window.showModal.value = true;
        }
        return res;
      }).then((receipt) => {
        this.props.refresh();
      });
      
    }
  }

  withdraw() {
    awaitTransaction(i18n.t('token-withdrawal-await', { assets: this.props.symbol }));
    this.vault.methods.withdraw().send({ from: this.props.accountAddress }, (err, res) => {
      if (err) {
        walletError(err);
        return err;
      }
      if (res) {
        window.showModal.value = false;
        window.modal = {
          icon: logo,
          title: i18n.t('withdraw'),
          message: i18n.t('token-withdraw', { etherscan: `https://etherscan.io/tx/${res}` }),
          cancelLabel: i18n.t('close'),
          mode: 'ALERT'
        }
        window.showModal.value = true;
      }
      return res;
    }).then((receipt) => {
      this.props.refresh();
    });
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
            onChange={this.handleChange('amount')}
            placeholder='0.00'
            inputProps={{ type: 'number' }}
            startAdornment={
              <InputAdornment position="start">
                {(this.props.tokenAddress && imageExists) ?
                  <>
                    <img className="token-icon" src={image} alt="" />{this.props.symbol}
                  </>
                  :
                  this.props.symbol
                }
              </InputAdornment>}
            labelWidth={60}
          />
        </FormControl>

        {(this.props.accountAddress !== zeroAddress) ?
          <>
            {(this.state.approved) ?
              <>
                <Button className="wallet-button" variant="contained" disabled>{i18n.t('approved')}</Button>
                <Button className="wallet-button" color="primary" variant="contained" onClick={() => { this.deposit() }}>{i18n.t('deposit')}</Button>
                <Button className="wallet-button" color="primary" variant="contained" onClick={() => { this.withdraw() }}>{i18n.t('withdraw-all')}</Button>
              </>
              :
              <>
                <Button className="wallet-button" color="primary" variant="contained" onClick={() => { this.approve() }}>{i18n.t('approve')}</Button>
                <Button className="wallet-button" variant="contained" disabled>{i18n.t('deposit')}</Button>
                <Button className="wallet-button" variant="contained" disabled>{i18n.t('withdraw-all')}</Button>
              </>
            }
          </>
          :
          <>
            <Button className="wallet-button" variant="contained" disabled>{i18n.t('approve')}</Button>
            <Button className="wallet-button" variant="contained" disabled>{i18n.t('deposit')}</Button>
            <Button className="wallet-button" variant="contained" disabled>{i18n.t('withdraw-all')}</Button>
          </>
        }
      </div>
    );
  }
}
