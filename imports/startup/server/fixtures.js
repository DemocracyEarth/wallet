/*

_____                                                   ______           _   _
|  __ \                                                 |  ____|         | | | |
| |  | | ___ _ __ ___   ___   ___ _ __ __ _  ___ _   _  | |__   __ _ _ __| |_| |__
| |  | |/ _ \ '_ ` _ \ / _ \ / __| '__/ _` |/ __| | | | |  __| / _` | '__| __| '_ \
| |__| |  __/ | | | | | (_) | (__| | | (_| | (__| |_| |_| |___| (_| | |  | |_| | | |
|_____/ \___|_| |_| |_|\___/ \___|_|  \__,_|\___|\__, (_)______\__,_|_|   \__|_| |_/
                                                  __/ |
                                                 |___/

"You never change things by fighting the existing reality. To change something
build a new model that makes the existing model obsolete."
Buckminster Fuller, Great San Francisco Architect.

A Roma, <3

*/

import { Meteor } from 'meteor/meteor';

Meteor.startup(function () {
  //App Cache
  //
  /* appcache issue with browser test: infinite loop
  console.log('[startup] app cache: ' + Meteor.settings.public.app.config.appCache)
  Meteor.AppCache.config({
    chrome: Meteor.settings.public.app.config.appCache,
    firefox: Meteor.settings.public.app.config.appCache,
    safari: Meteor.settings.public.app.config.appCache
  });
  */  
});