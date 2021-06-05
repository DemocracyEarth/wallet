import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import i18n from 'i18n';

import 'styles/Dapp.css';
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

  render() {
    return (
      <>
        <Button className="wallet-button" color="primary" variant="contained">{i18n.t('approve')}</Button>
        <Button className="wallet-button" variant="contained" disabled>{i18n.t('deposit')}</Button>
        <Button className="wallet-button" variant="contained" disabled>{i18n.t('withdraw')}</Button>
      </>
    );
  }
}
