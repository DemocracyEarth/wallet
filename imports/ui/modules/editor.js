import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { placeCaretAtStart, placeCaretAtEnd } from '../../startup/both/modules/utils';
import { verifyDraftFork } from './ballot';

const startEditor = () => {
  const titleContent = document.getElementById('titleContent');

  if (Session.get('contract')) {
    // place caret in right place
    if (Session.get('contract').stage === 'DRAFT') {
      titleContent.focus();
      // Session.set('userSigned', false); NOTE: by default editor will include logged user signature.
      Session.set('dbContractBallot', undefined);
      Session.set('emptyBallot', false);
      verifyDraftFork(Session.get('contract').ballot);

      // empty new document
      if (Session.get('contract').title === '') {
        if (!Meteor.Device.isPhone()) {
          titleContent.innerHTML = TAPi18n.__('no-title');
        }
        Session.set('missingTitle', true);
        Session.set('firstEditorLoad', true);
        Session.set('disableActionButton', true);
        placeCaretAtStart(titleContent);

      // open existing document
      } else {
        Session.set('firstEditorLoad', false);
        placeCaretAtEnd(titleContent);
      }
    }
    // keyword based URL
    Session.set('contractKeyword', Session.get('contract').keyword);
  }
};

export const initEditor = startEditor;
