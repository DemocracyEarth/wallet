Template.collective.helpers({
  title: function () {
    if (Session.get('collective') != undefined) {
      return Session.get('collective').name;
    }
  },
  description: function () {
    if (Session.get('collective') != undefined) {
      return Session.get('collective').profile.bio;
    }
  },
  picture: function () {
    if (Session.get('collective') != undefined) {
      console.log('pic:' + Session.get('collective').profile.logo);
      return Session.get('collective').profile.logo;
    } else {
      return 'images/earth-avatar.png';
    }
  }
})
