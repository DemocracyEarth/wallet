import {default as Modules} from "./_modules";

let startEditor = () => {

  var titleContent = document.getElementById('titleContent');
  var editor = document.getElementById('editor');

  if (Session.get('contract')) {
    //Place caret in right place
    if (Session.get('contract').stage == STAGE_DRAFT) {

      titleContent.focus();
      Session.set('userSigned', false);
      Session.set('dbContractBallot', undefined);
      Session.set('emptyBallot', false);
      Modules.client.verifyDraftFork(Session.get('contract').ballot);

      //Empty new document
      if (Session.get('contract').title == '') {
        titleContent.innerHTML = TAPi18n.__('no-title');
        Session.set('missingTitle', true);
        Session.set('firstEditorLoad', true);
        Session.set('disableActionButton', true);
        Modules.both.placeCaretAtStart(titleContent);

      //Open existing document
      } else {
        Session.set('firstEditorLoad', false);
        Modules.both.placeCaretAtEnd(titleContent);
      }

    }
    //Keyword based URL
    Session.set('contractKeyword', Session.get('contract').keyword);
  }

}

Modules.client.initEditor = startEditor;
