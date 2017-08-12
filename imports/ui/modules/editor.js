import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { placeCaretAtStart, placeCaretAtEnd } from '../../startup/both/modules/utils';
import { verifyDraftFork } from './ballot';

const startEditor = () => {
  const ideaTitle = document.getElementById('ideaTitle');
  const editor = document.getElementById('editor');

  if (Session.get('contract')) {
    //Place caret in right place
    if (Session.get('contract').stage === 'DRAFT') {
      ideaTitle.focus();
      Session.set('userSigned', false);
      Session.set('dbContractBallot', undefined);
      Session.set('emptyBallot', false);
      verifyDraftFork(Session.get('contract').ballot);

      //Empty new document
      if (Session.get('contract').title == '') {
        ideaTitle.innerHTML = TAPi18n.__('no-title');
        Session.set('missingTitle', true);
        Session.set('firstEditorLoad', true);
        Session.set('disableActionButton', true);
        placeCaretAtStart(ideaTitle);

      //Open existing document
      } else {
        Session.set('firstEditorLoad', false);
        placeCaretAtEnd(ideaTitle);
      }

    }
    //Keyword based URL
    Session.set('contractKeyword', Session.get('contract').keyword);
  }
};

export const initEditor = startEditor;
