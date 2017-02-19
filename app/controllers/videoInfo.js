var Server = require('mongodb').Server;
var GridStore = require('mongodb').GridStore;
var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var Promise = require('bluebird');
var crypto = require('crypto');
var util = require('util');
var cheerio=require("cheerio");
var util=require('util');
var YouTube=require("youtube-node");
var ip = require("ip");
var youtube = new YouTube();
var max3hash =require('./max3hash.js');



var dbUrl='mongodb://sg1:6333/webpagedb';

var maxIDCount=25;
//var mongoTable=null;
//var mongoDb=null;


var mongoConnectInitial = function() {
    var self = this;
    MongoClient.connect(dbUrl, function(err, db) {
        if (err) throw err;
        console.log('sss debug:', 'mongodb webpage connnected');
        mongoDb = db;
        mongoTable = db.collection('webpage');
       // callback();
    });
}; 

var videoExtractor={
   index:index,
   mongoConnectInitial:mongoConnectInitial
}

function index(){
//  var queryStr=['fun','entertainment','politics','offbeat','sports'];
  var queryStr=['entertainment','sports'];
  for(var i=0;i<queryStr.length;i++){
    extractVideoByTheme(queryStr[i]);
  }  

}

function extractVideoByTheme(queryStr){
   var queryStrArray=[];
   var videoIdArrayPromise;
   var videoInfo;
   var videoIdArray;
//   mongoConnectInitial();
   videoIdArrayPromise=getVideoId(queryStr);


   
   videoIdArrayPromise.then(function(videoIdArray){
//      console.log("return array length: ",videoIdArray.length);
      return new Promise(function(resolve,reject){
        resolve(videoIdArray);
      });

   }).then(function(videoIdArray){
      if(!videoIdArray) console.log("nothing retured from videoIDArray");
     for(var i=0;i<videoIdArray.length;i++){
       console.log("videoIdArray: ",videoIdArray[i]);

        youtube.getById(videoIdArray[i],function(err,videoInfo){
          if(!videoInfo){
             console.log("err,can't get info from id");
             return err;
          
          }
          console.log(videoIdArray[i]);
          var data=getData(videoInfo,queryStr);
          if(!data) return;
          MongoClient.connect(dbUrl, function(err, db) {
            if (err) throw err;
            console.log('sss debug:', 'mongodb webpage connnected');
            var mongoDb = db;
            var mongoTable = db.collection('webpage');
            insert2Mongo(data,mongoTable);
          });

        });
      }
   }).catch(function(error){
      console.log(error);
  });

}

//index();
//this function is not used any more
function getVideoUrl(expression){
  
    if(!expression){return err;}
    var $=cheerio.load(expression.toString(),{decodeEntities: false});
    var iframeItem=$("iframe");
    var videoUrl;
    if(iframeItem.length>1){
      console.log("two iframe in playListInfo by videoId");
      return null;
    }
    videoUrl=$(iframeItem).attr('src');
    return videoUrl;
}

function  getVideoId(queryStr){
 return new Promise(function(resolve,reject){
   
  youtube.setKey("AIzaSyCaxQpuQ1jT0QXt563_OxXi8egu9OQk6Y4");
  var videoIdArray=[];
  youtube.search(queryStr,maxIDCount,function(error,search_items){
    if(error){
  	  return error;
    }
    if(!search_items){
          
  	  return null;
    } 
    for(var i=0;i<search_items.items.length;i++){
      videoIdArray.push(search_items.items[i].id.videoId);
//      console.log("result is ",videoIdArray[i]);
    }
    resolve(videoIdArray);
    return videoIdArray;
  });

  return null;

 });
}



function categoryConvertion(categoryId){
  var videoCategory=[
    {cateId:'1',cateName:'Film & Animation'},
    {cateId:'2',cateName:'Autos & Vehicles'},
    {cateId:'10',cateName:'Music'},
    {cateId:'15',cateName:'Pets & Animals'},
    {cateId:'17',cateName:'Sports'},
    {cateId:'18',cateName:'Short Movies'},
    {cateId:'19',cateName:'Travel & Events'},
    {cateId:'20',cateName:'Gaming'},
    {cateId:'21',cateName:'Videoblogging'},
    {cateId:'22',cateName:'People & Blogs'},
    {cateId:'23',cateName:'Comedy'},
    {cateId:'24',cateName:'Entertainment'},
    {cateId:'25',cateName:'News & Politics'},
    {cateId:'26',cateName:'Howto & Style'},
    {cateId:'27',cateName:'Education'},
    {cateId:'28',cateName:'Science & Technology'},
    {cateId:'29',cateName:'Nonprofits & Activism'},
    {cateId:'30',cateName:'Movies'},
    {cateId:'31',cateName:'Anime/Animation'},
    {cateId:'32',cateName:'Action/Adventure'},
    {cateId:'33',cateName:'Classics'},
    {cateId:'34',cateName:'Comedy'},
    {cateId:'35',cateName:'Documentary'},
    {cateId:'36',cateName:'Drama'},
    {cateId:'37',cateName:'Family'},
    {cateId:'38',cateName:'Foreign'},
    {cateId:'39',cateName:'Horror'},
    {cateId:'40',cateName:'Sci-Fi/Fantasy'},
    {cateId:'41',cateName:'Thriller'},
    {cateId:'42',cateName:'Shorts'},
    {cateId:'43',cateName:'Shows'},
    {cateId:'44',cateName:'Trailers'}
  ];
  for(var i=0;i<videoCategory.length;i++){
    if(videoCategory[i].cateId==categoryId){
       return videoCategory[i].cateName;
    }else{
       continue;
    }   
  }
  return null;
}



function getData(videoInfo,queryStr){
  if(!videoInfo){
    console.log("videoInfo is unexisted"); 
    return null;
  }
  console.log("queryStr: ",queryStr);
 // var purecontent=videoInfo.toString();
  var itemInfo=videoInfo.items[0];
  if(!itemInfo){return null;}
//  console.log('itemInfo: ',itemInfo);
  var videoUrl="https://www.youtube.com/embed/"+itemInfo.id+"?feature=oembed";
//  var content=JSON.stringify(videoInfo.items);
    
  var crawlerIp = ip.address();
  
   var durationStr =itemInfo.contentDetails.duration;
               console.log('duration:',durationStr);
               var regex ;
               var regexH = new RegExp("PT(\\d+)H(\\d+)M(\\d+)S");
               var regexM = new RegExp("PT(\\d+)M(\\d+)S");
               var regexS = new RegExp("PT(\\d+)S");
               if (regexH.test(durationStr)){
                  console.log('regexH matched');
                  regex = regexH;
               durationStr.replace (regex, function (t, h,m, s) {
                    console.log('t:%s,h:%s,m:%s,s:%s',t,h,m,s);
                    var durationSec = (parseInt (h, 10) * 3600) + (parseInt (m, 10) * 60) + parseInt (s, 10);
                    console.log('durationSec',durationSec);
                    itemInfo.contentDetails.duration = durationSec;
               });
               }else if (regexM.test(durationStr)){
                  console.log('regexM matched');
                  regex = regexM;
               durationStr.replace (regex, function (t, m, s) {
                    console.log('t:%s,m:%s,s:%s',t,m,s);
                    var durationSec = (parseInt (m, 10) * 60) + parseInt (s, 10);
                    console.log('durationSec',durationSec);
                    itemInfo.contentDetails.duration = durationSec;
               });
               }else if (regexS.test(durationStr)){
                  console.log('regexS matched');
                  regex = regexS;
               durationStr.replace (regex, function (t, s) {
                    console.log('t:%s,s:%s',t,s);
                    var durationSec = parseInt (s, 10);
                    console.log('durationSec',durationSec);
                    itemInfo.contentDetails.duration = durationSec;
               });
               }else{
                   console.log("duration time can't be parsed successfully");
                 
               }
 
  var completeContent={
    items:videoInfo.items
  }
  var purecontent='<p id="holgaVideoId">'+itemInfo.id+'</p>';
     purecontent+='<p id="holgaVideoTitle">'+itemInfo.snippet.title+'</p>';
      purecontent+='<p id="holgaVideoInfo">'+JSON.stringify(completeContent)+'</p>';
 
  var simplefp = crypto.createHash('md5').update(purecontent).digest('hex');
  var max3hashValue = max3hash.getHash(purecontent);
//  var max3hashValue = crypto.createHash('md5').update(max3LenSentences.toString().toLowerCase()).digest('hex');
  var currentTime = (new Date()).getTime();
  var category=categoryConvertion(itemInfo.snippet.categoryId);
  if(!category){
    category=itemInfo.snippet.caetgoryId;
  }
    var data={
      title:itemInfo.snippet.title,
      content:purecontent,
      author:itemInfo.snippet.channelTitle,
      origin_author:itemInfo.snippet.channelTitle,
      originUrl:videoUrl,
      tags:'',
      postDate:'',
      category:category,
      crawlId:'youtubeAuto',
      atype:1,
      headImg:'',
      keywords:itemInfo.snippet.tags,
      appCategory:'',
      subCategory:'',
      domain:'youtube.com',
      url:videoUrl,
      crawlIp:crawlerIp,
      updated:currentTime,
      published:false,
      simplefp:simplefp,
      max3hash:max3hashValue,
      created:'',
      flagOff:-1
    };
  
//  console.log("videoInfo: ",videoInfo)
  return data;

}





function insert2Mongo(data,mongoTable){
 //   var crawlerIp = ip.address();
 //   data['crawlIp'] = crawlerIp;



//    console.log('in insertMongo,lang is:',data['lang']);
//    if (data['lang']==2 || data['lang']==3){
// 
//console.log('data:');
//console.log(data);
    var pureContent = data['content'];
    var _id=crypto.createHash('md5').update(data['originUrl']).digest('hex');
   console.log("_id",_id);

   var max3hash =data['max3hash'];
   var currentTime = (new Date()).getTime();
  
    var query = {
        "$or": [{
                '_id':_id
            }, {
                'max3hash': max3hash
            }

        ]
    };

    mongoTable.findOne(query, function(err, item) {
        if (err) {
            callback();
            throw err;
            
        } else {
            if (item) {
                if (item['max3hash'] == max3hash) {
                   // logger.warn("found the existed record in mongo via max3hash,do nothing.max3hash:",max3hash);
                   // callback(); 
                    return;
                }
                
                (function(nlist) {
                    for (var c = 0; c < nlist.length; c++)
                        if (data[nlist[c]] && item[nlist[c]] && data[nlist[c]].length < item[nlist[c]].length) delete data[nlist[c]];
                })(['title', 'content', 'tags', 'keywords']);

                mongoTable.update({
                    '_id': item['_id']
                }, {
                    $set: data
                }, {
                    w: 1
                }, function(err, result) {
                    if (!err) {
                       // spider_extend.reportdb.rpush('queue:crawled', _id);
                       console.log("update mongo failed",err);
                      //   logger.debug('update ' + data['title'] + ' to mongodb, ' + data['url'] + ' --override-> ' + item['url']);
                    }
                    return;
                   // callback();
                });
            } else {
               // data['simplefp'] = simplefp;
               // data['max3hash'] = max3hash;
                data['_id'] = _id;
                data['created'] = currentTime;
                console.log("start to inser to  mongo");
                mongoTable.insert(data, {
                    w: 1
                }, function(err, result) {
                    if (!err) {
                        //console.log('reportdb:',spider_extend.reportdb);
                        //spider_extend.reportdb.rpush('queue:crawled', _id);
                        //logger.debug('insert ' + data['title'] + ' to mongodb');
                        console.log('insert mongo successfully');
                    }else{
			console.error('insert mongo error.',err);
		    }
                    return;
                   // callback();
                });
            }
        }
    });
}


module.exports=videoExtractor;
