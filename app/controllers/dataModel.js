var fs=require('fs');


/*
 *structure of params from webpage 
 *{
 *name:'HindiVideo'
 *params:{
 *  part:'snippet',
 *  relevanceLanguage:'hi',
 *  regionCode:'in'
 *}
 */
var Params=[{name:'sports news',query:{relevanceLanguage:'en',q:'sports'}},{name:'fun story',query:{relevanceLanguage:'en',q:'fun'}}];

exports.saveParams=function(req,res){
  if((!req) || (!req.body)) return;

  //for(var i=0;i<req.body.length;i++){
      
  //}
  var queryStr={
    name:req.body.name,
    query:{
      relevanceLanguage:req.body.relevanceLanguage,
      q:req.body.q,
      regionCode:req.body.regionCode,
      order:req.body.order
    }
  };
  Params.push(queryStr);
  fs.writeFileAsync(filepath,Params,function(err){if(err) console.log('writing files failed');});
//  console.log(req.params);
//  console.log(req.body);
  res.render('addConfig',{keywords:Params});

}

exports.getParams=function(){

  return Params;
}



exports.deleteParams=function(req,res){
  if((!req) ||(!req.body.deleteKeywords)){
    res.send("failed, request hasn't been successfully submitted");
  }
  var delParam=req.body.deleteKeywords.split(',');
  for(var i=0;i<delParam.length;i++){
    for(var j=0;j<Params.length;j++){
       console.log('',delParam[i]);
       if(Params[j].name===delParam[i]){
          var array1=Params.slice(0,j);
          var array2=Params.slice(j+1);
          console.log('array1:',array1); 
          Params=array1.concat(array2);   
         console.log('array2:',array2);
         console.log('Params:',Params); 
       }else{
         continue;
       }
    }
  }
  console.log('this is in deleteParams');
  //console.log(Params);
  res.render('addConfig',{keywords:Params});

}














