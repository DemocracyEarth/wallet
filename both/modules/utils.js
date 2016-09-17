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

Modules.both.placeCaret = positionCaret;
Modules.both.placeCaretAtStart = positionCaret(true);
Modules.both.placeCaretAtEnd = positionCaret(false);
