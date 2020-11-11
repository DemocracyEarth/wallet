import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MolochFeed } from 'components/Fetchers/Moloch';
import Timeline from 'components/Timeline/Timeline';


import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
export default class Normalizer extends Component {
  static propTypes = {
    field: PropTypes.string,
    address: PropTypes.string,
    proposalId: PropTypes.string,
    page: PropTypes.number,
    view: PropTypes.string,
    period: PropTypes.string,
    format: PropTypes.string,
    param: PropTypes.string,
    first: PropTypes.number,
    skip: PropTypes.number,
    orderBy: PropTypes.string,
    orderDirection: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = { checked: props.checked };
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    console.log(this.props);
    const moloch = await MolochFeed(this.props);
    console.log('molcoh');
    console.log(moloch);
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
      <Timeline 
        address={this.props.address} period={this.props.period} view={this.props.view} proposalId={this.props.proposalId} param={this.props.param}
        first={this.props.first} skip={this.props.skip} page={this.props.page} orderBy={this.props.orderBy} orderDirection={this.props.orderDirection}
      />
    );
  }
};
