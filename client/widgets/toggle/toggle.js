var clickedToggle = new String();
var toggleMap = new Object();

Template.toggle.rendered = function () {
  displayToggle();
  Session.set('clickedToggle', this.setting);
};

Template.toggle.helpers({
  value: function () {
    if (this.setting == Session.get('clickedToggle')) {
      var node = $('.' + this.setting).children();
      toggle(node,this.value);
    } else {
      if (toggleMap[this.setting] == undefined) {
        toggleMap[this.setting] = this.value;
      }
    };
    //return this.value;
  },
  setting: function () {
    //console.log('this setting: ' + this.setting + ' valule:' + this.value);
    toggleMap[this.setting] = this.value;
    displayToggle();
    return this.setting;
  }
});

Template.toggle.events({
  "click #toggleButton": function (event) {
    //clickedToggle = this.setting;
    Session.set('clickedToggle', this.setting);
    var obj = new Object;
    toggle($('.' + this.setting).children(), !this.value);
    Meteor.call("updateContractField", Session.get('contract')._id, this.setting, !this.value);
    //Modules.client.displayNotice(TAPi18n.__('saved-draft-description'), true);
  }
});

function displayToggle() {
  //console.log('[toggle function] updating toggles:');
  //console.log(toggleMap);
  for (var item in toggleMap) {
    node = $('.' + item).children();
    toggle(node,toggleMap[item]);
  };
}


function toggle (node, value) {

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
