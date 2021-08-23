import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import 'styles/Dapp.css';
import i18n from 'i18n';

/**
* @summary renders a post in the timeline
*/
export default class Warning extends Component {
  static propTypes = {
    styleClass: PropTypes.string,
    label: PropTypes.string,
    url: PropTypes.string,
    tooltip: PropTypes.string,
    hasCallToAction: PropTypes.bool,
    callToActionLabel: PropTypes.string,
    callToAction: PropTypes.func
  }
  
  render() {
    return (
      <div className="preview-info preview-info-warning">
        <div className="transaction-action transaction-action-warning">
          {parser(this.props.label)}
          {(this.props.hasCallToAction) ?
            <div onClick={this.props.callToAction}>
              {parser(i18n.t(this.props.callToActionLabel))}
            </div>
            :
            null
          }
        </div>
      </div>
    );
  }
}
