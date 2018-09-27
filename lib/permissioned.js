import { emailList } from '/lib/private/emailList'

const domain = "test.com";

export const emailDomainCheck = function emailDomainCheck(email) {
    var parts = email.split('@');
    if (parts.length === 2) {
        if (parts[1] === domain) {
            return true;
        }
    }
    return false;
}

export const emailListCheck = function emailListCheck(email) { 
  if (emailList.indexOf(email) == -1) {
    return false;
  }
  return true;
}