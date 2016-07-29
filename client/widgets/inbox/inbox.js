Template.inbox.rendered = function () {
  //$('.menu-item').css('opacity', '0');
  //$('.menu-item').velocity({'opacity': '1'}, Modules.client.animationSettings);
}


Template.inbox.helpers({
  selected: function () {
    if (this.selected) {
      return 'menu-item-selected';
    } else {
      return '';
    }
  },
  signalStyle: function () {
    if (this.value > 0) {
      return '';
    } else {
      if (this.selected) {
        return 'signal-selected void'
      } else {
        return 'void';
      }
    }
  }
});

Template.inbox.events({
  'click #menuButton': function (event) {
    var node = $('#sidebar-button-'+ this.id);
    Session.set('inboxMenu', Modules.client.setSidebarMenu(node.attr('feed')));
    /*var node = $('#sidebar-button-'+ this.id);
    console.log(node.attr('feed'));

    Session.set('inboxMenu', Modules.client.setMenu(node.attr('feed')));

    node.css('background-color', '#00c091');
    node
      .velocity({'backgroundColor': '#6d5c7d'}, Modules.client.animationSettings)
      .velocity({'color': '#fff'}, Modules.client.animationSettings);*/
  }
})
