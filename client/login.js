if (Meteor.isClient) {

  var currentTab = 0;

  Template.login.helpers({
    tabDisplay: function () {
    //  console.log(this);
    }
  });

  Template.login.events({
    "click #tab-button": function (event) {
      setTabValue(event);
      renderTabs(event.target.parentNode.parentNode.childNodes);
    }
  });
};

function setTabValue(event) {
  var tab = event.target.parentNode;
  var tabCollection = tab.parentNode.childNodes
  if (tab.getAttribute('value') == "false") {
    for (var i = 0; i < tabCollection.length; i++) {
      if (tabCollection[i].nodeType == 1) {
        if (tabCollection[i].getAttribute('value') == "true") {
          tabCollection[i].setAttribute('value', false);
        }
      }
    }
    tab.setAttribute('value', true);
  };
}

function renderTabs(tabs) {
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].nodeType == 1) {
      if (tabs[i].getAttribute('value') == "true") {
        tabs[i].setAttribute('class', 'tab tab-active');
        currentTab = i;
      } else {
        tabs[i].setAttribute('class', 'tab');
      }
    }
  };
};
