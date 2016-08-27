Template.main.rendered = function () {
  Session.set('sidebar', true);
};

Template.main.helpers({
  //TODO make all strings showing pixels compliant with the device screen being used (aka mobiles)
  menu: function () {
    if (Session.get('sidebar')) {
      if ($('#menu').css('margin-left') != '-320px') {
        $('#menu').velocity({'marginLeft': '-320px'}, Modules.client.animationSettings);
        $('#content').velocity({'left': '0px'}, Modules.client.animationSettings);
        $('.navbar').velocity({'left': '0px'}, Modules.client.animationSettings);
      }
    } else {
      if ($('#menu').css('margin-left') != '0px') {
        $('#menu').velocity({'marginLeft': '0px'}, Modules.client.animationSettings);
        $('#content').velocity({'left': '320px'}, Modules.client.animationSettings);
        $('.navbar').velocity({'left': '320px'}, Modules.client.animationSettings);
      }
    }
  }
})
