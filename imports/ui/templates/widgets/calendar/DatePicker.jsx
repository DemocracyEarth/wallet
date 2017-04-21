import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { animationSettings } from '/imports/ui/modules/animation';


export default class DatePicker extends Component {
  componentDidMount() {
    const $datePicker = $(this.refs.datePicker)
    if ($datePicker.html() === '') {
      $datePicker.datepicker();
      $datePicker.on('changeDate', function (e) {
        let currentDate = new Date;
        if (currentDate.getTime() < e.date.getTime()) {
          Session.set('backdating', false);
          Session.set('showCalendar', !Session.get('showCalendar'));
          Session.set('displaySelector', !Session.get('displaySelector'));
          Meteor.call('updateContractField', Session.get('contract')._id, 'closingDate', e.date);
        } else {
          Session.set('backdating', true);
        }
      });
    }
  }

  componentDidUpdate(oldProps) {
    if (!oldProps.displayed && this.props.displayed) {
      const $datePicker = $(this.refs.datePicker)
      $datePicker.css('height', '0');
      $datePicker.css('overflow', 'hidden');
      $datePicker.velocity({ height: '260px' }, animationSettings);
    }
  }

  render() {
    return (
      <div id='date-picker'
        ref="datePicker"
        className="calendar"
        style={this.props.displayed ? {} : {display: "none"}}
      />
    )
  }
}
