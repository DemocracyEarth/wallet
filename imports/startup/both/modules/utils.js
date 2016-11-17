import { rules } from '/lib/const';

const positionCaret = (atStart) => {
  return function(el) {
    el.focus();
    if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(atStart);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange !== 'undefined') {
      const textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(atStart);
      textRange.select();
    }
  };
};

const getName = (firstName, lastName, username) => {
  if (username === undefined) {
    username = '';
  }
  if (firstName == undefined) { firstName = username};
  if (lastName == undefined) { lastName = '' };

  var completeName = firstName + ' ' + lastName;
  if (completeName.length > rules.MAX_PROFILE_NAME_LENGTH) {
    completeName = completeName.slice(0, parseInt(0 + (rules.MAX_PROFILE_NAME_LENGTH - completeName.length))) + '...';
  }
  return completeName;
};

export const showFullName = getName;
export const placeCaret = positionCaret;
export const placeCaretAtStart = positionCaret(true);
export const placeCaretAtEnd = positionCaret(false);
