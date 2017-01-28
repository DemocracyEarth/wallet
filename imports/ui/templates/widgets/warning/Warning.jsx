import React, { Component, PropTypes } from 'react';
import { behave } from '/imports/ui/modules/animation';
import { TAPi18n } from 'meteor/tap:i18n';

export default class Warning extends Component {
  componentDidMount() {
    // TODO: fade-and-roll not rendering correctly
    behave(this.props.warning, 'fade-and-roll', { height: '36px' });
  }

  render() {
    return (
      <ul className="w-list-unstyled warning-list animate">
        <li className="warning">{TAPi18n.__(this.props.label)}</li>
      </ul>
    );
  }
}

Warning.PropTypes = {
  warning: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
};
