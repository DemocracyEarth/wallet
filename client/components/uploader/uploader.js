Template.uploader.events({
  'change input[type="file"]' ( event, template ) {
    Modules.client.uploadToAmazonS3( { event: event, template: template } );
  }
});
