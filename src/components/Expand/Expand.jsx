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
    open: PropTypes.bool,
    url: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  }

  constructor(props) {
    super(props);
    this.state = {
      open: props.open,
      img: arrowDown,
    };

    this.mouseEnter = this.mouseEnter.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  mouseEnter() {
    this.setState({ img: arrowDownActive });
  }

  mouseLeave() {
    this.setState({ img: arrowDown });
  }

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ open: !this.state.open });
  }

  getStyle() {
    return (this.state.open) ? "details details-open" : "details";
  }

  render() {
    return (
      <Link to={this.props.url} className={this.getStyle()} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave} onClick={this.handleClick}>
        {i18n.t('see-proposal-details')}
        <img className="url-icon" alt="" src={this.state.img} />
      </Link>
    );
  }
}
