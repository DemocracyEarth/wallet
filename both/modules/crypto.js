//more like krypton than crypto still..

let guidGen = () => {
      var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

let shortUUID = () => {
  return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
}

Modules.both.shortUUID = shortUUID;
Modules.both.guidGenerator = guidGen;
