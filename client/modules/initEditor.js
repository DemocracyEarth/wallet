let placeCaretAtEnd = (el) => {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

let startEditor = () => {

  var titleContent = document.getElementById('titleContent');
  var editor = document.getElementById('editor');

  //Place caret in right place
  if (Session.get('contract').stage == 'DRAFT') {
    titleContent.focus();
    placeCaretAtEnd(titleContent);
  }

  //Keyword based URL
  Session.set('contractKeyword', Session.get('contract').keyword);

}

Modules.client.initEditor = startEditor;
