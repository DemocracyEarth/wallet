var clickedToggle = new String();
var toggleMap = new Object();

Template.toggle.rendered = function () {
  displayToggle(false);
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
    displayToggle(false);
    return this.setting;
  }
});

Template.toggle.events({
  "click #toggleButton": function (event) {
    //clickedToggle = this.setting;
    if (!Session.get('rightToVote') || Session.get('contract').stage == STAGE_DRAFT) {
      Session.set('clickedToggle', this.setting);
      var obj = new Object;
      toggle($('.' + this.setting).children(), !this.value, true);
      var obj = {};
      obj[this.setting] = !this.value;
      Contracts.update(Session.get('contract')._id, { $set: obj });
    }
  }
});

function displayToggle(animate) {
  for (var item in toggleMap) {
    node = $('.' + item).children();
    toggle(node,toggleMap[item], animate);
  };
}


function toggle (node, value, animate) {

  if (animate) {
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
  } else {
    if (value) {
      node.css('margin-left', '42px');
      node.parent().first().css('background-color', '#00bf8f');
    } else {
      node.css('margin-left', '2px');
      node.parent().first().css('background-color', '#ccc');
    }
  }
}
