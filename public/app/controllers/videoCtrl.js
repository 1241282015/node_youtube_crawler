/**
 * Created by Jack on 2017/2/7.
 */

angular.module("videoCtrl",['videoService'])
    .controller("videoController",function($scope,$http,Video){
        var vm=this;
        $scope.test="hello world";
        //alert("yes");

        Video.getVideoInfo().then(function (data) {
            if(data.data.success){
                $scope.videoInfo=data.data.videoinfo;
                //vm.tableParams=new NgTableParams({},{dataset:data});
                alert("fetch data successfully");

            }
        });


        alert("after the iteration");

    });
