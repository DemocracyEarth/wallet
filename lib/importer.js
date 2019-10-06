
import { Meteor } from 'meteor/meteor';
import { Papa } from 'meteor/harrison:papa-parse';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';
import { Transactions } from '/imports/api/transactions/Transactions';
import { contractURI } from '/imports/startup/both/modules/Contract';
import { BigNumber } from 'bignumber.js';

const ACTIVATE_IMPORT = false;

if (ACTIVATE_IMPORT) {
  const collectiveInfo = Collectives.findOne({ domain: Meteor.settings.public.Collective.domain });
  const _addContracts = (contracts, collection) => {
    if (contracts.length > 0) {
      for (let i = 0; i < contracts.length; i += 1) {
        console.log(`this has: contracts.collectiveId ${contracts.collectiveId}`);
        if (!contracts[i].collectiveId || contracts[i].collectiveId === '') {
          console.log(`updating contract: ${contracts[i]._id}`);
          console.log(`this is from ${collection}`);
          console.log(collectiveInfo._id);
          switch (collection) {
            case 'transactions':
              Transactions.update({ _id: contracts[i]._id }, { $set: { collectiveId: collectiveInfo._id } });
              break;
            case 'contracts':
            default:
              Contracts.update({ _id: contracts[i]._id }, { $set: { collectiveId: collectiveInfo._id } });
          }
        } else {
          console.log(`has collective: ${contracts[i]._id}`);
        }
      }
    }
  };

  if (collectiveInfo) {
    console.log(`collective info found: ${collectiveInfo._id} & ${collectiveInfo.domain}`);

    console.log('checking Contracts....');
    _addContracts(Contracts.find().fetch(), 'contracts');

    console.log('checking Transactions....');
    _addContracts(Transactions.find().fetch(), 'transactions');
  }
}

/*
*** have as author the admin super user
// const AUTHOR_ID = 'wf6z5DcaXmZJ4JWuX';

const AUTHOR_ID = 'wf6z5DcaXmZJ4JWuX';

const allContracts = Contracts.find().fetch();

let signatures = [];
for (let q = 0; q < allContracts.length; q += 1) {
  if (allContracts[q].signatures[0] && allContracts[q].signatures[0]._id === 'decentraland-super-user') {
    signatures = [{
      _id: AUTHOR_ID,
      role: 'AUTHOR',
      username: 'decentraland',
      status: 'CONFIRMED',
    }];
  }
  console.log('----');
  console.log(signatures);
  Contracts.update({ _id: allContracts[q]._id }, { $set: { signatures } });
}
*/

/*
*** add proper vote count to each onctract
***
const allContracts = Contracts.find().fetch();

let tally = [];
let tickets = [];
let hashes = [];
let userInfo;
for (let q = 0; q < allContracts.length; q += 1) {
  tickets = allContracts[q].blockchain.tickets;
  hashes = _.pluck(tickets, 'hash');
  for (let r = 0; r < hashes.length; r += 1) {
    tally.push(
      {
        _id: hashes[r],
      },
    );

    userInfo = Meteor.users.findOne({ _id: hashes[r] });
    if (userInfo) {
      for (let s = 0; s < tickets.length; s += 1) {
        if (tickets[s].hash === hashes[r]) {
          tickets[s].hash = userInfo.profile.wallet.reserves[0].publicAddress;
        }
      }
    }
  }

  if (allContracts[q]._id === 'C65zQLgnQP28YPoy4') {
    console.log('hashes:');
    console.log(hashes);
    console.log('tally');
    console.log(tally);
    console.log('tickets:');
    console.log(tickets);
  }

  console.log('update contract tally..');
  Contracts.update({ _id: allContracts[q]._id }, { $set: { 'tally.voter': tally } });

  console.log('update public address hash..');
  Contracts.update({ _id: allContracts[q]._id }, { $set: { 'blockchain.tickets': tickets } });
  tally = [];
  tickets = [];
  hashes = [];
}
*/

/*
*** Import database from decentraland CSV dataset.
***
// Harcoded data;
const USERNAME = 'decentraland';
const AUTHOR_ID = 'wf6z5DcaXmZJ4JWuX';
const FORCE_CHECK = false;
const CURRENT_BLOCK = 8111646;
const BLOCK_TIME = 14.5;

const _getURLDate = (draft) => {
  const time = draft.createdAt;
  return `/${time.getFullYear()}/${parseInt(time.getMonth() + 1, 10)}/${time.getDate()}/`;
};

const _addDecimal = (value, decimals) => {
  const decimalsBN = new BigNumber(decimals);
  const valueBN = new BigNumber(value);
  const multiplier = new BigNumber(10).pow(decimalsBN);
  const withDecimals = valueBN.multipliedBy(multiplier);

  return withDecimals;
};

const _removeDecimal = (value, decimals) => {
  const decimalsBN = new BigNumber(decimals);
  const valueBN = new BigNumber(value);
  const divisor = new BigNumber(10).pow(decimalsBN);
  const beforeDecimal = valueBN.div(divisor);

  return beforeDecimal;
};


const _getBlockTime = (calendar) => {
  const now = new Date();
  const postHeight = parseInt(CURRENT_BLOCK - (((now.getTime() / 1000) - (calendar.getTime() / 1000)) / BLOCK_TIME), 10);
  return postHeight;
};

const _getReceipt = (voteId) => {
  const receipts = Assets.getText('legacy/receipts.csv');
  const receiptsRow = Papa.parse(receipts).data;
  let receipt;
  for (let i = 0; i < receiptsRow.length; i += 1) {
    receipt = receiptsRow[i];
    if (receipt[7] === voteId) {
      return receipt;
    }
  }
};

const _getPoll = (vote, post) => {
  // finds a vote for this post
  if (vote.length > 1 && (vote[3] === post[0])) {
    // completes found vote with receipt data
    const receipt = _getReceipt(vote[0]);
    return {
      receipt_id: receipt[0],
      receipt_server_signature: receipt[1],
      receipt_server_message: receipt[2],
      receipt_account_message: receipt[3],
      receipt_account_signature: receipt[4],
      receipt_account_address: receipt[5],
      receipt_option_value: receipt[6],
      receipt_vote_id: receipt[7],
      receipt_nonce: receipt[8],
      receipt_created_at: receipt[9],
      receipt_updated_at: receipt[10],
      vote_id: vote[0],
      vote_account_address: vote[1],
      vote_account_balance: vote[2],
      vote_poll_id: vote[3],
      vote_option_id: vote[4],
      vote_message: vote[5],
      vote_signature: vote[6],
      vote_created_at: vote[7],
      vote_updated_at: vote[8],
      vote_timestamp: vote[9],
    };
  }
};

const _reduceSHA = (text) => {
  let final = text;
  if (text.search('sha256') >= 0) {
    final = `${text.replace('sha256: **', 'sha256: **##')}##`;
  }
  return final;
};

// returns the contract object type required
const _getContractObject = (title, keyword, url, date, publicAddress, height, calendar, importId, pollChoiceId, pollId) => {
  return {
    stage: 'LIVE',
    title,
    keyword,
    url,
    createdAt: date,
    lastUpdate: date,
    timestamp: date,
    ballotEnabled: false,
    // replyId: '',
    // geo: draft.geo,
    // ballot: draft.ballot,
    constituencyEnabled: false,
    constituency: [
      {
        kind: 'TOKEN',
        code: 'MANA',
        check: 'EQUAL',
      },
    ],
    wallet: {
      balance: 0,
      placed: 0,
      available: 0,
      currency: 'MANA',
      address: [],
      ledger: [],
    },
    blockchain: {
      publicAddress,
      tickets: [],
      score: {
        totalConfirmed: '0',
        totalPending: '0',
        totalFail: '0',
        finalConfirmed: 0,
        finalPending: 0,
        finalFail: 0,
        value: 0,
      },
      coin: {
        code: 'MANA',
      },
      votePrice: '0.1',
    },
    rules: {
      alwaysOn: false,
      quadraticVoting: false,
      balanceVoting: true,
      pollVoting: true,
    },
    poll: [],
    closing: {
      blockchain: 'ETH',
      height,
      calendar,
      delta: 42000,
    },
    importId,
    signatures: [
      {
        _id: AUTHOR_ID,
        role: 'AUTHOR',
        username: USERNAME,
        status: 'CONFIRMED',
      },
    ],
    pollChoiceId,
    pollId,
  };
};

// adds a contract
const _addContract = (post, districtPollParentId) => {
  let contractObject;
  console.log('checking new contract to add...');

  if (post && post.length > 1) {
    const draft = {
      createdAt: new Date(post[7]),
    };
    const keyword = contractURI(post[1]);
    const url = `${_getURLDate(draft)}${keyword}`;

    if (post) {
      console.log('post to be added:');
      console.log(post);

      const contract = Contracts.findOne({ importId: post[0] });

      if (!contract || !FORCE_CHECK) {
        console.log(`contract ${post[0]} being inserted.... `);

        const votes = Assets.getText('legacy/votes.csv');
        const votesRow = Papa.parse(votes).data;

        // show the first row
        console.log(votesRow[0]);
        const pollVotes = [];
        let pollData;
        for (let i = 1; i < votesRow.length; i += 1) {
          if (votesRow[i]) {
            pollData = _getPoll(votesRow[i], post);
            if (pollData) {
              pollVotes.push(pollData);
            }
          }
        }
        console.log(`---array---`);
        console.log(pollVotes[0]);
        console.log(pollVotes.length);
        console.log(`---end of array---`);

        const choices = _.uniq(_.pluck(pollVotes, 'receipt_option_value'));
        console.log('---DA CHOICES---');
        console.log(choices);

        contractObject = _getContractObject(`**${post[1]}**\n\n${_reduceSHA(post[2])}\n\n`, keyword, url, post[7], post[5], _getBlockTime(new Date(parseInt(post[6], 10))), post[6], post[0]);

        if (post[1].substring(0, 19) === 'Proposal Acceptance') {
          contractObject.replyId = districtPollParentId;
        }

        // is a main post
        const newContract = Contracts.insert(contractObject);

        // add poll choices to contract
        const choiceContract = [];
        let choiceKeyword;
        for (let k = 0; k < choices.length; k += 1) {
          choiceKeyword = `poll-choice-${parseInt(k + 1, 0)}-${contractURI(choices[k])}`;
          contractObject = _getContractObject(choices[k], choiceKeyword, `${_getURLDate(draft)}${choiceKeyword}`, post[7], post[5], _getBlockTime(new Date(parseInt(post[6], 10))), post[6], `poll-${choiceKeyword}-${post[0]}`, k.toString(), newContract);
          choiceContract.push(Contracts.insert(contractObject));
        }

        // create poll data array
        const finalPoll = [];
        for (let n = 0; n < choiceContract.length; n += 1) {
          finalPoll.push({
            contractId: choiceContract[n],
            totalStaked: '0',
          });
        }
        let yes = 0;
        let no = 0;
        let title;
        if (choices.length === 1) {
          if (choices[0] === 'Yes') {
            yes += 1;
            title = 'No';
            choiceKeyword = `poll-choice-2-${contractURI(title)}`;
            // const _getContractObject = (title, keyword, url, date, publicAddress, height, calendar, importId, pollChoiceId, pollId) => {
            contractObject = _getContractObject(title, choiceKeyword, `${_getURLDate(draft)}${choiceKeyword}`, post[7], post[5], _getBlockTime(new Date(parseInt(post[6], 10))), post[6], `poll-${choiceKeyword}-${post[0]}`, '1', newContract);
            const pollChoiceNo = Contracts.insert(contractObject);
            console.log(`inserterd: ${pollChoiceNo}`);
            finalPoll.push({
              contractId: pollChoiceNo,
              totalStaked: '0',
            });
          } else {
            no += 1;
          }
        }
        console.log(finalPoll);
        console.log(`***************`)
        console.log(`yes: ${yes} and no: ${no}`);
        console.log(`***************`)

        // update original contract
        Contracts.update({ _id: newContract }, { $set: { poll: finalPoll } });
        console.log(`newContract: ${newContract}`);


        // see if user exists
        let voter;
        let voterId;
        for (let m = 0; m < pollVotes.length; m += 1) {
          voter = Meteor.users.findOne({ 'profile.wallet.reserves': { $elemMatch: { publicAddress: pollVotes[m].vote_account_address } } });

          // add new voter
          if (!voter) {
            voterId = Meteor.users.insert({
              username: `${pollVotes[m].vote_account_address.slice(0, 8)}${'-'}${pollVotes[m].vote_account_address.slice(36, 42)}`,
              profile: {
                configured: true,
                menu: [],
                picture: '/images/noprofile.png',
                wallet: {
                  currency: 'WEB VOTE',
                  ledger: [],
                  placed: 0,
                  available: 0,
                  balance: 0,
                  address: [],
                  reserves: [{
                    publicAddress: pollVotes[m].vote_account_address,
                    available: 0,
                    balance: 0,
                    token: 'MANA',
                    placed: 0,
                  }],
                },
              },
              createdAt: pollVotes[m].receipt_created_at,
            });
            console.log('--------------');
            console.log('NEW VOTER');
          } else {
            console.log('--------------');
            console.log('OLD VOTER');
            voterId = voter._id;
          }
          console.log(voter);

          // add vote transaction
          let pollContract;
          let pollContractId;
          for (let j = 0; j < finalPoll.length; j += 1) {
            pollContract = Contracts.findOne({ _id: finalPoll[j].contractId });
            if (pollContract.title === pollVotes[m].receipt_option_value) {
              pollContractId = pollContract._id;
            }
          }

          const bigNumberVotes = _addDecimal(pollVotes[m].vote_account_balance, '18').toString();

          console.log('COMPARE THE NUMBERS-------------------------------------------------?');
          console.log(`${pollVotes[m].vote_account_balance} = ${bigNumberVotes}`);

          const newTransaction = Transactions.insert({
            input: {
              entityId: voterId,
              address: pollVotes[m].vote_account_address,
              entityType: 'INDIVIDUAL',
              quantity: 0,
              currency: 'MANA',
            },
            output: {
              entityId: pollContractId,
              address: pollVotes[m].vote_account_address,
              entityType: 'CONTRACT',
              quantity: 0,
              currency: 'MANA',
            },
            kind: 'CRYPTO',
            contractId: pollContractId,
            timestamp: pollVotes[m].receipt_created_at,
            status: 'CONFIRMED',
            blockchain: {
              tickets: [
                {
                  hash: pollVotes[m].vote_account_address,
                  status: 'CONFIRMED',
                  value: bigNumberVotes,
                },
              ],
              coin: {
                code: 'MANA',
              },
              publicAddress: '',
              score: {
                totalConfirmed: '0',
                totalPending: '0',
                totalFail: '0',
                finalConfirmed: 0,
                finalPending: 0,
                finalFail: 0,
                value: 0,
              },
            },
            condition: {
              transferable: true,
              portable: true,
            },
          });
          console.log(`--------------NEW TRANSACTION ${'hola'}--------`);
          console.log(newTransaction);

          // add vote data to poll choice
          let dataForPollContract;
          let indexFinalPoll;
          for (let o = 0; o < finalPoll.length; o += 1) {
            if (finalPoll[o].contractId === pollContractId) {
              dataForPollContract = finalPoll[o];
              indexFinalPoll = o;
              break;
            }
          }
          if (!dataForPollContract.tickets) {
            dataForPollContract.tickets = [];
          }
          dataForPollContract.tickets.push({
            hash: voterId,
            status: 'CONFIRMED',
            value: bigNumberVotes,
          });
          finalPoll[indexFinalPoll] = dataForPollContract;

          // update Poll Contract
        }

        console.log('UPDATEING POLL CONTRACT WITH THESE TICKETSSS');
        console.log(finalPoll);
        let score;
        for (let p = 0; p < finalPoll.length; p += 1) {
          let ticketsTotalConfirmed = new BigNumber(0);
          let ticketVotes;

          if (finalPoll[p].tickets) {
            for (let q = 0; q < finalPoll[p].tickets.length; q += 1) {
              ticketVotes = new BigNumber(finalPoll[p].tickets[q].value);
              ticketsTotalConfirmed = ticketsTotalConfirmed.plus(ticketVotes);
            }
            score = {
              totalConfirmed: ticketsTotalConfirmed.toFixed(),
              totalPending: 0,
              totalFail: 0,
              finalConfirmed: parseFloat(_removeDecimal(ticketsTotalConfirmed.toString(), 18), 10),
              finalPending: 0,
              finalFail: 0,
              value: parseFloat(_removeDecimal(ticketsTotalConfirmed.toString(), 18), 10),
            };
            Contracts.update({ _id: finalPoll[p].contractId }, { $set: { 'blockchain.tickets': finalPoll[p].tickets } });
            Contracts.update({ _id: finalPoll[p].contractId }, { $set: { 'blockchain.score': score } });
          }
        }
      } else {
        console.log(`contract ${post[0]} already exists! `);
      }
    }
  }
};


if (Meteor.isServer) {
  // read CSV file
  const csv = Assets.getText('legacy/polls.csv');

  // convert the csv to an array of arrays
  const rows = Papa.parse(csv).data;

  // show the first row
  console.log(rows[0]);


  // create district parent post
  const firstItem = rows[1];
  const pseudoDraft = { createdAt: new Date(firstItem[7]) };
  console.log(pseudoDraft);
  const contractObject = _getContractObject('**District Polls**\n\nDisctrict proposals to be implemented on Decentraland\'s metaverse.', contractURI('district polls'), `${_getURLDate(pseudoDraft)}${contractURI('district polls')}`, firstItem[7], '0x131bdccea95a29d8ca04347c87d1a6a5e099ee81', _getBlockTime(new Date(firstItem[7])), new Date(firstItem[7]));
  console.log(contractObject);
  const districtPollParentId = Contracts.insert(contractObject);

  for (let i = 1; i < rows.length; i += 1) {
    _addContract(rows[i], districtPollParentId);
  }
}

/*

{ address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-00:47:00.727(2)?   blockHash: '0x6ff2ee8ce72fc0ea292dbc617855b8baa83a26f930ec7d780b670dff08ae8e63',
I20191004-00:47:00.727(2)?   blockNumber: 8414140,
I20191004-00:47:00.727(2)?   logIndex: 39,
I20191004-00:47:00.727(2)?   removed: false,
I20191004-00:47:00.728(2)?   transactionHash: '0xa48078565f6d6d21146cc1bd2542e3f3eeaa4deb900fb71c98b499a2e8de795e',
I20191004-00:47:00.728(2)?   transactionIndex: 40,
I20191004-00:47:00.728(2)?   id: 'log_0x98340da73e1d9844a3adefde4fe05fc56cbeb3ec4483894e7011fad5da2d542b',
I20191004-00:47:00.728(2)?   returnValues: 
I20191004-00:47:00.728(2)?    { '0': BigNumber { _hex: '0x5f' },
I20191004-00:47:00.728(2)?      '1': '0x72BA1965320ab5352FD6D68235Cc3C5306a6FFA2',
I20191004-00:47:00.728(2)?      '2': '0xcd16CBdA54af2556EBB6df4FBFd178e63c33FD89',
I20191004-00:47:00.728(2)?      '3': '0xcd16CBdA54af2556EBB6df4FBFd178e63c33FD89',
I20191004-00:47:00.728(2)?      '4': BigNumber { _hex: '0x00' },
I20191004-00:47:00.728(2)?      '5': BigNumber { _hex: '0x01' },
I20191004-00:47:00.728(2)?      delegateKey: '0x72BA1965320ab5352FD6D68235Cc3C5306a6FFA2',
I20191004-00:47:00.728(2)?      memberAddress: '0xcd16CBdA54af2556EBB6df4FBFd178e63c33FD89',
I20191004-00:47:00.728(2)?      applicant: '0xcd16CBdA54af2556EBB6df4FBFd178e63c33FD89',
I20191004-00:47:00.728(2)?      proposalIndex: BigNumber { _hex: '0x5f' },
I20191004-00:47:00.729(2)?      tokenTribute: BigNumber { _hex: '0x00' },
I20191004-00:47:00.729(2)?      sharesRequested: BigNumber { _hex: '0x01' } },
I20191004-00:47:00.729(2)?   event: 'SubmitProposal',
I20191004-00:47:00.729(2)?   signature: '0x2d105ebbc222c190059b3979356e13469f6a29a350add74ac3bf4f22f16301d6',
I20191004-00:47:00.729(2)?   raw: 
I20191004-00:47:00.729(2)?    { data: '0x000000000000000000000000000000000000000000000000000000000000005f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
I20191004-00:47:00.729(2)?      topics: 
I20191004-00:47:00.729(2)?       [ '0x2d105ebbc222c190059b3979356e13469f6a29a350add74ac3bf4f22f16301d6',
I20191004-00:47:00.729(2)?         '0x00000000000000000000000072ba1965320ab5352fd6d68235cc3c5306a6ffa2',
I20191004-00:47:00.729(2)?         '0x000000000000000000000000cd16cbda54af2556ebb6df4fbfd178e63c33fd89',
I20191004-00:47:00.730(2)?         '0x000000000000000000000000cd16cbda54af2556ebb6df4fbfd178e63c33fd89' ] } }

{ address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-00:47:00.702(2)?   blockHash: '0xc7360b6ed8c107c16498dc00bacf496bddcebca0b54cc0f24ec23431a503c7ae',
I20191004-00:47:00.702(2)?   blockNumber: 8362243,
I20191004-00:47:00.702(2)?   logIndex: 142,
I20191004-00:47:00.702(2)?   removed: false,
I20191004-00:47:00.702(2)?   transactionHash: '0xd3371e8021035f898adaa1df4bbcadc37e45a030c16338b0e436b4c68a5699ea',
I20191004-00:47:00.702(2)?   transactionIndex: 87,
I20191004-00:47:00.702(2)?   id: 'log_0x53ebba0ca80a950288927020bd8395e7edc195dd0729f3b3a6453b0487c2f5ff',
I20191004-00:47:00.702(2)?   returnValues: 
I20191004-00:47:00.703(2)?    { '0': BigNumber { _hex: '0x5c' },
I20191004-00:47:00.703(2)?      '1': '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-00:47:00.703(2)?      '2': '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-00:47:00.703(2)?      '3': '0x0039F22efB07A647557C7C5d17854CFD6D489eF3',
I20191004-00:47:00.703(2)?      '4': BigNumber { _hex: '0x00' },
I20191004-00:47:00.703(2)?      '5': BigNumber { _hex: '0x84' },
I20191004-00:47:00.703(2)?      delegateKey: '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-00:47:00.703(2)?      memberAddress: '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-00:47:00.703(2)?      applicant: '0x0039F22efB07A647557C7C5d17854CFD6D489eF3',
I20191004-00:47:00.703(2)?      proposalIndex: BigNumber { _hex: '0x5c' },
I20191004-00:47:00.703(2)?      tokenTribute: BigNumber { _hex: '0x00' },
I20191004-00:47:00.703(2)?      sharesRequested: BigNumber { _hex: '0x84' } },
I20191004-00:47:00.703(2)?   event: 'SubmitProposal',
I20191004-00:47:00.703(2)?   signature: '0x2d105ebbc222c190059b3979356e13469f6a29a350add74ac3bf4f22f16301d6',
I20191004-00:47:00.703(2)?   raw: 
I20191004-00:47:00.703(2)?    { data: '0x000000000000000000000000000000000000000000000000000000000000005c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000084',
I20191004-00:47:00.703(2)?      topics: 
I20191004-00:47:00.703(2)?       [ '0x2d105ebbc222c190059b3979356e13469f6a29a350add74ac3bf4f22f16301d6',
I20191004-00:47:00.704(2)?         '0x000000000000000000000000512e07a093aaa20ba288392eadf03838c7a4e522',
I20191004-00:47:00.704(2)?         '0x000000000000000000000000512e07a093aaa20ba288392eadf03838c7a4e522',
I20191004-00:47:00.704(2)?         '0x0000000000000000000000000039f22efb07a647557c7c5d17854cfd6d489ef3' ] } }


{ address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.943(2)?   blockHash: '0xe9b37f4428f5dd7400e318b381189d618047aa75bd55a16a19cb490e798b2653',
I20191004-12:36:41.944(2)?   blockNumber: 8576173,
I20191004-12:36:41.944(2)?   logIndex: 102,
I20191004-12:36:41.944(2)?   removed: false,
I20191004-12:36:41.944(2)?   transactionHash: '0xac6c9ce23064b2b470967b5ad1e77c038f8bd7857fca1b6303c131141639eff3',
I20191004-12:36:41.944(2)?   transactionIndex: 133,
I20191004-12:36:41.944(2)?   id: 'log_0x14c4005919ec12f59aa7e4f891807194e967dd4690a27ed9f483bd5531919c1a',
I20191004-12:36:41.944(2)?   returnValues: 
I20191004-12:36:41.944(2)?    { '0': BigNumber { _hex: '0x64' },
I20191004-12:36:41.944(2)?      '1': '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.944(2)?      '2': '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.944(2)?      '3': '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.944(2)?      '4': BigNumber { _hex: '0x00' },
I20191004-12:36:41.944(2)?      '5': BigNumber { _hex: '0x08' },
I20191004-12:36:41.944(2)?      delegateKey: '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.945(2)?      memberAddress: '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.945(2)?      applicant: '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.945(2)?      proposalIndex: BigNumber { _hex: '0x64' },
I20191004-12:36:41.945(2)?      tokenTribute: BigNumber { _hex: '0x00' },
I20191004-12:36:41.945(2)?      sharesRequested: BigNumber { _hex: '0x08' } },
I20191004-12:36:41.945(2)?   event: 'SubmitProposal',
I20191004-12:36:41.945(2)?   signature: '0x2d105ebbc222c190059b3979356e13469f6a29a350add74ac3bf4f22f16301d6',
I20191004-12:36:41.945(2)?   raw: 
I20191004-12:36:41.945(2)?    { data: '0x000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008',
I20191004-12:36:41.945(2)?      topics: 
I20191004-12:36:41.945(2)?       [ '0x2d105ebbc222c190059b3979356e13469f6a29a350add74ac3bf4f22f16301d6',
I20191004-12:36:41.945(2)?         '0x0000000000000000000000001b037167c4b0584ca5ef6534648c38f496757fa5',
I20191004-12:36:41.945(2)?         '0x0000000000000000000000001a57f99c4759f4e4e29140b1d7a89584e1c1ef67',
I20191004-12:36:41.945(2)?         '0x0000000000000000000000001b037167c4b0584ca5ef6534648c38f496757fa5' ] } }
I20191004-12:36:41.945(2)? SubmitVote
I20191004-12:36:41.945(2)? [web3] Adding a new Contract
I20191004-12:36:41.946(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.946(2)?   blockHash: '0xdeb96be7427865e774df1877cc0d6942bbc9401e8984f6a06bcb4a7a24c36c02',
I20191004-12:36:41.946(2)?   blockNumber: 8582093,
I20191004-12:36:41.946(2)?   logIndex: 176,
I20191004-12:36:41.946(2)?   removed: false,
I20191004-12:36:41.946(2)?   transactionHash: '0x24812572653d37bbd69d926f6efd38131da7b81c025179c6531e16f73ef7f53d',
I20191004-12:36:41.946(2)?   transactionIndex: 226,
I20191004-12:36:41.946(2)?   id: 'log_0x65ae635641ca571bc0d4af11f4e706d7823848055a7bfee55e7976e7969513fe',
I20191004-12:36:41.946(2)?   returnValues: 
I20191004-12:36:41.946(2)?    { '0': BigNumber { _hex: '0x64' },
I20191004-12:36:41.946(2)?      '1': '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.946(2)?      '2': '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.946(2)?      '3': 1,
I20191004-12:36:41.947(2)?      proposalIndex: BigNumber { _hex: '0x64' },
I20191004-12:36:41.947(2)?      delegateKey: '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.947(2)?      memberAddress: '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.947(2)?      uintVote: 1 },
I20191004-12:36:41.947(2)?   event: 'SubmitVote',
I20191004-12:36:41.947(2)?   signature: '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.947(2)?   raw: 
I20191004-12:36:41.947(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000001',
I20191004-12:36:41.947(2)?      topics: 
I20191004-12:36:41.947(2)?       [ '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.947(2)?         '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.947(2)?         '0x0000000000000000000000001b037167c4b0584ca5ef6534648c38f496757fa5',
I20191004-12:36:41.947(2)?         '0x0000000000000000000000001a57f99c4759f4e4e29140b1d7a89584e1c1ef67' ] } }
I20191004-12:36:41.947(2)? ProcessProposal
I20191004-12:36:41.947(2)? [web3] Adding a new Contract
I20191004-12:36:41.948(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.948(2)?   blockHash: '0xd1c5db961d50de604775a119d4f796928445b8fc6c2ad3158394803bd2e4c962',
I20191004-12:36:41.948(2)?   blockNumber: 8588896,
I20191004-12:36:41.948(2)?   logIndex: 80,
I20191004-12:36:41.948(2)?   removed: false,
I20191004-12:36:41.948(2)?   transactionHash: '0x7b9ef49d94ec6baee544d3ecf81fcf581b66e455b711ab988fce4fad8b8abadc',
I20191004-12:36:41.948(2)?   transactionIndex: 12,
I20191004-12:36:41.948(2)?   id: 'log_0x28a0eb7160402938c3da32c91344c32c836f4c2d28a76753e24d5a70014b3f76',
I20191004-12:36:41.948(2)?   returnValues: 
I20191004-12:36:41.948(2)?    { '0': BigNumber { _hex: '0x61' },
I20191004-12:36:41.948(2)?      '1': '0x68085E7f88e90Fa9247489C83fAB30b177Ebccb3',
I20191004-12:36:41.948(2)?      '2': '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.948(2)?      '3': BigNumber { _hex: '0x00' },
I20191004-12:36:41.949(2)?      '4': BigNumber { _hex: '0x11' },
I20191004-12:36:41.949(2)?      '5': true,
I20191004-12:36:41.949(2)?      proposalIndex: BigNumber { _hex: '0x61' },
I20191004-12:36:41.949(2)?      applicant: '0x68085E7f88e90Fa9247489C83fAB30b177Ebccb3',
I20191004-12:36:41.949(2)?      memberAddress: '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.949(2)?      tokenTribute: BigNumber { _hex: '0x00' },
I20191004-12:36:41.956(2)?      sharesRequested: BigNumber { _hex: '0x11' },
I20191004-12:36:41.956(2)?      didPass: true },
I20191004-12:36:41.956(2)?   event: 'ProcessProposal',
I20191004-12:36:41.956(2)?   signature: '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.956(2)?   raw: 
I20191004-12:36:41.956(2)?    { data: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000110000000000000000000000000000000000000000000000000000000000000001',
I20191004-12:36:41.956(2)?      topics: 
I20191004-12:36:41.957(2)?       [ '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.957(2)?         '0x0000000000000000000000000000000000000000000000000000000000000061',
I20191004-12:36:41.957(2)?         '0x00000000000000000000000068085e7f88e90fa9247489c83fab30b177ebccb3',
I20191004-12:36:41.957(2)?         '0x0000000000000000000000001a57f99c4759f4e4e29140b1d7a89584e1c1ef67' ] } }
I20191004-12:36:41.957(2)? ProcessProposal
I20191004-12:36:41.957(2)? [web3] Adding a new Contract
I20191004-12:36:41.957(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.957(2)?   blockHash: '0x0df9dbc949b1e9f3644ee0f43f081542fff9872f2310fce9f6519ccd7afdfe58',
I20191004-12:36:41.957(2)?   blockNumber: 8596560,
I20191004-12:36:41.957(2)?   logIndex: 87,
I20191004-12:36:41.957(2)?   removed: false,
I20191004-12:36:41.957(2)?   transactionHash: '0x7b7dfc176f919dd77d63fac9916239f50367ffceb2c410f32cbe6fb919e57775',
I20191004-12:36:41.957(2)?   transactionIndex: 102,
I20191004-12:36:41.957(2)?   id: 'log_0x5c1a3c1ad756431ac8ba64a6646eca5a8de9783af38d7194b0238feac788b59f',
I20191004-12:36:41.958(2)?   returnValues: 
I20191004-12:36:41.958(2)?    { '0': BigNumber { _hex: '0x62' },
I20191004-12:36:41.958(2)?      '1': '0xBb21e164D37c2d5B89c4b35bd05068D05dd1690E',
I20191004-12:36:41.958(2)?      '2': '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-12:36:41.958(2)?      '3': BigNumber { _hex: '0x00' },
I20191004-12:36:41.958(2)?      '4': BigNumber { _hex: '0xa1' },
I20191004-12:36:41.958(2)?      '5': false,
I20191004-12:36:41.958(2)?      proposalIndex: BigNumber { _hex: '0x62' },
I20191004-12:36:41.958(2)?      applicant: '0xBb21e164D37c2d5B89c4b35bd05068D05dd1690E',
I20191004-12:36:41.958(2)?      memberAddress: '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-12:36:41.958(2)?      tokenTribute: BigNumber { _hex: '0x00' },
I20191004-12:36:41.958(2)?      sharesRequested: BigNumber { _hex: '0xa1' },
I20191004-12:36:41.958(2)?      didPass: false },
I20191004-12:36:41.958(2)?   event: 'ProcessProposal',
I20191004-12:36:41.958(2)?   signature: '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.958(2)?   raw: 
I20191004-12:36:41.958(2)?    { data: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a10000000000000000000000000000000000000000000000000000000000000000',
I20191004-12:36:41.959(2)?      topics: 
I20191004-12:36:41.959(2)?       [ '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.959(2)?         '0x0000000000000000000000000000000000000000000000000000000000000062',
I20191004-12:36:41.959(2)?         '0x000000000000000000000000bb21e164d37c2d5b89c4b35bd05068d05dd1690e',
I20191004-12:36:41.959(2)?         '0x000000000000000000000000512e07a093aaa20ba288392eadf03838c7a4e522' ] } }
I20191004-12:36:41.959(2)? ProcessProposal
I20191004-12:36:41.959(2)? [web3] Adding a new Contract
I20191004-12:36:41.959(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.959(2)?   blockHash: '0xbd7dd6d51ba8c5c1f1c2c894ab1d799269538b6bb8dde2cb7516fc2431aa86d1',
I20191004-12:36:41.959(2)?   blockNumber: 8600409,
I20191004-12:36:41.959(2)?   logIndex: 4,
I20191004-12:36:41.959(2)?   removed: false,
I20191004-12:36:41.959(2)?   transactionHash: '0xb39519d4f1cfadcb482ba27bc9e5263e47a5998248e2dcdb49776f35e41a99a2',
I20191004-12:36:41.959(2)?   transactionIndex: 2,
I20191004-12:36:41.959(2)?   id: 'log_0x92d27927fa76d9a5a504f93328c096ef617dff650e67dba58809f55bb429f53e',
I20191004-12:36:41.959(2)?   returnValues: 
I20191004-12:36:41.960(2)?    { '0': BigNumber { _hex: '0x63' },
I20191004-12:36:41.960(2)?      '1': '0x370Ceca4fC1287ED99924bbA76259F6C771A6022',
I20191004-12:36:41.960(2)?      '2': '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-12:36:41.960(2)?      '3': BigNumber { _hex: '0x0821ab0d4414980000' },
I20191004-12:36:41.960(2)?      '4': BigNumber { _hex: '0x96' },
I20191004-12:36:41.960(2)?      '5': false,
I20191004-12:36:41.960(2)?      proposalIndex: BigNumber { _hex: '0x63' },
I20191004-12:36:41.960(2)?      applicant: '0x370Ceca4fC1287ED99924bbA76259F6C771A6022',
I20191004-12:36:41.960(2)?      memberAddress: '0x512E07A093aAA20Ba288392EaDF03838C7a4e522',
I20191004-12:36:41.960(2)?      tokenTribute: BigNumber { _hex: '0x0821ab0d4414980000' },
I20191004-12:36:41.960(2)?      sharesRequested: BigNumber { _hex: '0x96' },
I20191004-12:36:41.961(2)?      didPass: false },
I20191004-12:36:41.961(2)?   event: 'ProcessProposal',
I20191004-12:36:41.961(2)?   signature: '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.961(2)?   raw: 
I20191004-12:36:41.961(2)?    { data: '0x00000000000000000000000000000000000000000000000821ab0d441498000000000000000000000000000000000000000000000000000000000000000000960000000000000000000000000000000000000000000000000000000000000000',
I20191004-12:36:41.961(2)?      topics: 
I20191004-12:36:41.961(2)?       [ '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.961(2)?         '0x0000000000000000000000000000000000000000000000000000000000000063',
I20191004-12:36:41.961(2)?         '0x000000000000000000000000370ceca4fc1287ed99924bba76259f6c771a6022',
I20191004-12:36:41.961(2)?         '0x000000000000000000000000512e07a093aaa20ba288392eadf03838c7a4e522' ] } }
I20191004-12:36:41.961(2)? SubmitVote
I20191004-12:36:41.961(2)? [web3] Adding a new Contract
I20191004-12:36:41.961(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.962(2)?   blockHash: '0xf057faa099007ef19faab53d37704dd1413b919596d12693223bb216834589e5',
I20191004-12:36:41.962(2)?   blockNumber: 8612397,
I20191004-12:36:41.962(2)?   logIndex: 90,
I20191004-12:36:41.962(2)?   removed: false,
I20191004-12:36:41.962(2)?   transactionHash: '0x8f359c48f04c4eb9e4ad81114df1d30e99161aab5b2f7734ce603eb71e24df33',
I20191004-12:36:41.962(2)?   transactionIndex: 134,
I20191004-12:36:41.962(2)?   id: 'log_0xa6a0df413a8d98472c2230b1dc3ba1555d30f22c536f917a64b7a1f331351ec5',
I20191004-12:36:41.962(2)?   returnValues: 
I20191004-12:36:41.962(2)?    { '0': BigNumber { _hex: '0x64' },
I20191004-12:36:41.962(2)?      '1': '0x2AF4125c8fE208a349ef78d3cb980308ab1Ed34f',
I20191004-12:36:41.962(2)?      '2': '0x2AF4125c8fE208a349ef78d3cb980308ab1Ed34f',
I20191004-12:36:41.963(2)?      '3': 1,
I20191004-12:36:41.963(2)?      proposalIndex: BigNumber { _hex: '0x64' },
I20191004-12:36:41.963(2)?      delegateKey: '0x2AF4125c8fE208a349ef78d3cb980308ab1Ed34f',
I20191004-12:36:41.963(2)?      memberAddress: '0x2AF4125c8fE208a349ef78d3cb980308ab1Ed34f',
I20191004-12:36:41.963(2)?      uintVote: 1 },
I20191004-12:36:41.963(2)?   event: 'SubmitVote',
I20191004-12:36:41.963(2)?   signature: '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.963(2)?   raw: 
I20191004-12:36:41.963(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000001',
I20191004-12:36:41.963(2)?      topics: 
I20191004-12:36:41.964(2)?       [ '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.964(2)?         '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.964(2)?         '0x0000000000000000000000002af4125c8fe208a349ef78d3cb980308ab1ed34f',
I20191004-12:36:41.964(2)?         '0x0000000000000000000000002af4125c8fe208a349ef78d3cb980308ab1ed34f' ] } }
I20191004-12:36:41.964(2)? SubmitVote
I20191004-12:36:41.964(2)? [web3] Adding a new Contract
I20191004-12:36:41.964(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.964(2)?   blockHash: '0xac032b2a3483efd36302d14ce4a08a8b0f7ea0d49321e8528e349955c07ff35c',
I20191004-12:36:41.964(2)?   blockNumber: 8613059,
I20191004-12:36:41.964(2)?   logIndex: 18,
I20191004-12:36:41.964(2)?   removed: false,
I20191004-12:36:41.965(2)?   transactionHash: '0x9d57fa6d609ae813b89cabd5cea8ca3b819f910fb5e55419cd6da4bdc75c3947',
I20191004-12:36:41.965(2)?   transactionIndex: 27,
I20191004-12:36:41.965(2)?   id: 'log_0xd72f5f636e7a05311b51b30ca8a3bb93539ff99665705def2f9a923b62a38833',
I20191004-12:36:41.965(2)?   returnValues: 
I20191004-12:36:41.965(2)?    { '0': BigNumber { _hex: '0x64' },
I20191004-12:36:41.965(2)?      '1': '0x2fbfa215e62F0098ddAd5bc466Bc62bBf86381Aa',
I20191004-12:36:41.965(2)?      '2': '0x2625f1c0bc50b2F663BeA454ccb7398FE3E7a9ae',
I20191004-12:36:41.965(2)?      '3': 1,
I20191004-12:36:41.965(2)?      proposalIndex: BigNumber { _hex: '0x64' },
I20191004-12:36:41.965(2)?      delegateKey: '0x2fbfa215e62F0098ddAd5bc466Bc62bBf86381Aa',
I20191004-12:36:41.965(2)?      memberAddress: '0x2625f1c0bc50b2F663BeA454ccb7398FE3E7a9ae',
I20191004-12:36:41.965(2)?      uintVote: 1 },
I20191004-12:36:41.965(2)?   event: 'SubmitVote',
I20191004-12:36:41.965(2)?   signature: '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.965(2)?   raw: 
I20191004-12:36:41.966(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000001',
I20191004-12:36:41.966(2)?      topics: 
I20191004-12:36:41.966(2)?       [ '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.966(2)?         '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.966(2)?         '0x0000000000000000000000002fbfa215e62f0098ddad5bc466bc62bbf86381aa',
I20191004-12:36:41.966(2)?         '0x0000000000000000000000002625f1c0bc50b2f663bea454ccb7398fe3e7a9ae' ] } }
I20191004-12:36:41.966(2)? SubmitVote
I20191004-12:36:41.966(2)? [web3] Adding a new Contract
I20191004-12:36:41.966(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.966(2)?   blockHash: '0xc2a9c592a16a0802f77601b2c33fe57e7271e36a83a2401f9c71dfa3104e8649',
I20191004-12:36:41.966(2)?   blockNumber: 8613167,
I20191004-12:36:41.966(2)?   logIndex: 66,
I20191004-12:36:41.967(2)?   removed: false,
I20191004-12:36:41.967(2)?   transactionHash: '0x425869656f11b211b2635dc0675db59d289471957d3ef0eaab15093aeff2d344',
I20191004-12:36:41.967(2)?   transactionIndex: 117,
I20191004-12:36:41.967(2)?   id: 'log_0x9b959dae9b482ab9a2c374dd8422fbfd42028f061adcdfbfc15d50a99c7b0689',
I20191004-12:36:41.967(2)?   returnValues: 
I20191004-12:36:41.967(2)?    { '0': BigNumber { _hex: '0x64' },
I20191004-12:36:41.967(2)?      '1': '0x4F8EEaBa7e19fd67673306f2DC9Fb809150De173',
I20191004-12:36:41.967(2)?      '2': '0x4F8EEaBa7e19fd67673306f2DC9Fb809150De173',
I20191004-12:36:41.967(2)?      '3': 1,
I20191004-12:36:41.967(2)?      proposalIndex: BigNumber { _hex: '0x64' },
I20191004-12:36:41.967(2)?      delegateKey: '0x4F8EEaBa7e19fd67673306f2DC9Fb809150De173',
I20191004-12:36:41.968(2)?      memberAddress: '0x4F8EEaBa7e19fd67673306f2DC9Fb809150De173',
I20191004-12:36:41.968(2)?      uintVote: 1 },
I20191004-12:36:41.968(2)?   event: 'SubmitVote',
I20191004-12:36:41.968(2)?   signature: '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.968(2)?   raw: 
I20191004-12:36:41.968(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000001',
I20191004-12:36:41.968(2)?      topics: 
I20191004-12:36:41.968(2)?       [ '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.968(2)?         '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.968(2)?         '0x0000000000000000000000004f8eeaba7e19fd67673306f2dc9fb809150de173',
I20191004-12:36:41.969(2)?         '0x0000000000000000000000004f8eeaba7e19fd67673306f2dc9fb809150de173' ] } }
I20191004-12:36:41.969(2)? Ragequit
I20191004-12:36:41.969(2)? [web3] Adding a new Contract
I20191004-12:36:41.969(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.969(2)?   blockHash: '0xb94dc7ca5989148ff63e62b77d7e42293973cfdb6c06b82d005db9004c2cd742',
I20191004-12:36:41.969(2)?   blockNumber: 8618787,
I20191004-12:36:41.969(2)?   logIndex: 228,
I20191004-12:36:41.969(2)?   removed: false,
I20191004-12:36:41.969(2)?   transactionHash: '0x8323333c0695f0db5355d6a7f660a76f1c14f13a2bca43d397b35544fe2c282c',
I20191004-12:36:41.969(2)?   transactionIndex: 185,
I20191004-12:36:41.970(2)?   id: 'log_0x2c9473030d31ce503c41502885351f0892979e8cb871f1c9af65436aa2b8714e',
I20191004-12:36:41.970(2)?   returnValues: 
I20191004-12:36:41.970(2)?    { '0': '0x26885A15E186Dc884A193c257EE6F15A90Fd8D7a',
I20191004-12:36:41.970(2)?      '1': BigNumber { _hex: '0x64' },
I20191004-12:36:41.970(2)?      memberAddress: '0x26885A15E186Dc884A193c257EE6F15A90Fd8D7a',
I20191004-12:36:41.970(2)?      sharesToBurn: BigNumber { _hex: '0x64' } },
I20191004-12:36:41.970(2)?   event: 'Ragequit',
I20191004-12:36:41.970(2)?   signature: '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.970(2)?   raw: 
I20191004-12:36:41.970(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.970(2)?      topics: 
I20191004-12:36:41.970(2)?       [ '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.970(2)?         '0x00000000000000000000000026885a15e186dc884a193c257ee6f15a90fd8d7a' ] } }
I20191004-12:36:41.970(2)? Ragequit
I20191004-12:36:41.971(2)? [web3] Adding a new Contract
I20191004-12:36:41.971(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.971(2)?   blockHash: '0xcc4b40ec6ed031afbd206c9ea740b37c1a86c7d3b4a5bc0f454f41563ca00b2d',
I20191004-12:36:41.971(2)?   blockNumber: 8618789,
I20191004-12:36:41.971(2)?   logIndex: 8,
I20191004-12:36:41.971(2)?   removed: false,
I20191004-12:36:41.971(2)?   transactionHash: '0xd2e19382d30a634a900536effd89c8eda9b556c05b9bf0817102b505dec42300',
I20191004-12:36:41.971(2)?   transactionIndex: 10,
I20191004-12:36:41.971(2)?   id: 'log_0x2f9b0ad375c267a98dbc2829b2df4f12d8bcd462a80a272a6e7607bcb3595ed3',
I20191004-12:36:41.971(2)?   returnValues: 
I20191004-12:36:41.971(2)?    { '0': '0x5320Ad1a8aa3304064e1c523eb7c41cc38CF1BE5',
I20191004-12:36:41.971(2)?      '1': BigNumber { _hex: '0x64' },
I20191004-12:36:41.971(2)?      memberAddress: '0x5320Ad1a8aa3304064e1c523eb7c41cc38CF1BE5',
I20191004-12:36:41.971(2)?      sharesToBurn: BigNumber { _hex: '0x64' } },
I20191004-12:36:41.971(2)?   event: 'Ragequit',
I20191004-12:36:41.971(2)?   signature: '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.972(2)?   raw: 
I20191004-12:36:41.972(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.972(2)?      topics: 
I20191004-12:36:41.972(2)?       [ '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.972(2)?         '0x0000000000000000000000005320ad1a8aa3304064e1c523eb7c41cc38cf1be5' ] } }
I20191004-12:36:41.972(2)? Ragequit
I20191004-12:36:41.972(2)? [web3] Adding a new Contract
I20191004-12:36:41.972(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.972(2)?   blockHash: '0x5851df8dd67f57d701141760549b710c2011b1c790af39db9724c3b7c1505a71',
I20191004-12:36:41.972(2)?   blockNumber: 8618791,
I20191004-12:36:41.972(2)?   logIndex: 75,
I20191004-12:36:41.972(2)?   removed: false,
I20191004-12:36:41.973(2)?   transactionHash: '0xa1d94199442fee4eacdbe839e91c047d3f34f72dea93c32578a273b8c4807489',
I20191004-12:36:41.973(2)?   transactionIndex: 86,
I20191004-12:36:41.973(2)?   id: 'log_0x7469e894982d201d536b8d494395c1d040fbdc97f45c85689ccf2c9177aac5c2',
I20191004-12:36:41.973(2)?   returnValues: 
I20191004-12:36:41.973(2)?    { '0': '0x62dF6557E5fbAFB4bcDCe70B0E3222E7d73A89B6',
I20191004-12:36:41.973(2)?      '1': BigNumber { _hex: '0x64' },
I20191004-12:36:41.973(2)?      memberAddress: '0x62dF6557E5fbAFB4bcDCe70B0E3222E7d73A89B6',
I20191004-12:36:41.973(2)?      sharesToBurn: BigNumber { _hex: '0x64' } },
I20191004-12:36:41.973(2)?   event: 'Ragequit',
I20191004-12:36:41.973(2)?   signature: '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.973(2)?   raw: 
I20191004-12:36:41.973(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.973(2)?      topics: 
I20191004-12:36:41.973(2)?       [ '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.974(2)?         '0x00000000000000000000000062df6557e5fbafb4bcdce70b0e3222e7d73a89b6' ] } }
I20191004-12:36:41.974(2)? Ragequit
I20191004-12:36:41.974(2)? [web3] Adding a new Contract
I20191004-12:36:41.974(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.974(2)?   blockHash: '0xa5c55adcf9dee8bc3596f63719dad2e044ef2db38fb73fa93b2ce5cf3dee679b',
I20191004-12:36:41.974(2)?   blockNumber: 8618792,
I20191004-12:36:41.974(2)?   logIndex: 112,
I20191004-12:36:41.974(2)?   removed: false,
I20191004-12:36:41.974(2)?   transactionHash: '0xad9bec7c4f2bd0dea952477383bdac997a938c9a8a476a2340de15d5b207a619',
I20191004-12:36:41.974(2)?   transactionIndex: 144,
I20191004-12:36:41.974(2)?   id: 'log_0xf4ded9e7d077c0e1251bd6f3a7aec7c3fd5a3730855684f70fdf0f3faf894693',
I20191004-12:36:41.975(2)?   returnValues: 
I20191004-12:36:41.975(2)?    { '0': '0x38D4D579F130b62b3cFa75871cf833f3eF2380f8',
I20191004-12:36:41.975(2)?      '1': BigNumber { _hex: '0x64' },
I20191004-12:36:41.975(2)?      memberAddress: '0x38D4D579F130b62b3cFa75871cf833f3eF2380f8',
I20191004-12:36:41.975(2)?      sharesToBurn: BigNumber { _hex: '0x64' } },
I20191004-12:36:41.975(2)?   event: 'Ragequit',
I20191004-12:36:41.975(2)?   signature: '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.975(2)?   raw: 
I20191004-12:36:41.975(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.975(2)?      topics: 
I20191004-12:36:41.975(2)?       [ '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.975(2)?         '0x00000000000000000000000038d4d579f130b62b3cfa75871cf833f3ef2380f8' ] } }
I20191004-12:36:41.975(2)? Ragequit
I20191004-12:36:41.975(2)? [web3] Adding a new Contract
I20191004-12:36:41.976(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.976(2)?   blockHash: '0x4b54ad64c4a6ab0184d3c27fffd735d786962785588528fc1eaec3e32f054542',
I20191004-12:36:41.976(2)?   blockNumber: 8618793,
I20191004-12:36:41.976(2)?   logIndex: 30,
I20191004-12:36:41.977(2)?   removed: false,
I20191004-12:36:41.977(2)?   transactionHash: '0x653cedb360f1a1176e822158b864d9be6d040d0df7e90b11ed395a643d0b9913',
I20191004-12:36:41.977(2)?   transactionIndex: 15,
I20191004-12:36:41.977(2)?   id: 'log_0x1e613934541bedcf4a3360414f7874f536b5a9c98378e9d6cec51fad02d8a121',
I20191004-12:36:41.977(2)?   returnValues: 
I20191004-12:36:41.977(2)?    { '0': '0xbf42b21338236126D83618cF51570c2ae8Ca6d6D',
I20191004-12:36:41.977(2)?      '1': BigNumber { _hex: '0x64' },
I20191004-12:36:41.977(2)?      memberAddress: '0xbf42b21338236126D83618cF51570c2ae8Ca6d6D',
I20191004-12:36:41.977(2)?      sharesToBurn: BigNumber { _hex: '0x64' } },
I20191004-12:36:41.978(2)?   event: 'Ragequit',
I20191004-12:36:41.978(2)?   signature: '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.978(2)?   raw: 
I20191004-12:36:41.978(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.978(2)?      topics: 
I20191004-12:36:41.978(2)?       [ '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.978(2)?         '0x000000000000000000000000bf42b21338236126d83618cf51570c2ae8ca6d6d' ] } }
I20191004-12:36:41.978(2)? Ragequit
I20191004-12:36:41.978(2)? [web3] Adding a new Contract
I20191004-12:36:41.978(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.978(2)?   blockHash: '0xf716a68e651d0c7152f1825e1b25dc8099c19cdc811735e259755d8a8087fcde',
I20191004-12:36:41.978(2)?   blockNumber: 8619281,
I20191004-12:36:41.978(2)?   logIndex: 69,
I20191004-12:36:41.978(2)?   removed: false,
I20191004-12:36:41.978(2)?   transactionHash: '0x8f98732e415bd789708c1e533c44372ceeeedc7536c87726af60232f1ebc7a84',
I20191004-12:36:41.979(2)?   transactionIndex: 83,
I20191004-12:36:41.979(2)?   id: 'log_0x2525f07b3f6698f7bd27a3ef1090e519c7e78803d3c684e88532fb21d5dc574b',
I20191004-12:36:41.979(2)?   returnValues: 
I20191004-12:36:41.979(2)?    { '0': '0x0a7dA1Fe01846f96Eb44c4c3952a0F5bAeC148b3',
I20191004-12:36:41.979(2)?      '1': BigNumber { _hex: '0x64' },
I20191004-12:36:41.979(2)?      memberAddress: '0x0a7dA1Fe01846f96Eb44c4c3952a0F5bAeC148b3',
I20191004-12:36:41.979(2)?      sharesToBurn: BigNumber { _hex: '0x64' } },
I20191004-12:36:41.979(2)?   event: 'Ragequit',
I20191004-12:36:41.979(2)?   signature: '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.979(2)?   raw: 
I20191004-12:36:41.979(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.980(2)?      topics: 
I20191004-12:36:41.980(2)?       [ '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.980(2)?         '0x0000000000000000000000000a7da1fe01846f96eb44c4c3952a0f5baec148b3' ] } }
I20191004-12:36:41.980(2)? SubmitVote
I20191004-12:36:41.980(2)? [web3] Adding a new Contract
I20191004-12:36:41.980(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.980(2)?   blockHash: '0xdfcaccd25c7e7e11da3818555a7586d86e504201ff57fc947463c84b75a91f15',
I20191004-12:36:41.980(2)?   blockNumber: 8619479,
I20191004-12:36:41.980(2)?   logIndex: 21,
I20191004-12:36:41.981(2)?   removed: false,
I20191004-12:36:41.981(2)?   transactionHash: '0xfcff38349c329c6ace0076890b639466fe0ed223210a9b3fd2b751b4306fb78c',
I20191004-12:36:41.981(2)?   transactionIndex: 28,
I20191004-12:36:41.981(2)?   id: 'log_0x5a03e35c5f995890994497d7b42ba1358e4b0d599733bf06268841c929e380bc',
I20191004-12:36:41.981(2)?   returnValues: 
I20191004-12:36:41.981(2)?    { '0': BigNumber { _hex: '0x64' },
I20191004-12:36:41.981(2)?      '1': '0x965FDb32E3fcdc6dC323464A42a9615E6A5464D1',
I20191004-12:36:41.981(2)?      '2': '0x965FDb32E3fcdc6dC323464A42a9615E6A5464D1',
I20191004-12:36:41.981(2)?      '3': 1,
I20191004-12:36:41.981(2)?      proposalIndex: BigNumber { _hex: '0x64' },
I20191004-12:36:41.981(2)?      delegateKey: '0x965FDb32E3fcdc6dC323464A42a9615E6A5464D1',
I20191004-12:36:41.981(2)?      memberAddress: '0x965FDb32E3fcdc6dC323464A42a9615E6A5464D1',
I20191004-12:36:41.981(2)?      uintVote: 1 },
I20191004-12:36:41.982(2)?   event: 'SubmitVote',
I20191004-12:36:41.982(2)?   signature: '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.982(2)?   raw: 
I20191004-12:36:41.982(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000001',
I20191004-12:36:41.982(2)?      topics: 
I20191004-12:36:41.982(2)?       [ '0x29bf0061f2faa9daa482f061b116195432d435536d8af4ae6b3c5dd78223679b',
I20191004-12:36:41.982(2)?         '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.982(2)?         '0x000000000000000000000000965fdb32e3fcdc6dc323464a42a9615e6a5464d1',
I20191004-12:36:41.982(2)?         '0x000000000000000000000000965fdb32e3fcdc6dc323464a42a9615e6a5464d1' ] } }
I20191004-12:36:41.982(2)? Ragequit
I20191004-12:36:41.982(2)? [web3] Adding a new Contract
I20191004-12:36:41.982(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.982(2)?   blockHash: '0x27ec2db020135a6202295bf05511e0a27364a4b0b97e79cbf6e93f515bddaa0d',
I20191004-12:36:41.982(2)?   blockNumber: 8644771,
I20191004-12:36:41.983(2)?   logIndex: 47,
I20191004-12:36:41.983(2)?   removed: false,
I20191004-12:36:41.983(2)?   transactionHash: '0xf890a4b11e0a9cc9edfc501a0275f362ca0dd881163aef02a16e1bab17ec8932',
I20191004-12:36:41.983(2)?   transactionIndex: 54,
I20191004-12:36:41.983(2)?   id: 'log_0xb3ed8b483b90fe5c07c2b6122a4c12bdbdf3f0f9492afbd3495ef93dd7bd9d2b',
I20191004-12:36:41.983(2)?   returnValues: 
I20191004-12:36:41.983(2)?    { '0': '0xF754eEE52ae08568201c56f51BA985638edaE1c4',
I20191004-12:36:41.983(2)?      '1': BigNumber { _hex: '0x63' },
I20191004-12:36:41.983(2)?      memberAddress: '0xF754eEE52ae08568201c56f51BA985638edaE1c4',
I20191004-12:36:41.983(2)?      sharesToBurn: BigNumber { _hex: '0x63' } },
I20191004-12:36:41.983(2)?   event: 'Ragequit',
I20191004-12:36:41.984(2)?   signature: '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.984(2)?   raw: 
I20191004-12:36:41.984(2)?    { data: '0x0000000000000000000000000000000000000000000000000000000000000063',
I20191004-12:36:41.984(2)?      topics: 
I20191004-12:36:41.984(2)?       [ '0x667cb7a1818eacd2e3a421e734429ba9c4c7dec85e578e098b6d72cd2bfbf2f6',
I20191004-12:36:41.984(2)?         '0x000000000000000000000000f754eee52ae08568201c56f51ba985638edae1c4' ] } }
I20191004-12:36:41.984(2)? ProcessProposal
I20191004-12:36:41.984(2)? [web3] Adding a new Contract
I20191004-12:36:41.984(2)? { address: '0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1',
I20191004-12:36:41.984(2)?   blockHash: '0xa5fab79fef77388031b89deecf3e27b90dcadcfb5fe5911cb320a876718f0480',
I20191004-12:36:41.985(2)?   blockNumber: 8666778,
I20191004-12:36:41.985(2)?   logIndex: 7,
I20191004-12:36:41.985(2)?   removed: false,
I20191004-12:36:41.985(2)?   transactionHash: '0xf73c2380bc45455f2f2a0a0d5451c0d8d70e5d5caf58c4a4a0e3a8a8f307b4aa',
I20191004-12:36:41.985(2)?   transactionIndex: 10,
I20191004-12:36:41.985(2)?   id: 'log_0x4936951a31bf48919090c61551339b59d2cf1551c2b5ca86fc16b5c6d2e3d9d8',
I20191004-12:36:41.985(2)?   returnValues: 
I20191004-12:36:41.985(2)?    { '0': BigNumber { _hex: '0x64' },
I20191004-12:36:41.985(2)?      '1': '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.985(2)?      '2': '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.986(2)?      '3': BigNumber { _hex: '0x00' },
I20191004-12:36:41.986(2)?      '4': BigNumber { _hex: '0x08' },
I20191004-12:36:41.986(2)?      '5': true,
I20191004-12:36:41.986(2)?      proposalIndex: BigNumber { _hex: '0x64' },
I20191004-12:36:41.986(2)?      applicant: '0x1b037167C4b0584Ca5Ef6534648C38F496757FA5',
I20191004-12:36:41.986(2)?      memberAddress: '0x1A57F99c4759F4E4E29140B1D7A89584e1c1Ef67',
I20191004-12:36:41.986(2)?      tokenTribute: BigNumber { _hex: '0x00' },
I20191004-12:36:41.986(2)?      sharesRequested: BigNumber { _hex: '0x08' },
I20191004-12:36:41.986(2)?      didPass: true },
I20191004-12:36:41.986(2)?   event: 'ProcessProposal',
I20191004-12:36:41.986(2)?   signature: '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.986(2)?   raw: 
I20191004-12:36:41.986(2)?    { data: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000001',
I20191004-12:36:41.986(2)?      topics: 
I20191004-12:36:41.986(2)?       [ '0x3f6fc303a82367bb4947244ba21c569a5ed2e870610f1a693366142309d7cbea',
I20191004-12:36:41.986(2)?         '0x0000000000000000000000000000000000000000000000000000000000000064',
I20191004-12:36:41.987(2)?         '0x0000000000000000000000001b037167c4b0584ca5ef6534648c38f496757fa5',
I20191004-12:36:41.987(2)?         '0x0000000000000000000000001a57f99c4759f4e4e29140b1d7a89584e1c1ef67' ] } }

*/

