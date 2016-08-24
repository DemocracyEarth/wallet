Template.postComment.events({
  "keypress #postComment": function (event) {
    if (event.which == 13) {
      event.preventDefault();
      console.log('post comment');
    }
  },
  "click #postComment": function (event) {
    if ($('#postComment').attr('active') == 'false') {
       $('#postComment').attr('active', true);
       $('#postComment').attr('class', 'comment comment-post');
       document.getElementById('postComment').innerText = '';
    }
  },
  "blur #postComment": function (event) {
    if (document.getElementById('postComment').innerText == '') {
      $('#postComment').attr('active', false);
      $('#postComment').attr('class', 'comment comment-post comment-disabled');
      document.getElementById('postComment').innerText = TAPi18n.__('argue');
    }
  }
})
