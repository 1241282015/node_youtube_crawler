/**
@author:sss
@date:2016-11-12
@description:get hash of the top 3 of max length sentences in order to avoid inserting duplicated content.
*/

var htmlCleaner = require('./htmlCleaner.js');
var crypto = require('crypto');

function getMax3LenSentences(content) {

    var lenArr = [];
    var max3Sentences = [];
    var pureText = getPureText(content);
    var sentenceArray = pureText.split(".");
    for (var i in sentenceArray) {
        sentenceArray[i] = sentenceArray[i].replace(/\s/g, '');
        var sentenceLen = sentenceArray[i].length;
        lenArr.push({
            id: i,
            len: sentenceLen
        });
    }
    //console.log('lenArr:',lenArr);
    lenArr.sort(function(a, b) {
        return b.len - a.len;
    });
    for (var i in sentenceArray) {
        if (i == 3) {
            break;
        }
        max3Sentences.push(sentenceArray[lenArr[i].id]);
    }
    return max3Sentences;
}

function getPureText(htmlStr, excludeTags) {
    if (htmlStr.length < 300) { //sss added 0628 避免文字过少，或者全是标签，误报重复。
        return htmlStr;
    }
    var pureText = htmlCleaner.clean(htmlStr, excludeTags);
    pureText = pureText.replace(/&#.{1,5}?;/g, '');
    if (pureText.length < 300) { //sss added 0628 避免文字过少，或者全是标签，误报重复。
        return htmlStr;
    } else {
        return pureText;
    }
}

function getHash(pureContent){
    var max3LenSentences = getMax3LenSentences(pureContent);
    var max3hash = crypto.createHash('md5').update(max3LenSentences.toString().toLowerCase()).digest('hex');
    return max3hash;
}

module.exports = {
    getHash:getHash

};