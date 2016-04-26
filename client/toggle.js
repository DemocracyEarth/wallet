if (Meteor.isClient) {

  var clickedToggle = new String();
  var toggleMap = new Object();

  Template.toggle.rendered = function () {
    for (var item in toggleMap) {
      node = $('.' + item).children();
      toggle(node,toggleMap[item]);
    };
  };

  Template.toggle.helpers({
    value: function () {
      if (this.setting == clickedToggle) {
        var node = $('.' + this.setting).children();
        toggle(node,this.value);
      } else {
        if (toggleMap[this.setting] == undefined) {
          toggleMap[this.setting] = this.value;
        }
      };
    },
    setting: function () {
      return this.setting;
    }
  });

  Template.toggle.events({
    "click #toggleButton": function () {
      clickedToggle = this.setting;
      Meteor.call("updateContractField", Session.get('contractId'), this.setting, !this.value);
    }
  });

}

function toggle (node, value) {
  if (value) {
    animate(node, 'slide-right', { duration: 100 });
    animate(node.parent().first(), 'color-activate');
  } else {
    animate(node, 'slide-left', { duration: 100 });
    animate(node.parent().first(), 'color-deactivate');
  }
}
