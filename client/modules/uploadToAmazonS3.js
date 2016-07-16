import {default as Modules} from "./_modules";

let template;

let _getFileFromInput = ( event ) => event.target.files[0];

let _setPlaceholderText = ( string = TAPi18n.__('upload-picture') ) => {
  template.find( ".uploader-button" ).innerText = string;
};

let _addUrlToDatabase = ( url ) => {
  Meteor.call( "storeUrlInDatabase", url, ( error ) => {
    if ( error ) {
      Modules.client.displayNotice(error.reason, true);

      _setPlaceholderText();
    } else {
      //Success
      var data = Meteor.user().profile;
      Modules.client.displayNotice(TAPi18n.__('new-profile-pic'), true);
      _setPlaceholderText();
      data.picture = url;
      Meteor.users.update(Meteor.userId(), { $set: { profile : data }})
    }
  });
};


let _uploadFileToAmazon = ( file ) => {
  const uploader = new Slingshot.Upload( "uploadToAmazonS3" );

  uploader.send( file, ( error, url ) => {
    if ( error ) {
      Modules.client.displayNotice(error.message, true);

      _setPlaceholderText();
    } else {
      _addUrlToDatabase( url );
    }
  });
};

let upload = ( options ) => {
  template = options.template;
  let file = _getFileFromInput( options.event );

  _setPlaceholderText( TAPi18n.__('uploading'));
  _uploadFileToAmazon( file );
};

Modules.client.uploadToAmazonS3 = upload;
