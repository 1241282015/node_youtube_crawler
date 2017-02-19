
/**
 * Created by Jack on 2017/2/11.
 */
var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var videoSchema=new Schema({
    title:{
        type:String,
        required:[true,"field title can't be empty"]
    },
    content:{
        type:String,
        required:[true,"field content can't be empty"]
    },
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
    updated:String,
    published:Boolean,
    simplefp:String,
    max3hash:String,
    created:String,
    flagOff:Number,
    lang:{
        type:Number,
        required:[true,"field lang can't be empty"]
    },
});


module.exports=mongoose.model("videodetails",videoSchema);