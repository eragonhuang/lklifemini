// socket 连接插件
const io = require('./weapp.socket.io.js');
//var socketUrl = 'wss://ztda.gov.cn';
var socketUrl = 'ws://119.29.93.180:8081';
const app = getApp();
/*
 *在首页时会默认connect并保持心跳，首页控制app前后台切换断开或重连socket,
 * 聊天界面会登录拉取历史聊天信息，
 * 离开聊天reconnect
 */

class SingleObj {
  send = function(event,data){
    if(this.connected != 1){
      this.socketConnect();
    }
    if (this.socket) {
      var sendStr = JSON.stringify(data);
      //console.log("send:"+sendStr);
      this.socket.emit(event, sendStr);
    }
  }
  ping = function(){
    if(this.socket){
        this.lastSendTime = Date.now();
        var type = app.globalData.getUrl();
        this.send('chat_ping',type);
    }
  }
  login() {
    if (this.socket) {
      var userId = wx.getStorageSync("userId");
      var token = wx.getStorageSync("token");
      if(userId == null || userId == "") return;
      var sd = {
        token:token,
        userId:userId
      };
      this.send("login",sd);
    }
  }
  socketConnect = function(){
    if(this.connected == 1){
      return;
    }
    
    var opts = {
      'reconnection':false,
      'force new connection': true,
      'transports':['websocket','polling'],
      'path':'/lkchat.io'
    }
    
    const socket = this.socket = io.connect(socketUrl,opts);
    
    var self = this;
    socket.on('connect', () => {
      console.log("socketio connect success");
      this.connected = 1;
      // 此处修改为与server约定的数据、格式
      //var sendMessage = '{"token":"v3jsoc8476shNFhxgqPAkkjt678","client":"发送内容"}'
      //this.socketSendMessage(sendMessage);
      this.login(); //连接成功后登录
    })

    socket.on('open', () => {
      console.log("socketio connect");
    })
  
    socket.on('connect_error', d => {
      console.log("connect_error");
    })
  
    socket.on('connect_timeout', d => {
      console.log("connect_timeout");
    })
  
    socket.on('disconnect', reason => {
      console.log("disconnect");
      this.connected = 0;
    })
  
    socket.on('error', err => {
      console.log("error");
    })

    socket.on('login_push', function (data) {
      if(data.dot == 1){
        wx.showTabBarRedDot({
          index: 2    
        });
      }
      self.startHearbeat();  //登录成功后保持心跳
    });

    socket.on('dot_push', function (data) {
      wx.showTabBarRedDot({
        index: 2    
      });
    });

    socket.on('dot_clean_push', function (data) {
      wx.hideTabBarRedDot({
        index: 2    
      });
    });
    //this.socketLogin();
    //this.startHearbeat();
  }
  socketClose () {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
  socketReconnect () {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.connected = 0
    }
    this.socketConnect();
  }
  //心跳探测
  startHearbeat(){
    var self = this;
    this.socket.on('chat_pong',function(){
        self.lastRecieveTime = Date.now();
        var delayMS = self.lastRecieveTime - self.lastSendTime;//服务器回包延迟(ms)
        //console.log('game_pong,delayMS:'+delayMS+",now:"+self.lastRecieveTime);
    });
    this.lastRecieveTime = Date.now();
    //console.log("startHearbeat connected:"+self.sio.connected);
    if(!self.isPinging){
        self.isPinging = true;
        //每5秒探测一次心跳
        setInterval(function(){
            if(self.socket){
                self.ping();                
            }
        }.bind(this),5000);
    }
  }
}
SingleObj.getInstance = (function(){
   return function(){
    if(!this.instance){
      this.instance = new SingleObj();
    }
    return this.instance;
   }
})()

const socketObj = SingleObj.getInstance();
//socketObj.socketConnect();
export default socketObj;