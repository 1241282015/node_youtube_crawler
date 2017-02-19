/**
 * Created by Jack on 2017/2/11.
 *  problems that can't save in mongo partly, because of the usage of this.videoIdArray of videoCrawler object
 */
var util=require("util");
var events=require("events");
var Promise=require("bluebird");
var videoModel=require("../models/videodetails.js");
var mongoose=require("mongoose");
var async=require("async");
var YouTube=require("youtube-node");
var ip = require("ip");
var crypto=require("crypto");
var max3hash =require('./max3hash.js');

var maxIDCount=25;

var videoCrawler=function(videomonitor){
    var self=this;
    self.youtube=new YouTube();
    //var youtube = new YouTube();
    events.EventEmitter.call(this);
    self.videomonitor=videomonitor;
    this.assembly();
    var db=mongoose.connect("mongodb://127.0.0.1:27017/webpagedb");
    if(db) {
        console.log("mongo connection has been created");
    }
    else{
        console.log("mongo can't be setup");
        process.exit();
    }
};
util.inherits(videoCrawler,events.EventEmitter);

videoCrawler.prototype.assembly=function(){
    var self=this;
    this.index=0;
    self.videoIdArray=[];
    self.on("videoidArray",function(){
        console.log("length of videoIdArray: ",self.videoIdArray.length);
        if(self.videoIdArray.length){
            self.getVideoInfo(self.videoIdArray.pop());
        }else{
            self.index++;
            //here is not finished, to trigger monitor "nextParams" function
            //self.removeAllListeners();

           //self.videomonitor.emit("nextParams");
            //self.videomonitor.emit("getVideoArray");
        }
        return;
    });
//monitor getVideoIdArray is the only entry of nexParams event, otherwise when first loop end, idarray =0, then many nextParams will be invoked
    self.on("getVideoIdArray",function(videoidarray){
        //if((!videoidarray) || (!videoidarray.length)){
        if(!videoidarray.length){
            console.log("getvideoid if no");
            //console.log("nothing from youtube-node request");
            //if nothing returned for youtube.search, then continue to execute next Param
            //self.removeAllListeners();
            self.videomonitor.emit("nextParams");
        }

        console.log("getVdieoId");
        //below assignment of videoIdArray is moved to youtube.search
        self.videoIdArray=videoidarray;

       // console.log("videoIdArray's length: ",self.videoIdArray.length);
        self.getVideoInfo(self.videoIdArray.pop());
        return;
    });

    self.on("save",function(videodetailinfo) {
        // self.videoModel.save();  //here is not finished
        if (videodetailinfo) {
            self.saveVideoInfo(videodetailinfo);
            if (self.videoIdArray.length) {
                self.getVideoInfo(self.videoIdArray.pop());
            } else {
                //self.removeAllListeners();
                //self.videomonitor.emit("nextParams");
            }
        }
        return;
    });

}

videoCrawler.prototype.extractVideoByTheme=function(queryStr){

    //question: difference between self.videoIdArray and var videoIdArray

            this.getVideoId(queryStr);
            return;
    }




videoCrawler.prototype.getVideoId=function(queryStr){
    //here is to process error, not sure it is right yet
    if(!queryStr) {
        //this.videomonitor.emit("nextParams");
        return;
    }
    if(!queryStr.query.q){
        //this.videomonitor.emit("nextParams");
        return;
    }
   var self=this;
    //youtube.clearParams();  //pay attention to this, could cause problem
    //self.youtube=null;

    self.youtube.setKey("AIzaSyCaxQpuQ1jT0QXt563_OxXi8egu9OQk6Y4");
    if(queryStr.query.relevanceLanguage)
        self.youtube.addParam("relevanceLanguage",queryStr.query.relevanceLanguage);
    if(queryStr.query.regionCode)
        self.youtube.addParam("regionCode",queryStr.query.regionCode);
    if(queryStr.query.order)
        self.youtube.addParam("order",queryStr.query.order);

    var videoArray=[];
    console.log("search word before youtube.search:",queryStr.query.q);
    self.youtube.search(queryStr.query.q,maxIDCount,function(err,search_items){
        if(err) {console.log("errors in youtube.search");return;}
        if(!search_items) {
           // console.log("nothing in search_itmes");
            return;
        }
        //console.log("the number of id: ", search_items.items.length);
        for(var i=0;i<search_items.items.length;i++){
            videoArray.push(search_items.items[i].id.videoId);
        }
        console.log("search word after youtube.search:",queryStr.query.q);
        console.log("youtube.search/videoArray :",videoArray.length);
        console.log("id:",videoArray);
        //self.videoIdArray=videoArray;
        self.emit("getVideoIdArray",videoArray);
        return;

    });
    return;
};



videoCrawler.prototype.getVideoInfo=function(videoId){
   //before save, videoinfo should be manipulated further
   //after save, the videoIdArray monitor should be triggered

    if(!videoId){
        this.emit("videoidArray");
        return;
    }
    var self=this;
    console.log("videoId is: ",videoId);
    self.youtube.getById(videoId,function(err,videodetails){
        if(!videodetails) return;
        videodetails=self.wrapVideoInfo(videodetails);
        //console.log("videoInfo is: ",videodetails);
        self.emit("save",videodetails);
        return;

    });
    /*
    if(!self.videoIdArray.length){
        self.videomonitor.emit("nextParams");
    }*/
    return;
};

videoCrawler.prototype.wrapVideoInfo=function(videodetails){
    if(!videodetails) {this.videomonitor.emit("videoIdArray");return;}
    var itemInfo=videodetails.items[0];
    if(!itemInfo) return;
    var videoUrl="https://www.youtube.com/embed/"+itemInfo.id+"?feature=oembed";
    var crawlerIp=ip.address();
    var durationStr=itemInfo.contentDetails.duration;

    //here
    //console.log('duration:',durationStr);
    var regex ;
    var regexH = new RegExp("PT(\\d+)H(\\d+)M(\\d+)S");
    var regexM = new RegExp("PT(\\d+)M(\\d+)S");
    var regexS = new RegExp("PT(\\d+)S");
    if (regexH.test(durationStr)){
        //  console.log('regexH matched');
        regex = regexH;
        durationStr.replace (regex, function (t, h,m, s) {
            //    console.log('t:%s,h:%s,m:%s,s:%s',t,h,m,s);
            var durationSec = (parseInt (h, 10) * 3600) + (parseInt (m, 10) * 60) + parseInt (s, 10);
            //    console.log('durationSec',durationSec);
            itemInfo.contentDetails.duration = durationSec;
        });
    }else if (regexM.test(durationStr)){
        // console.log('regexM matched');
        regex = regexM;
        durationStr.replace (regex, function (t, m, s) {
            //   console.log('t:%s,m:%s,s:%s',t,m,s);
            var durationSec = (parseInt (m, 10) * 60) + parseInt (s, 10);
            //   console.log('durationSec',durationSec);
            itemInfo.contentDetails.duration = durationSec;
        });
    }else if (regexS.test(durationStr)){
        //  console.log('regexS matched');
        regex = regexS;
        durationStr.replace (regex, function (t, s) {
            //    console.log('t:%s,s:%s',t,s);
            var durationSec = parseInt (s, 10);
            //    console.log('durationSec',durationSec);
            itemInfo.contentDetails.duration = durationSec;
        });
    }else{
        //  console.log("duration time can't be parsed successfully");
    }



    var completeContent={
        items:videodetails.items
    };
    var purecontent='<p id="holgaVideoId">'+itemInfo.id+"</p>";
    purecontent='<p id="holgaVideoTitle">'+itemInfo.snippet.title+'</p>';
    purecontent='<p id="holgaVideoInfo">'+JSON.stringify(completeContent)+'</p>';

    var simplefp=crypto.createHash('md5').update(purecontent).digest('hex');
    var max3hashValue=max3hash.getHash(purecontent);
    var currentTime=(new Date()).getTime();
    var category=categoryConvertion(itemInfo.snippet.categoryId);
    if(!category){
        category=itemInfo.snippet.categoryId;
    }
    var lang=langConvert(itemInfo.snippet.defaultAudioLanguage);
    if(lang==-1) return null;
    var data={
        title:itemInfo.snippet.title,
        content:purecontent,
        author:itemInfo.snippet.channelTitle,
        origin_author:itemInfo.snippet.channelTitle,
        originUrl:videoUrl,
        tags:'',
        postDate:'',
        category:category,
        crawlId:'youtubeAutoHindi',
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
        flagOff:-1,
        lang:lang
    };
    return data;
};



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



function langConvert(lang){
    if(!lang) return null;
    if(lang==='hi'){
        return 1;
    }else if(lang==='ta'){
        return 3;
    }else if(lang==='mr'){
        return 2;
    }else if(lang==='en'){
        return 0;
    }else{
        return -1; //represents others language
    }
}


videoCrawler.prototype.saveVideoInfo=function(videodetailsinfo){
    if(!videodetailsinfo){
       // console.log("videodetailsinfo doesn't exists");
        this.emit("videoidArray");
        return;
    }
    var self=this;
    var newVideoModel=new videoModel();
    newVideoModel.title=videodetailsinfo.title;
    newVideoModel.content=videodetailsinfo.content;
    newVideoModel.author=videodetailsinfo.author;
    newVideoModel.origin_author=videodetailsinfo.origin_author;
    newVideoModel.originUrl=videodetailsinfo.originUrl;
    newVideoModel.tags=videodetailsinfo.tags;
    newVideoModel.postDate=videodetailsinfo.postDate;
    newVideoModel.category=videodetailsinfo.category;
    newVideoModel.crawlId=videodetailsinfo.crawlId;
    newVideoModel.atype=videodetailsinfo.atype;
    newVideoModel.headImg=videodetailsinfo.headImg;
    newVideoModel.keywords=videodetailsinfo.keywords;
    newVideoModel.appCategory=videodetailsinfo.appCategory;
    newVideoModel.subCategory=videodetailsinfo.subCategory;
    newVideoModel.domain=videodetailsinfo.domain;
    newVideoModel.url=videodetailsinfo.url;
    newVideoModel.crawlIp=videodetailsinfo.crawlIp;
    newVideoModel.updated=videodetailsinfo.updated;
    newVideoModel.published=videodetailsinfo.published;
    newVideoModel.simplefp=videodetailsinfo.simplefp;
    newVideoModel.max3hash=videodetailsinfo.max3hash;
    newVideoModel.created=videodetailsinfo.created;
    newVideoModel.flagOff=videodetailsinfo.flagOff;
    newVideoModel.lang=videodetailsinfo.lang;

   newVideoModel.toObject({retainKeyOrder:true});  //to set variable order of each documents as original order

    var error=newVideoModel.validateSync();
    /*
    if(error.errors || error.errors.length){
        throw error;
        return null;
    }*/
    newVideoModel.save(function(err){
       if(err) {
           //console.log("can't save in mongo");
           //self.emit("videoidArray");
           //return ;
       }

       console.log("successfully inserted. inside of save function");

       return;

   });
    //console.log("out of save funciton");
    //to trigger next request of videoId
    if(self.videoIdArray.length){
        self.emit("videoidArray");
    }
    else{
        self.videomonitor.emit("nextParams");
    }
    return;
};

module.exports=videoCrawler;