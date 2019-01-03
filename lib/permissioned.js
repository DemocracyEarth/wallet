import { emailList } from '/lib/private/emailList';
import { commentsPermissionList } from '/lib/private/commentsPermissionList';

const domain = 'test.com';

export const emailDomainCheck = function emailDomainCheck(email) {
  const parts = email.split('@');
  if (parts.length === 2) {
    if (parts[1] === domain) {
      return true;
    }
  }
  return false;
};

export const emailListCheck = function emailListCheck(email) {
  if (emailList.indexOf(email) === -1) {
    return false;
  }
  return true;
};

export const commentsPermissionCheck = function commentsPermissionCheck(email, bstackAppId) {
  const checkValue = commentsPermissionList.find(i => (i.email === email) && (i.blockstackAppId === bstackAppId));
  if (checkValue === undefined) {
    return false;
  }
  return true;
};

export const canUserComment = function canUserComment(email, blockstackAppId) {
  return emailListCheck(email) || commentsPermissionCheck(email, blockstackAppId);
};
