import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';

import { defaults } from '/lib/const';
import { getDescription  } from '/imports/ui/components/Post/Post.jsx';
import { getTemplateImage } from '/imports/ui/templates/layout/templater.js';

const numeral = require('numeral');

/**
* @summary displays the contents of a poll
*/
export default class Preview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      icon: {
        passed: '',
        rejected: '',
        quit: '',
      },
    };
  }

  async componentDidMount() {
    await this.setIcons();
  }

  async setIcons() {
    this.setState({
      icon: {
        passed: await getTemplateImage('passed'),
        quit: await getTemplateImage('ragequit'),
        rejected: await getTemplateImage('rejected'),
      },
    });
  }

  getVote() {
    const label = (this.props.quantity.toNumber() === 1) ? 'share' : 'shares';

    switch (this.props.uintVote) {
      case defaults.YES:
        return (
          <div href={this.props.uintVote} className="transaction-action transaction-action-passed">
            {TAPi18n.__('voted-yes').replace('{{shares}}', numeral(this.props.quantity).format('0,0')).replace('{{label}}', label)}
          </div>
        );
      case defaults.NO:
        return (
          <div href={this.props.uintVote} className="transaction-action transaction-action-rejected">
            {TAPi18n.__('voted-no').replace('{{shares}}', numeral(this.props.quantity).format('0,0')).replace('{{label}}', label)}
          </div>
        );
      default:
    }
    return null;
  }

  render() {
    const title = getDescription(this.props.description).title;

    return (
      <div className="preview-info">
        {this.getVote()}
        <div className="preview-arrow">
          &#183;
        </div>
        <div className="preview-label">
          <em>{title}</em>
        </div>
      </div>
    );
  }
}

Preview.propTypes = {
  uintVote: PropTypes.number,
  description: PropTypes.string,
  quantity: PropTypes.string,
};

