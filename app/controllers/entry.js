/**
 * Created by Jack on 2017/2/11.
 * this file is the entry of whole program and here is the timer used to set runtime
 */

var YouTube=require("youtube-node");
var videoInfoHindi=require('./videoInfoHindi.js');
var videoConfigParams={};
var dataModel=require('./dataModel.js');
var youtube = new YouTube();


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


