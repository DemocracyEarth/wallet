import { voteEmailWhitelist } from '/lib/private/voteEmailWhitelist';
import { replyEmailWhitelist } from '/lib/private/replyEmailWhitelist';

const domain = 'test.com';

/**
* @summary checks if the domain is part of the email
* @param {string} email
* @return {bool} whether domain is part of the email
*/
function _emailDomainCheck(email) {
  const parts = email.split('@');
  if (parts.length === 2) {
    if (parts[1] === domain) {
      return true;
    }
  }
  return false;
}

/**
* @summary checks if the email given exists in voteEmailWhiteList
* @param {string} email
* @return {bool} whether email exists in whitelist
*/
function _emailListCheck(email) {
  if (voteEmailWhitelist.indexOf(email) === -1) {
    return false;
  }
  return true;
}

/**
* @summary checks if the email and the ballotId exist in replyEmailWhiteList
* @param {string} email
* @param {string} ballotId
* @return {bool} whether email and the ballotId exist in replyEmailWhiteList
*/
function _repliesPermissionCheck(email, ballotId) {
  const checkValue = replyEmailWhitelist.find(i => (i.email === email) && (i.ballotId === ballotId));
  if (checkValue === undefined) {
    return false;
  }
  return true;
}

/**
* @summary checks if the user associated with the email is allowed to reply in ballot.
* For a user to be allowed to replied under whitelist model, she needs to be part of either
* replyEmailWhitelist or voteEmailWhitelist
* @param {string} email
* @param {string} ballotId - the id of the ballot in question
* @return {bool} whether the user is allowed to replied
*/
function _canUserReply(email, ballotId) {
  return _emailListCheck(email) || _repliesPermissionCheck(email, ballotId);
}

export const emailListCheck = _emailListCheck;
export const emailDomainCheck = _emailDomainCheck;
export const repliesPermissionCheck = _repliesPermissionCheck;
export const canUserReply = _canUserReply;
