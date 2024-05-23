// pages/contact/contact.js
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
import socketObj from '../../../utils/socket' 
const app = getApp();
var inputVal = '';
//var msgList = [];
var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var keyHeight = 0;

Page({

 /**
  * 页面的初始数据
  */
 data: {
  msgList: [],
  scrollHeight: '99vh',
  inputBottom: '0px',
  tabheigth: 14,
  toUserId: 0,
  toLogoUrl:'',
  myLogoUrl:'',
  pageSize: 20, //每页条数
  pageIndex: 1, //页码
  isEndPage: 0, //是否已是末页
  getmoreLock: 0,
  isLoading: false
 },

 /**
  * 生命周期函数--监听页面加载
  */
 onLoad: function(options) {

  var toUserId = options.userId;
  console.log("options.logoUrl:"+options.logoUrl);
  var logoUrl = options.logoUrl;
  var nickname = options.nickname;
  var userInfo = app.globalData.userInfo;
  this.setData({
    toUserId: toUserId,
    otherLogoUrl: logoUrl,
    myLogoUrl: userInfo.avatarUrl,
   })
  this.initSocket();
  wx.setNavigationBarTitle({
    title: nickname
  })
  //app.globalData.contactNews.push({userId:6,count:2});
  console.log("contactNews:"+JSON.stringify(app.globalData.contactNews));
 },
/**
  * 生命周期函数--监听页面显示
  */
onShow: function() {
  console.log("lauchContactOnshow");
},
onHide: function() {
 //socketObj.socketClose();
 console.log("lauchContactOnhide:");
},
onUnload: function() {
  //socketObj.socketReconnect();
  socketObj.socket.removeAllListeners('message_push');
  console.log("onUnLoad:");
 },
 
//SOCKET操作 
initSocket: function(){
  var userId = wx.getStorageSync("userId");
  var token = wx.getStorageSync("token");
  var toUserId = this.data.toUserId;
  
  var sd = {
   token:token,
   userId:userId,
   sendUserId:toUserId
  };
  socketObj.send("chat_init",sd);
  var that = this;
  socketObj.socket.on('chat_init_push', function (data) {
   //console.log("login_result:"+JSON.stringify(data));
   //msgList.splice(0,msgList.length);
   var msgList = that.data.msgList;
   for(var i=0;i<data.length;i++){
       var speaker = 'to';
       if(data[i].SendUserid == userId) speaker = 'my'
       msgList.push({
         uuid: data[i].uuid,
         speaker: speaker,
         contentType: 'text',
         content: data[i].Message
       })
    }
    that.setData({
      msgList,
      toView: 'msg-0'
    });
  });
 
  socketObj.socket.on('message_push', function (data) {
    console.log("message_push:"+JSON.stringify(data));
    var msgList = that.data.msgList;
    msgList.push({
      speaker: 'to',
      contentType: 'text',
      content: data.msg
    })
    that.setData({
      toView: 'msg-1'
    });
    that.setData({
      msgList,
      toView: 'msg-0'
    });
  })
 
 },
 /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
 onPullDownRefresh: function() {
    console.log("onPullDownRefresh");
 },

 /**
  * 页面上拉触底事件的处理函数
  */
 onReachBottom: function() {

 },

 /**
  * 获取聚焦
  */
 focus: function(e) {
  keyHeight = e.detail.height;
  console.log("keyHeight:"+keyHeight);
  this.setData({
   scrollHeight: (windowHeight - keyHeight) + 'px'
  });
  this.setData({
   inputBottom: keyHeight + 'px',
   toView: 'msg-0',
   tabheigth: 3
  })
  //计算msg高度
  // calScrollHeight(this, keyHeight);
 },

 //失去聚焦(软键盘消失)
 blur: function(e) {
  this.setData({
   scrollHeight: '99vh',
   inputBottom: '0px',
   tabheigth: 14
  })
  this.setData({
   toView: 'msg-0'
  })
 },

 /**
  * 发送点击监听
  */
 sendClick: function(e) {
    if(e.detail.value.trim() == "") return;
    var msgList = this.data.msgList;
    msgList.push({
    speaker: 'my',
    contentType: 'text',
    content: e.detail.value
    })
    inputVal = '';
    this.setData({
     msgList,
     inputVal,
     toView: 'msg-0'
    });
    var sd = {
      userId: this.data.toUserId,
      msg:e.detail.value
    };
    socketObj.send("message",sd);
 },

 getmore:function(){
   console.log("getmore:");
   if(this.data.getmoreLock == 1) return; //锁住免得被同时多次拉取
   this.setData({ getmoreLock: 1 });
   var pageSize = this.data.pageSize;
   var uuid_0 = this.data.msgList[0].uuid;
   if(uuid_0 == undefined) return;
   if(this.data.isEndPage == 1) return;
   var token = wx.getStorageSync("token");
   var toUserId = this.data.toUserId;
   var userId = wx.getStorageSync("userId");
   var that = this;
   this.setData({ isLoading: true });
    util.request(api.ChatUrl,{token:token,uuid:uuid_0,pageSize:pageSize,userId:userId,toUserId:toUserId},"POST").then(function (res) {
      if (res.ret === 0) {
          var _list = [];
          var _isEndPage = 0;
          if(res.list.length < 10) _isEndPage = 1;
          for(var i=0;i<res.list.length;i++){
            var speaker = 'to';
            if(res.list[i].SendUserid == userId) speaker = 'my'
            _list.push({
              uuid: res.list[i].uuid,
              speaker: speaker,
              contentType: 'text',
              content: res.list[i].Message
            })
         }
          _list = _list.concat(that.data.msgList);
           that.setData({ getmoreLock: 0 });
           setTimeout(() => {
            that.setData({
              msgList: _list,
              isEndPage: _isEndPage,
              isLoading:false,
              toView: 'msg-' + (_list.length - res.list.length)
             });
          }, 1500)

      }
    });

 }

})