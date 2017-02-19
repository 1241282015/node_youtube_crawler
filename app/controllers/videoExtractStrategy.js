/*
 * this file is used to create event-base monitor, kind of distribution center
 */
var YouTube=require("youtube-node");
var videoInfoHindi=require('./videoInfoHindi.js');
var videoConfigParams={};
var dataModel=require('./dataModel.js');
var youtube = new YouTube();


var Params=[{name:'funStory',query:{relevanceLanguage:'en',q:'jokes'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'tennis'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'football'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'soccer'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'basketball'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'volleyball'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'swimming'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'riding'}},
    {name:"sports",query:{relevanceLanguage:'en',q:'boxing'}},
    {name:"entertainment",query:{relevanceLanguage:'en',q:'entertainment'}},
    {name:"entartainment",query:{relevanceLanguage:'en',q:'gossip'}},
    {name:"politics",query:{relevanceLanguage:'en',q:'politics'}},
    {name:"music",query:{relevanceLanguage:'en',q:'music'}},
    {name:"astrology",query:{relevanceLanguage:'en',q:'astrology'}},
    {name:"celebrities",query:{relevanceLanguage:'en',q:'celebrities'}},
    {name:"tech",query:{relevanceLanguage:'en',q:'technology'}},
    {name:"tech",query:{relevanceLanguage:'en',q:'gadgets'}},
    {name:"world",query:{relevanceLanguage:'en',q:'world'}},
    {name:"china",query:{relevanceLanguage:'en',q:'chinese'}},
    {name:"food",query:{relevanceLanguage:'en',q:'food'}},
    {name:"fitness",query:{relevanceLanguage:'en',q:'fitness'}},
    {name:"travel",query:{relevanceLanguage:'en',q:'travel'}},
    {name:"education",query:{relevanceLanguage:'en',q:'education'}}
    ];


function extractByTopicId(){

}


function extractByChannelId(){

}

function extractVideo(){
  var Params=dataModel.getParams();
  var self=this;


  for(var i=0;i<Params.length;i++){
      console.log("---------------------------------------------this is %d time start",i);
    var firstPromise=videoInfoHindi.extractVideoByTheme(Params[i],youtube);
    firstPromise.then(function(){
        console.log("---------------------------------------------this is %d time end",i);
    });

  } 

}
extractVideo();


