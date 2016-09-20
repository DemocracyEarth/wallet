let positionCaret = (atStart) => {
  return function(el) {
      el.focus();
      if (typeof window.getSelection != "undefined"
              && typeof document.createRange != "undefined") {
          var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(atStart);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
          var textRange = document.body.createTextRange();
          textRange.moveToElementText(el);
          textRange.collapse(atStart);
          textRange.select();
      }
  };
}

let getName = (firstName, lastName) => {

  var completeName = firstName + ' ' + lastName;
  if (completeName.length > MAX_PROFILE_NAME_LENGTH) {
    completeName = completeName.slice(0, parseInt(0 + (MAX_PROFILE_NAME_LENGTH - completeName.length))) + '...';
  }
  return completeName;

}

Modules.both.showFullName = getName;
Modules.both.placeCaret = positionCaret;
Modules.both.placeCaretAtStart = positionCaret(true);
Modules.both.placeCaretAtEnd = positionCaret(false);
