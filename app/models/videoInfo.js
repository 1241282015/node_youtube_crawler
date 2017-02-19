/**
 * Created by Jack on 2017/2/7.
 */
var mongoose=require("mongoose");
var Schema=mongoose.Schema;


var schema=new Schema({
    title:String,
    content:String,
    author:String,
    origin_author:String,
    originUrl:String,
    tags:String,
    postDate:String,
    category:String,
    crawlId:String,
    atype:Number,
    headImg:String,
    keywords:Array,
    appCategory:String,
    subCategory:String,
    domain:String,
    url:String,
    crawlIp:String,
    updated:Number ,
    published:String,
    simplefp:String,
    max3hash:String,
    created:String,
    flagOff:String,
    lang:String
});


module.exports=mongoose.model("videoinfos",schema);




