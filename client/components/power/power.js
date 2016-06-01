Template.power.rendered = function (user) {

}

Template.power.helpers({
  availableVotes: function (user) {
    getUserInfo(user, 'availableVotes');
    var votes = Session.get('availableVotes');
    var htmlStart = "<div class='vote-available label-votes'><strong data-new-link='true'>"
    var htmlValue = votes.toString();
    if (votes == 0) {
      var htmlEnd = " </strong><span>" + TAPi18n.__('available-votes') + "</span></div>"
    } else {
      //TODO specify in the anchor the URL that will be used to see the delegated votes.
      var htmlEnd = " </strong><span><a href='#'>" + TAPi18n.__('available-votes') + "</a></span></div>"
    }
    return htmlStart + htmlValue + htmlEnd;
  },
  placedVotes: function (user) {
    getUserInfo(user, 'placedVotes');
    var votes = Session.get('placedVotes');
    var htmlStart = "  <div class='vote-allocated label-votes'><strong data-new-link='true'>";
    var htmlValue = votes.toString();
    if (votes == 0) {
      var htmlEnd = " </strong><span>" + TAPi18n.__('placed-votes') + "</span></div>"
    } else {
      //TODO specify in the anchor the URL that will be used to see the delegated votes.
      var htmlEnd = " </strong><span><a href='#'>" + TAPi18n.__('placed-votes') + "</a></span></div>"
    }
    return htmlStart + htmlValue + htmlEnd;
  }
})

function getUserInfo (userId, sessionVar) {
  Meteor.call('getUserInfo', userId, function (error, data) {
    if (error)
      console.log(error);

    Session.set(sessionVar, data.profile.votes.total)
  });
}
