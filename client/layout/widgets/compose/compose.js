Template.compose.rendered = function () {
  $('.action-label').css('opacity', 0);
  $('.action-label').css('overflow', 'hidden');
  $('.action-icon-mouseover').css('opacity', 0);
};

Template.compose.helpers({
  mouseActive: function () {
    return Session.get('showCompose');
  }
});

Template.compose.events({
  'mouseover #action-hotspace': function () {
    Session.set('showCompose', true)
    animationIntro();
  },
  'mouseleave #action-hotspace': function () {
    Session.set('showCompose', false)
    animationExit();
  },
  'click #action-hotspace': function () {
    //Modules.both.createContract();
    Router.go('/vote/draft');
  }
});

let animationIntro = () => {
  $('.action-icon-mouseleave').velocity({'opacity': 0}, Modules.client.animationSettings);
  $('.action-icon-mouseover').velocity({'opacity': 1, complete: function () {} }, Modules.client.animationSettings);
  $('.action-label').velocity({'opacity': 1, 'margin-left': '-135px', 'width': '120px'}, Modules.client.animationSettings);
}

let animationExit = () => {
  $('.action-icon-mouseleave').velocity({'opacity': 1}, Modules.client.animationSettings);
  $('.action-icon-mouseover').velocity({'opacity': 0}, Modules.client.animationSettings);
  $('.action-label').velocity({'opacity': 0, 'margin-left': -115, 'width': '0px'}, Modules.client.animationSettings);
}
