import { Meteor } from 'meteor/meteor';
import { getTemplate } from '/imports/ui/templates/layout/templater';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';

// default web token
const _tokenWeb = {
  coin: [
    {
      code: 'WEB VOTE',
      format: '0,0.00',
      emoji: '',
      unicode: '',
      name: 'Web based votes',
      decimals: 0,
      maxSupply: 0,
      supply: 0,
      subsidy: 1000,
      color: '#5a0074',
      title: 'Web based tokens with no crypto-economic value.',
      type: 'WEB',
      blockchain: 'ETHEREUM',
      contractAddress: '',
      defaultVote: '1',
      editor: {
        allowQuadraticToggle: true,
        allowBlockchainAddress: false,
      },
    },
  ],
};

/**
* @summary gets the JSON of tokens according to a template
*/
const _getTokenJSON = async () => {
  const template = await getTemplate().then((resolved) => {
    return new Promise((res) => {
      HTTP.get(Meteor.absoluteUrl(resolved.lib.token), function (err, result) {
        if (!err) {
          res(result.data);
        }
      });
    });
  });
  return template;
};

/**
* @summary promise that gets the template configured on settings.json
*/
const _getTokens = async () => {
  return await _getTokenJSON().then((res) => {
    if (res) {
      Session.set('token', res);
      Session.set('filteredCoins', res.coin);
    }
  });
};

let _token = async () => { console.log('gettokens'); return await _getTokens(); };

if (Meteor.isClient) {
  if (Session.get('token') && Session.get('token').coin) {
    console.log('doing token');
    _token = Session.get('token');
  } else {
    _token();
  }

  // web-based tokens
  if (_token.coin && Meteor.settings.public.app.config.allowWebVotes) {
    _token.coin = _token.coin.concat(_tokenWeb.coin);
  }
} else if (Meteor.isServer) {
  const serverTokenJSON = 'lib/token.json';
  _token = JSON.parse(Assets.getText(serverTokenJSON));
}

export const token = _token;
