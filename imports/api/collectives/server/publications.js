import { Meteor } from 'meteor/meteor';

import {default as Collectives } from '../Collectives';

Meteor.publish("collectives", function () {
    return Collectives.find();
});
