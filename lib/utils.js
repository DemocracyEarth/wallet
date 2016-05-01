//Global Methods
//Returns current app language
getUserLanguage = function () {
  // Put here the logic for determining the user language
  return $LANGUAGE;
};

//Decides if it should hide or not a DOM element
displayElement = function (sessionVar) {
  if (Session.get(sessionVar)) {
    return '';
  } else {
    return 'display:none';
  }
}

//Displays a warning for a limited period.
displayTimedWarning = function (warning, val) {
  if (val == undefined || val == null) {
    val = false;
  };
  if (Session.get(warning)) {
    Meteor.setTimeout(function () {Session.set(warning, val)}, WARNING_DURATION);
  }
  return Session.get(warning);
}

//Contract constructor.
contract = function (title, description, tags) {
  this.title = title;
  this.description = description;
  this.tags = tags;
}

//converts a String to slug-like-text.
convertToSlug = function (text) {
  if (text != undefined) {
    return text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
        ;
  }
}

//verifies the existence of duplicates in array list
checkDuplicate = function (arr, elementId) {
  for (var i = 0; i < arr.length; i++ ) {
    if (arr[i]._id == elementId ) {
      return true;
    }
  }
  return false;
}

//removes any HTML from a string
strip = function (html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

//for contenteditable with reactivity, remind of the caret position
getCaretPosition = function (element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

setCaretPosition = function (elemId, caretPos) {
  var elem = document.getElementById(elemId);

  if(elem != null) {
    if(elem.createTextRange) {
      var range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    }
    else {
      if(elem.selectionStart) {
        elem.focus();
        elem.setSelectionRange(caretPos, caretPos);
      }
      else
        elem.focus();
    }
  }
}
