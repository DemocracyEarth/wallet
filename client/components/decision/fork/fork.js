Template.fork.helpers({
  length: function () {
    if (this.label.length > 40) {
      return 'option-link option-long option-longest';
    } else if (this.label.length > 25) {
      return 'option-link option-long';
    } else {
      return '';
    }
  }
})
