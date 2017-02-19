/**
 * Created by Jack on 2017/2/9.
 */

angular.module("videoService",[])
    .factory('Video',function($http){
        var vm=this;
        var  videoFactory={};
        videoFactory.getVideoInfo=function(){
           return $http.post("/api/getvideoinfo");

        };
        return videoFactory;


    });

