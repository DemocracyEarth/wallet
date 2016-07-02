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
      return 'void';
    }
  }
});

Template.inbox.rendered = function () {
  $('.menu-item').css('opacity', '0');
  $('.menu-item').velocity({'opacity': '1'}, Modules.client.animationSettings);
}
