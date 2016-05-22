/*

_____                                                   ______           _   _
|  __ \                                                 |  ____|         | | | |
| |  | | ___ _ __ ___   ___   ___ _ __ __ _  ___ _   _  | |__   __ _ _ __| |_| |__
| |  | |/ _ \ '_ ` _ \ / _ \ / __| '__/ _` |/ __| | | | |  __| / _` | '__| __| '_ \
| |__| |  __/ | | | | | (_) | (__| | | (_| | (__| |_| |_| |___| (_| | |  | |_| | | |
|_____/ \___|_| |_| |_|\___/ \___|_|  \__,_|\___|\__, (_)______\__,_|_|   \__|_| |_/
                                                  __/ |
                                                 |___/
version: 0.02
codename: quixote

"You never change things by fighting the existing reality. To change something
build a new model that makes the existing model obsolete."
@BuckminsterFuller

*/

console.log('loading democracy.earth version: 0.02 codename: quixote');

if (Meteor.isClient) {

  Meteor.startup(function () {

    //Setup Language
    Session.set("showLoadingIndicator", true);

    //Internationalizatoin Library
    TAPi18n.setLanguage(getUserLanguage())
      .done(function () {
        Session.set("showLoadingIndicator", false);
      })
      .fail(function (error_message) {
        // Handle the situation
        console.log(error_message);
      });

    //Serch Engine for Tags
    var options = {
      keepHistory: 1000 * 60 * 5,
      localSearch: true
    };
    var fields = ['text', 'url'];

    Session.set('createTag', false);
    TagSearch = new SearchSource('tags', fields, options);

    geoJSON = new Object;
    HTTP.get(Meteor.absoluteUrl("data/geo.json"), function(err,result) {
      geoJSON = result.data;
      Session.set('filteredCountries', result.data.country);
    });

  });

}
