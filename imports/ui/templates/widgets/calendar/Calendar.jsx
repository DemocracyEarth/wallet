import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Session } from 'meteor/session';
import DatePicker from './DatePicker.jsx'


export default class Calendar extends Component {
  closingDate() {
    const today = new Date();
    let d = new Date();
    if (today > Session.get('contract').closingDate) {
      const contract = Session.get('contract');
      contract.closingDate = today;
      contract.closingDate.setDate(today.getDate() + 1);
      Session.set('contract', contract);
    }
    d = Session.get('contract').closingDate;
    return d.format('{Month} {d}, {yyyy}');
  }

  displayCalendar(icon) {
    if (icon === true) {
      if (Session.get('showCalendar') == true) {
        return {display: "none"};
      } else {
        return {};
      }
    } else {
      if (Session.get('showCalendar') == undefined) {
        Session.set('showCalendar', false);
      } else if (Session.get('showCalendar') == true) {
        return {};
      } else {
        return {display: "none"};
      }
    }
  }

  toggleStatus() {
    if (Session.get('showCalendar')) {
      return 'calendar-menu-active';
    }
    return '';
  }

  toggleCalendar() {
    Session.set('displaySelector', !Session.get('displaySelector'));
    Session.set('showCalendar', !Session.get('showCalendar'));
  }

  render() {
    return (
      <div>
        <div id="toggleCalendar"
          className={ `w-clearfix calendar-menu ${this.toggleStatus()}` }
          onClick={ this.toggleCalendar }>
            <img src="/images/calendar-active.png"
              className="calendar-icon calendar-icon-active"
              style={ this.displayCalendar() }/>
            <img src="/images/calendar.png" className="calendar-icon"
              style={ this.displayCalendar(true) }/>
            <div className="control">{ this.closingDate() }</div>
        </div>
        <DatePicker displayed={ Session.get('displaySelector') }/>
      </div>
    );
  }
}
