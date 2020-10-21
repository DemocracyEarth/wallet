import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import { Link } from 'react-router-dom';

import arrowDown from 'images/arrow-down.svg';
import arrowDownActive from 'images/arrow-down-active.svg';
import arrowUp from 'images/arrow-up.svg';
import arrowUpActive from 'images/arrow-up-active.svg';

import 'styles/Dapp.css';

/**
* @summary renders a post in the timeline
*/
export default class Expand extends Component {
  static propTypes = {
    open: PropTypes.bool,
    url: PropTypes.string,
    iconActive: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string,
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
      logo: this.props.icon,
    };

    this.mouseEnter = this.mouseEnter.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  mouseEnter() {
    this.setState({ logo: this.props.iconActive })
    if (this.state.open) {
      return this.setState({ img: arrowUpActive })
    } else {
      return this.setState({ img: arrowDownActive })
    }
  }

  mouseLeave() {
    this.setState({ logo: this.props.icon })
    if (this.state.open) {
      return this.setState({ img: arrowUp });
    } else {
      return this.setState({ img: arrowDown });
    }
  }

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ open: !this.state.open });
    if (this.state.open) { this.setState({ img: arrowDownActive }) } else { this.setState({ img: arrowUpActive }) };
  }

  getStyle() {
    return (this.state.open) ? "details details-open" : "details";
  }

  getImage() {
    return (this.state.open) ? this.setState({ img: arrowUp }) : this.setState({ img: arrowDown });;
  }
  render() {
    return (
      <>
        <Link to={this.props.url} className={this.getStyle()} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave} onClick={this.handleClick}>
          <img className="details-icon details-icon-logo" alt="" src={this.state.logo} />
          {parser(this.props.label)}
          <img className="details-icon" alt="" src={this.state.img} />
        </Link>
        {(this.state.open) ?
          <div className="details-wrapper">
            {this.props.children}
          </div>
          :
          null
        }
      </>
    );
  }
}
