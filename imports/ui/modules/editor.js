import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { placeCaretAtStart, placeCaretAtEnd } from '../../startup/both/modules/utils';
import { verifyDraftFork } from './ballot';

const startEditor = () => {
  var titleContent = document.getElementById('titleContent');
  var editor = document.getElementById('editor');

  if (Session.get('contract')) {
    //Place caret in right place
    if (Session.get('contract').stage === 'DRAFT') {
      titleContent.focus();
      Session.set('userSigned', false);
      Session.set('dbContractBallot', undefined);
      Session.set('emptyBallot', false);
      verifyDraftFork(Session.get('contract').ballot);

      //Empty new document
      if (Session.get('contract').title == '') {
        titleContent.innerHTML = TAPi18n.__('no-title');
        Session.set('missingTitle', true);
        Session.set('firstEditorLoad', true);
        Session.set('disableActionButton', true);
        placeCaretAtStart(titleContent);

      //Open existing document
      } else {
        Session.set('firstEditorLoad', false);
        placeCaretAtEnd(titleContent);
      }

    }
    //Keyword based URL
    Session.set('contractKeyword', Session.get('contract').keyword);
  }
};

export const initEditor = startEditor;
