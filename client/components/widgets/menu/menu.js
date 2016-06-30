Template.compose.rendered = function () {
  $('.action-label').css('opacity', 0);
  $('.action-icon-mouseover').css('opacity', 0);
};

Template.compose.helpers({
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

Template.compose.events({
  'mouseover #action-hotspace': function () {
    Session.set('displayMenu', true);
    animationIntro();
  },
  'mouseleave #action-hotspace': function () {
    Session.set('displayMenu', false);
    animationExit();
  }
});

let animationIntro = () => {
  $('.action-icon-mouseleave').velocity({'opacity': 0}, Modules.client.animationSettings);
  $('.action-icon-mouseover').velocity({'opacity': 1}, Modules.client.animationSettings);
  $('.action-label').velocity({'opacity': 1, 'margin-left': -135}, Modules.client.animationSettings);
}

let animationExit = () => {
  $('.action-icon-mouseleave').velocity({'opacity': 1}, Modules.client.animationSettings);
  $('.action-icon-mouseover').velocity({'opacity': 0}, Modules.client.animationSettings);
  $('.action-label').velocity({'opacity': 0, 'margin-left': -115}, Modules.client.animationSettings);
}
