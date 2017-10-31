import { Meteor } from 'meteor/meteor';
import { Files } from '/imports/api/files/Files';
import { Slingshot } from 'meteor/edgee:slingshot';

Slingshot.fileRestrictions('uploadToAmazonS3', {
  allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif'],
  maxSize: 10 * 1024 * 1024,
});

Slingshot.createDirective('uploadToAmazonS3', Slingshot.S3Storage, {
  bucket: Meteor.settings.private.API.amazon.AWSBucket,
  acl: Meteor.settings.private.API.amazon.AWSAcl,
  region: Meteor.settings.private.API.amazon.AWSRegion,
  authorize() {
    const userFileCount = Files.find({ userId: this.userId }).count();
    return userFileCount < 10 ? true : false;
  },
  key(file) {
    const user = Meteor.users.findOne(this.userId);
    return `${user.username}/${file.name}`;
  },
});
