const domain = "test.com";
const emailList = [
    "t1@test.com",
    "t2@test.com",
    "t3@test.com",
    "t4@test.com",
    "t5@test.com",
    "t2@accept.com",
    "t3@demo.com",
    "gilfoyle@piedpiper.com",
];

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