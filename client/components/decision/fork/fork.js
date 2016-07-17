Template.fork.helpers({
  length: function () {
    if (this.label.length > 47) {
      return 'option-link option-long option-longest';
    } else if (this.label.length > 36) {
      return 'option-link option-long';
    } else {
      return '';
    }
  }
})
