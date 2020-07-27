import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
* @summary displays the contents of a poll
*/
export default class Item extends Component {
  getLabel() {
    if (this.props.children) {
      return this.props.children;
    }
    return (this.props.label);
  }

  render() {
    return (
      <div className="menu-item">
        <div className="sidebar-label">
          {this.getLabel()}
        </div>
        <div className="sidebar-tag">
          {this.props.score}
        </div>
      </div>
    );
  }
}

Item.propTypes = {
  label: PropTypes.string,
  score: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

