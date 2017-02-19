function clean(data_,excludeTags) {
  var data = data_;

  var testHTML = new RegExp("([<]+[^>]*[>]+)", "g");
  var lstHTML = data.match(testHTML);
///  console.log('lstHTML:',lstHTML);
  for (var o in lstHTML) {

    if (!lstHTML.hasOwnProperty(o)) {
        //console.log("tag not owner:",lstHTML[o]);
        continue;
    }
    var needExclude = needExcludeTag(excludeTags,lstHTML[o]);
    if (needExclude){
        continue;
    }
    data = data.replace(lstHTML[o], " ");
  }
//console.log("data is:",data);
  return data;
}

function needExcludeTag(excludeTags,currentTagStr){
    for(var i in excludeTags){
        var excludeTag = excludeTags[i];
        //console.log('exclude tag:',excludeTags[i]);
        if (currentTagStr.toLowerCase().indexOf('<'+excludeTag.toLowerCase())==0 || currentTagStr.toLowerCase().indexOf('</'+excludeTag.toLowerCase())==0){
		//console.log("need exclude.excludeTag,currentTagStr:",excludeTag,currentTagStr);
                return true;
        }
    }
	//console.log("do not need exclude.excludeTags,currentTagStr:",excludeTags,currentTagStr);
    return false;
}
module.exports={
	clean:clean
}
