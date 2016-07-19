Template.fork.helpers({
  length: function () {
    if (this.label.length > 51) {
      return 'option-link option-long option-longest';
    } else if (this.label.length > 37) {
      return 'option-link option-long';
    } else {
      return '';
    }
  }
})
