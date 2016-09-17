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


let getName = (firstName, lastName) => {

  var completeName = firstName + ' ' + lastName;
  if (completeName.length > MAX_PROFILE_NAME_LENGTH) {
    completeName = completeName.slice(0, parseInt(0 + (MAX_PROFILE_NAME_LENGTH - completeName.length))) + '...';
  }
  return completeName;

}


let stripHTML = (html) => {

  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";

}

Modules.client.stripHTMLfromText = stripHTML;
Modules.client.showFullName = getName;
Modules.client.textFormat = textFormat;
