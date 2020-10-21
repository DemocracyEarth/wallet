import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';

import { Link } from 'react-router-dom';

import arrowDown from 'images/arrow-down.svg';
import arrowDownActive from 'images/arrow-down-active.svg';

import 'styles/Dapp.css';

/**
* @summary renders a post in the timeline
*/
export default class Expand extends Component {
  static propTypes = {
    url: PropTypes.number,
    totalVoters: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      img: arrowDown,
    };

    this.mouseEnter = this.mouseEnter.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
  }

  mouseEnter() {
    this.setState({ img: arrowDownActive });
  }

  mouseLeave() {
    this.setState({ img: arrowDown });
  }

  render() {
    return (
      <Link to={this.props.url} className="details" onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        {i18n.t('see-proposal-details')}
        <img className="url-icon" alt="" src={this.state.img} />
      </Link>
    );
  }
}
