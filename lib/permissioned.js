import { voteEmailWhitelist } from '/lib/private/voteEmailWhitelist';
import { replyEmailWhitelist } from '/lib/private/replyEmailWhitelist';

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

function _repliesPermissionCheck(email, ballotId) {
  const checkValue = replyEmailWhitelist.find(i => (i.email === email) && (i.ballotId === ballotId));
  if (checkValue === undefined) {
    return false;
  }
  return true;
}

function _canUserReply(email, ballotId) {
  return _emailListCheck(email) || _repliesPermissionCheck(email, ballotId);
}

export const emailListCheck = _emailListCheck;
export const emailDomainCheck = _emailDomainCheck;
export const repliesPermissionCheck = _repliesPermissionCheck;
export const canUserReply = _canUserReply;
