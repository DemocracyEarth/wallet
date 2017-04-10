import React, { Component, PropTypes } from 'react';
import ReactDOMServer from 'react-dom/server';
import { behave } from '/imports/ui/modules/animation';
import { TAPi18n } from 'meteor/tap:i18n';

export default class Warning extends Component {
  componentDidMount() {
    behave(this.parentNode, 'fade-and-roll', { height: '36px' });
  }

  render() {
    return (
      <ul className="w-list-unstyled warning-list animate" ref={(parent) => { this.parentNode = parent; }}>
        <li className="warning" dangerouslySetInnerHTML={{ __html: TAPi18n.__(this.props.label) }} />
      </ul>
    );
  }
}

Warning.propTypes = {
  label: PropTypes.string.isRequired,
};
