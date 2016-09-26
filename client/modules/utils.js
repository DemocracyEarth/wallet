import {default as Modules} from "./_modules";

/*****
/* @param {string} text - string to format
******/
let textFormat = (text) => {
  var html = new String();
  var bold = /\*(\S(.*?\S)?)\*/gm;

  if (text != undefined) {
    html = text.replace(bold, '<b>$1</b>');
    html = urlify(html);
    return html.replace(/\n/g, "<br />");
  }

}

let urlify = (text) => {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank">' + url.replace(/^https?:\/\//,'') + '</a>';
    })
}

let stripHTML = (html) => {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/******
* updates the dynamic tags from the description of a delegation
* @param {string} text - text to verify
* @param {boolean} isContract - if this is specific to a contract visualization context
* @return {string} checkedText - modified text
*****/
let _delegationTextCheck = (text, isContract) => {
  var checkedText = new String(text);
  var htmlTagOpen = new String ("<a href='#'");
  var htmlTagClose = new String ("</a>");
  var username = new Object();
  var profile = new Object();
  if (isContract) {
    switch (Session.get('contract').kind) {
      case KIND_DELEGATION:
        var signatures = Session.get('contract').signatures;
        if (signatures.length > 0) {
          for (i in signatures) {
            profile[signatures[i].role] = Modules.both.getProfileFromUsername(signatures[i].username);
            username[signatures[i].role] = signatures[i].username;
          }
        }
        if (profile != undefined) {
          checkedText = checkedText.replace('<delegator>', "<a href='/peer/" + username[ROLE_DELEGATOR] + "'>" + _getProfileName(profile[ROLE_DELEGATOR]) + htmlTagClose);
          checkedText = checkedText.replace('<delegate>', "<a href='/peer/" + username[ROLE_DELEGATE] + "'>" + _getProfileName(profile[ROLE_DELEGATE]) + htmlTagClose);
          checkedText = checkedText.replace('<votes>', Session.get('newVote').allocateQuantity);
        }
        break;
    }
  } else {
    //TODO simple verification
  }
  return checkedText;
}


/******
* full name of a given user profile
* @param {object} profile - user profile
* @return {string} fullName - full name
*****/
let _getProfileName = (profile) => {
  fullName = new String();
  if (profile.firstName != undefined) {
    fullName = profile.firstName;
  }
  if (profile.lastName != undefined) {
    fullName += ' ' + profile.lastName;
  }
  return fullName;
};

Modules.client.getProfileName = _getProfileName;
Modules.client.delegationTextCheck = _delegationTextCheck;
Modules.client.stripHTMLfromText = stripHTML;
Modules.client.textFormat = textFormat;
