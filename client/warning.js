if (Meteor.isClient) {

  //sample declaration for reference
  Template.warning.rendered = function () {
    behave(this.firstNode, 'fade-and-roll', { 'height': '36px' });
  };

}
