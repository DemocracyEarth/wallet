import { Meteor } from 'meteor/meteor';
import initReactFastclick from 'react-fastclick';

initReactFastclick();

Meteor.subscribe('tags');
Meteor.subscribe('collectives', { view: 'daoList' });
