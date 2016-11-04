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
    toggleMap[this.setting] = this.value;
    displayToggle();
    return this.setting;
  }
});

Template.toggle.events({
  "click #toggleButton": function (event) {
    //clickedToggle = this.setting;
    if (!Session.get('rightToVote') || Session.get('contract').stage == STAGE_DRAFT) {
      Session.set('clickedToggle', this.setting);
      var obj = new Object;
      toggle($('.' + this.setting).children(), !this.value);
      var obj = {};
      obj[this.setting] = !this.value;
      console.log('clicked toggle');
      console.log(obj);
      Contracts.update(Session.get('contract')._id, { $set: obj });
    }
  }
});

function displayToggle() {
  for (var item in toggleMap) {
    node = $('.' + item).children();
    toggle(node,toggleMap[item]);
  };
}


function toggle (node, value) {

  console.log(node);
  console.log('value: ' + value);

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
