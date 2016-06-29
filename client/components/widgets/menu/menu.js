Template.menu.rendered = function () {
};

Template.menu.helpers({
  total: function () {
    if (Meteor.user().profile.menu != undefined) {
      if (Meteor.user().profile.menu.total == 0) {
        return '+';
      } else {
        return Meteor.user().profile.menu.total;
      }
    }
  },
  showMenu: function () {
    return Session.get('displayMenu');
  }
});

Template.subMenu.helpers({
  drafts: function () {
    return Meteor.user().profile.menu.drafts;
  },
  memberships: function () {
    return Meteor.user().profile.menu.memberships;
  },
  delegations: function () {
    return Meteor.user().profile.menu.delegations;
  },
  votes: function () {
    return Meteor.user().profile.menu.votes;
  },
  signalStyle: function (score) {
    if (score > 0) {
      return '';
    } else {
      return 'void';
    }
  }
});

Template.menu.events({
  'mouseover #action': function () {
    Session.set('displayMenu', true);
    animationIntro();
  },
  'mouseleave #action': function () {
    Session.set('displayMenu', false);
    animationExit();
  }
});

Template.subMenu.rendered = function () {
  $('.menu-item').css('opacity', '0');
  $('.menu-item').velocity({'opacity': '1'}, Modules.client.animationSettings);
}

let animationIntro = () => {
  /*$('.cast').velocity({
    'width': '70px',
    'height': '70px',
    'right': '20px',
    'bottom': '20px',
  }, Modules.client.animationSettings);
  $('.cast').velocity("stop");*/

}

let animationExit = () => {

}
