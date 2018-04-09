import { Meteor } from 'meteor/meteor';
import initReactFastclick from 'react-fastclick';

initReactFastclick();

Meteor.subscribe('tags');
Meteor.subscribe('collectives');

console.log('where the hell is this');
