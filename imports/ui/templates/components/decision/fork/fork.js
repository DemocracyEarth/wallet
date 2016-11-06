Template.fork.helpers({
  length: function () {
    if (this.label != undefined) {
      if (this.label.length > 51) {
        return 'option-link option-long option-longest';
      } else if (this.label.length > 37) {
        return 'option-link option-long';
      } else {
        return '';
      }
    };
    return '';
  },
  dragMode: function () {
    if (Session.get('contract').stage == STAGE_DRAFT) {
      return '';
    } else {
      return 'vote-nondrag';
    }
  },
  tickStyle: function () {
    if (this.mode == BALLOT_OPTION_MODE_REJECT) {
      return 'unauthorized';
    }
  },
  checkbox: function (mode) {
    switch (mode) {
      case BALLOT_OPTION_MODE_AUTHORIZE:
        return 'vote-authorize nondraggable';
      case BALLOT_OPTION_MODE_REJECT:
        return 'vote-authorize unauthorized nondraggable';
      case BALLOT_OPTION_MODE_FORK:
        return 'vote vote-alternative';
    }
  },
  action: function () {
      if (this.authorized == false) {
        return 'undefined';
      }
  },
  option: function (mode) {
    if (Session.get('contract').stage == STAGE_DRAFT || ( Session.get('rightToVote') == false && Session.get('contract').stage != STAGE_DRAFT )) {
      return 'disabled';
    } else {
      switch (mode) {
        case BALLOT_OPTION_MODE_AUTHORIZE:
          return '';
        case BALLOT_OPTION_MODE_REJECT:
          return 'option-link ';
        default:
          return '';
      }
    }
  },
  decision: function (mode) {
    switch (mode) {
      case BALLOT_OPTION_MODE_REJECT:
        return 'option-link unauthorized';
      default:
        return '';
    }
  },
  caption: function (mode) {
    if (mode != BALLOT_OPTION_MODE_FORK) {
      return TAPi18n.__(mode);
    } else {
      return this.label;
    }
  },
  tick: function () {
    if (Session.get('contract').stage == STAGE_DRAFT) {
      return 'disabled'
    }
  },
  tickStatus: function () {
    this.tick = Modules.client.getVote(Session.get('contract')._id, this._id);
    if (Session.get('candidateBallot')) {
      if (this.tick) {
        if (this.mode == BALLOT_OPTION_MODE_REJECT) {
          return 'tick-active-unauthorized';
        } else {
          return 'tick-active';
        }
      }
    } else if (Session.get('rightToVote') == false && Session.get('contract').stage != STAGE_DRAFT) {
      //already voted
      if (this.tick) {
        return 'tick-disabled'
      }
    }
    return '';
  }
});


Template.fork.events({
  "click #ballotCheckbox": function (event) {
    switch (Session.get('contract').stage) {
      case STAGE_DRAFT:
      case STAGE_FINISH:
        Session.set('disabledCheckboxes', true);
        break;
      case 'LIVE':
        if (Session.get('rightToVote')) {
          this.tick = Modules.client.setVote(Session.get('contract')._id, this);
          break;
        }
    }
  },

  "click #remove-fork": function () {
    Meteor.call("removeFork", Session.get('contract')._id, this._id);
  }
});
