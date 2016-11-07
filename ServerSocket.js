var fs = require('fs');
var https = require('https');

var http = require('http');
var express  = require('express');
var sio = require('socket.io');
var ws = require('ws');


var app  = express();
var server  = http.createServer(app);
server.listen(4000,'192.168.1.108',function () {
  console.log('server start up');
});
//利用书上方法监听
var io = sio.listen(server);
//利用ws模块监听
var wss = new ws.Server({server: server});
var wsDic = {};

var anotherHalf ={};
var male = [];
var female = [];
var socketObj_dic = new Array();
app.get('/',function (req, res){
  res.write('hello this is red role');
  res.end();
});
app.get('/match/:id/:sexual',function (req, res){
  if(req.params.id&&req.params.sexual){
    var id = req.params.id;
    var sexual = req.params.sexual;
    console.log(id);
    console.log(sexual);
      if(sexual == 'male'){
        if(female.length == 0){
          male.unshift(id);
          res.write('null');
          res.end();
        }else{
          var dic = {};
          dic['sex'] = 'female';
          dic['id'] = female.pop();
          anotherHalf[dic['id']] = id;
          res.write(JSON.stringify(dic));
          res.end();
        }
      }
      if(sexual == 'female'){
        if(male.length == 0){
          female.unshift(id);
          res.write('null');
          res.end();
        }else{
          var dic = {};
          dic['sex'] = 'male';
          dic['id'] = male.pop();
          anotherHalf[dic['id']] = id;
          res.write(JSON.stringify(dic));
          res.end();
        }
      }
    }else{
      res.write(JSON.stringify('error'));
      res.end();
    }
});
app.get('/getAnotherHalf/:id',function (req, res){
  var id = req.params.id;
  if(anotherHalf[id]){
  res.write(JSON.stringify(anotherHalf[id]));
}else{
  res.write(JSON.stringify('null'));
}
  res.end();
});
//
io.sockets.on('connect',function (socket){
  console.log('connect');
  socket.send('success');
});
//

wss.on('connection',function ( ws ){
  ws.on('message', function ( message ) {
    message = JSON.parse(message);
    if ( typeof message == 'string' || typeof message == 'number' ) {
      //wss.clients.forEach(function each(client){
      //  if(client == ws.client){
          //console.log(message+'___');
          //wsDic[message] = client;
          //console.log(wsDic[message]);
      //  }
      //});
      console.log(message);
      wsDic[message] = ws;
      //console.log(wsDic[message]);
    }
    if( typeof message == 'object' ){
      //console.log(wsDic.length);
      //console.log(message[0]);
      //console.log(message[1]);
      wsDic[message['partner']].send(message['content'],function (){
        ws.send('success');
      });

      /*
      wss.clients.forEach(function each(client){
        console.log(wsDic[message[0]]);
        if(client == wsDic[message[0]])
          client.send(message[1],function (){
            console.log('success one to one');
          });
      });
      */
    }
  });
});
