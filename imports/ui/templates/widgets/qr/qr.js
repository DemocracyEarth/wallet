
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/widgets/qr/qr.html';

const QRCode = require('qrcode');

Template.qr.onRendered(function () {
  const canvas = document.getElementById('canvas-qr');

  QRCode.toCanvas(canvas, this.data.code, function (error) {
    if (error) console.error(error);
  });
});

const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

Template.qr.events({
  'click #qr-code'(event, instance) {
    copyToClipboard(instance.data.code);
    alert(TAPi18n.__('copied-to-clipboard'));
  },
});
