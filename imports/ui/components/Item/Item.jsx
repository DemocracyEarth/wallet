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
    if (this.props.hideEmpty && this.props.score === 0) return null;
    return (
      <a className="menu-item" href={this.props.href}>
        {(this.props.sharp) ?
          <div className="sidebar-sharp">
            📄
          </div>
        :
          null
        }
        <div className="sidebar-label">
          {this.getLabel()}
        </div>
        <div className="sidebar-tag">
          {this.props.score}
        </div>
      </a>
    );
  }
}

Item.propTypes = {
  sharp: PropTypes.bool,
  label: PropTypes.string,
  score: PropTypes.number,
  hideEmpty: PropTypes.bool,
  href: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

