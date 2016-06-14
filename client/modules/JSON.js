searchJSON = function (source, keyword) {
  var matchingFields = new Array;
  var sourceString = new String;

  if (source != undefined) {
    for(var i = 0; i < source.length; i++) {
      sourceString = source[i].name.toUpperCase();
      if(sourceString.indexOf(keyword.toUpperCase()) >= 0) {
        matchingFields.push(source[i]);
      }
    }
    return matchingFields;
  };
}
