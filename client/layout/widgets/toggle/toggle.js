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
      //toggle(node,this.value);
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
  "click #toggleButton": function (event) {
    clickedToggle = this.setting;
    var obj = new Object;

    //console.log(event.target);
    toggle($('.' + this.setting).children(), !this.value);

    //Contracts.update({_id: Session.get('contractId')}, { this.setting: !this.value });
    Meteor.call("updateContractField", Session.get('contractId'), this.setting, !this.value);
  }
});


function toggle (node, value) {
  console.log(node + ' ' + value);

  if (value) {

    node
      .velocity("stop")
      .velocity({'margin-left': '2px'}, Modules.client.animationSettings)
      .velocity({'margin-left': '42px'}, Modules.client.animationSettings)
      .velocity("stop");

    node.parent().first()
      .velocity("stop")
      .velocity({'backgroundColor': '#ccc'}, Modules.client.animationSettings)
      .velocity({'backgroundColor': '#00bf8f'}, Modules.client.animationSettings)
      .velocity("stop");

  } else {

    node
      .velocity("stop")
      .velocity({'margin-left': '42px'}, Modules.client.animationSettings)
      .velocity({'margin-left': '2px'}, Modules.client.animationSettings)
      .velocity("stop");

    node.parent().first()
      .velocity("stop")
      .velocity({'backgroundColor': '#00bf8f'}, Modules.client.animationSettings)
      .velocity({'backgroundColor': '#ccc'}, Modules.client.animationSettings)
      .velocity("stop");

  }
}
