/*
 * this file is used to create event-base monitor, kind of distribution center
 *

 */
var events=require("events");
var util=require("util");
//var videoConfigParams={};
var fs=require("fs");
var filepath="./file.json";
var dataModel=require('./dataModel.js');
var cluster=require("cluster");


var VideoMonitor=function(){
    this.videocrawler=new (require('./videocrawler.js'))(this);
    events.EventEmitter.call(this);


};

util.inherits(VideoMonitor,events.EventEmitter);



VideoMonitor.prototype.extractVideo=function(){
    var Params=readingFile().toString();
    if(!Params){
        console.log("nothing returned from file './file.json'");
        return;
    }
    var self=this;
    self.paramsArray=JSON.parse(Params);

    //console.log(typeof(paramsArray));
    self.on("nextParams",function(){
        if(self.paramsArray && self.paramsArray.length){
            var paramString=self.paramsArray.pop();
            self.videocrawler.extractVideoByTheme(paramString);

        }else{
            //console.log("over,index is :",this.videocrawler.index);


        }
        return;
    });
    self.on("error",function(err){
        if(err){
            console.log("error appears in videomonitor' event", err);
            return;
        }

    });
    self.videocrawler.extractVideoByTheme(self.paramsArray.pop());
    setTimeout(self.extractVideo,3600*1000);

    return;


}

function readingFile(){
    return fs.readFileSync(filepath,"utf-8");

}

/*
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
]
*/
/*
function extractByTopicId(){}
function extractByChannelId(){}
*/


module.exports=VideoMonitor;


