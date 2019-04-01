import { voteEmailWhitelist } from '/lib/private/voteEmailWhitelist';

const domain = 'test.com';

function _emailDomainCheck(email) {
  const parts = email.split('@');
  if (parts.length === 2) {
    if (parts[1] === domain) {
      return true;
    }
  }
  return false;
}

function _emailListCheck(email) {
  if (voteEmailWhitelist.indexOf(email) === -1) {
    return false;
  }
  return true;
}

export const emailListCheck = _emailListCheck;
export const emailDomainCheck = _emailDomainCheck;
