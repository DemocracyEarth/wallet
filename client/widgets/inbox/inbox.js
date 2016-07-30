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

  //  Modules.client.setSidebarMenu($('#sidebar-button-' + this.id).attr('feed'));

    if (Session.get('sidebarMenuSelectedId') != undefined) {
    //  var nodeOld = $('#sidebar-button-' + Session.get('sidebarMenuSelectedId'));
    //  animateUnselection(nodeOld);
    }

    if (Session.get('sidebarMenuSelectedId') != this.id) {
    //  Session.set('sidebarMenuSelectedId', this.id);
    //  var node = $('#sidebar-button-' + this.id);
    //  animateSelection(node);
    }

  }
})

function animateSelection(node) {

  node.css('background-color', '#6d5c7d');
  node.css('color', '#fff');
  //node
  //  .velocity({'backgroundColor': '#6d5c7d'}, { duration: 100 })
}

function animateUnselection(node) {

  node.css('background-color', 'transparent');
  node.hover(function(){
    $(this).css("background-color", "rgba(180, 171, 189, 0.2)");
  }
  );
  node.css('color', '#000');

}
