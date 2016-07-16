import {default as Modules} from "./_modules";

let stripHTML = (html) => {

  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";

}

Modules.client.stripHTMLfromText = stripHTML;
