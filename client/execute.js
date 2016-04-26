if (Meteor.isClient) {
  Template.execute.rendered = function () {
    behave(this.firstNode, 'fade');
  };
}
