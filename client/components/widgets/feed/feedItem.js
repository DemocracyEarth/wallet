Template.feedItem.helpers({
  description: function () {
    return Modules.client.stripHTMLfromText(this.description).replace(/(([^\s]+\s\s*){35})(.*)/,"$1…");
  }
})
