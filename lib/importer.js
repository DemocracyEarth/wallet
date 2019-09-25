
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
*/

