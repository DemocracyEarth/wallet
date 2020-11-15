import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Placeholder from 'components/Feed/Placeholder';
import Paginator from 'components/Paginator/Paginator';
import Feed from 'components/Feed/Feed';
import Search from 'components/Search/Search';

import { molochFeed } from 'components/Timeline/moloch';
import { makerFeed } from 'components/Timeline/maker';

import parser from 'html-react-parser';
import i18n from 'i18n';

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
export default class Timeline extends Component {
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
    this.state = { data: [], loading: true, error: '' };
  }

  componentDidMount() {
    this.getFeed();
  }

  componentDidUpdate(prevProps) {
    const props = JSON.stringify(this.props);
    const prev = JSON.stringify(prevProps);
    if (props !== prev) {
      this.getFeed();
    }
  }

  getFeed() {
    makerFeed(this.props)
      .then(res => this.setState({ data: res.data, loading: res.loading, error: res.error }));
  }

  render() {
    if (this.state.loading) {
      if (this.props.format === 'searchBar') return null;
      if (this.props.page > 1) {
        return <Paginator placeholder={true} />
      }
      return <Placeholder />;
    }

    if (this.state.error) return (
      <>
        {(this.props.format === 'searchBar') ?
          <Search />
          :
          <div className="empty failure">{parser(i18n.t('failure', { errorMessage: this.state.error }))}</div>
        }
      </>
    );

    return (
      <Feed data={this.state.data} param={this.props.param} address={this.props.address} period={this.props.period} view={this.props.view} 
        proposalId={this.props.proposalId} page={this.props.page} format={this.props.format} first={this.props.first} skip={this.props.skip} 
        orderBy={this.props.orderBy} orderDirection={this.props.orderDirection} />
    );
  }
};
