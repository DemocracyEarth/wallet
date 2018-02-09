import { Meteor } from 'meteor/meteor';
import { FastRender } from 'meteor/staringatlights:fast-render';

import { gui } from '/lib/const';

if (Meteor.isServer) {
  FastRender.route('/', function (params) {
    console.log('RENDERRRRRR');
    console.log(params);
    this.subscribe('feed', { view: 'latest', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0 });
  });
}
