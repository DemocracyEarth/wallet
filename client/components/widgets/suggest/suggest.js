Template.suggest.rendered = function () {

  Session.set('noMatchFound', false);

  $('.suggest').css('height', '0');
  $('.suggest').velocity({'height': '110px'}, Modules.client.animationSettings);

}

Template.suggest.helpers({
  country: function () {
    if (Session.get('filteredCountries').length == 0) {
      Session.set('noMatchFound', true);
      return [{
          "code": "EA",
          "emoji": "🌎",
          "name": "Earth"
      }];
    } else {
      Session.set('noMatchFound', false);
      return Session.get('filteredCountries');
    }
  },
  noMatchFound: function () {
    return Session.get('noMatchFound');
  }
})

Template.suggest.events({
  "click #country": function (event) {
    var data = Meteor.user().profile;
    var country = {
      code: event.target.parentNode.getAttribute('value'),
      name: event.target.innerText.slice(4)
    }
    if (country.name == 'arth') { country.name = 'Earth' };
    Session.set('newCountry', country);
    Session.set('noMatchFound', false);
    Session.set('showNations', false);
  }
})
