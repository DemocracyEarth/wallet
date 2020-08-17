import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/Dapp.css';

/**
* @summary displays the timestamp of a given post or event
*/
export default class Parameter extends Component {
  childrenRender() {
    switch (this.props.children.type.name) {
      case 'Token':
        return (
          <div className="parameter-token">
            {this.props.children}
          </div>
        );
      default:
    }
    return this.props.children;
  }

  render() {
    return (
      <div className="parameter">
        <div className="parameter-name">
          {this.props.label}
        </div>
        <div className="parameter-value">
          {this.childrenRender()}
        </div>
      </div>
    );
  }
}

Parameter.propTypes = {
  label: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

