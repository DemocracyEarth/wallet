const itemList = document.getElementsByClassName('DaoList__Item');

const daoHaus = [];
for (let i = 0; i < itemList.length; i += 1) {
  daoHaus.push({
    name: itemList[i].children[0].children[0].children[0].innerText,
    profile: {
      bio: itemList[i].children[0].children[0].children[1].innerText,
      blockchain: {
        publicAddress: itemList[i].children[0].href.slice(28),
      },
    },
  });
}

for (const item of daoHaus) {
  console.log(`
  {
    "name": "${item.name}",
    "profile": {
      "bio": "${item.profile.bio}",
      "blockchain" : {
        "publicAddress": "${item.profile.blockchain.publicAddress}"
      }
    }
  },`);
}
