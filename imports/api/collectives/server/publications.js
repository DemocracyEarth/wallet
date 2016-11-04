import { Meteor } from 'meteor/meteor';

import Collectives from '../Collectives';

Meteor.publish('collectives', () =>
  Collectives.find()
);
