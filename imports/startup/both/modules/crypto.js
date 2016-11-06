// more like krypton than crypto still..

const guidGen = () => {
      var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

const _shortUUID = () => {
  ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
};

let getBitcoinAddress = () => {
  var randArr = new Uint8Array(32) //create a typed array of 32 bytes (256 bits)
  window.crypto.getRandomValues(randArr) //populate array with cryptographically secure random numbers

  //some Bitcoin and Crypto methods don't like Uint8Array for input. They expect regular JS arrays.
  var privateKeyBytes = []
  for (var i = 0; i < randArr.length; ++i)
    privateKeyBytes[i] = randArr[i]

  var eckey = new Bitcoin.ECKey(privateKeyBytes)
  eckey.compressed = true
  var address = eckey.getBitcoinAddress().toString()
  console.log(address)// 1FkKMsKNJqWSDvTvETqcCeHcUQQ64kSC6s


  var privateKeyBytesCompressed = privateKeyBytes.slice(0) //clone array
  privateKeyBytesCompressed.push(0x01)
  var privateKeyWIFCompressed = new Bitcoin.Address(privateKeyBytesCompressed)
  privateKeyWIFCompressed.version = 0x80
  privateKeyWIFCompressed = privateKeyWIFCompressed.toString()

  console.log(privateKeyWIFCompressed) //KwomKti1X3tYJUUMb1TGSM2mrZk1wb1aHisUNHCQXTZq5auC2qc3
}

export const shortUUID = _shortUUID;
export const guidGenerator = guidGen;
