import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';
import parser from 'html-react-parser';

import { defaults } from '/lib/const';
import { getDescription  } from '/imports/ui/components/Post/Post.jsx';

const numeral = require('numeral');

/**
* @summary displays the contents of a poll
*/
export default class Transaction extends Component {
  getVote() {
    const label = (this.props.quantity.toNumber() === 1) ? 'share' : 'shares';

    const title = `<em>${getDescription(this.props.description).title}</em>`;

    switch (this.props.uintVote) {
      case defaults.YES:
        return (
          <div href={this.props.uintVote} className="transaction-action transaction-action-passed">
            {parser(TAPi18n.__('voted-yes').replace('{{shares}}', numeral(this.props.quantity).format('0,0')).replace('{{label}}', label).replace('{{proposal}}', title))}
          </div>
        );
      case defaults.NO:
        return (
          <div href={this.props.uintVote} className="transaction-action transaction-action-rejected">
            {parser(TAPi18n.__('voted-no').replace('{{shares}}', numeral(this.props.quantity).format('0,0')).replace('{{label}}', label).replace('{{proposal}}', title))}
          </div>
        );
      default:
    }
    return null;
  }

  render() {
    return (
      <div className="preview-info">
        {this.getVote()}
      </div>
    );
  }
}

Transaction.propTypes = {
  uintVote: PropTypes.number,
  quantity: PropTypes.string,
  description: PropTypes.string,
};

