import { voteEmailWhitelist } from '/lib/private/voteEmailWhitelist';

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
  if (voteEmailWhitelist.indexOf(email) === -1) {
    return false;
  }
  return true;
};