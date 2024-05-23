const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
import socketObj from '../../../utils/socket' 
const app = getApp();

Page({
  data: {
    list: [{
      userid: 0,
      nickname: '聊天室',
      count: 0,
      avatar: '/static/images/chatroom.png',
      text: '热门聊天室',
      updated: ''
    },{
      userid: 0,
      nickname: '联系客服',
      count: 0,
      avatar: '/static/images/kefu.png',
      text: '联系在线客服',
      updated: ''
    }
  ],
    hasLoad: 0
  },
  goPage(e) {
    if(e.currentTarget.dataset.userid == 0) return;
    let newlist = this.data.list
    const index = e.currentTarget.dataset.index
    newlist[index].count = 0;
    this.setData({
      list: newlist
    })
    wx.navigateTo({
      url: '../contact/contact?nickname=' + e.currentTarget.dataset.name + "&userId=" + e.currentTarget.dataset.userid + "&logoUrl=" + e.currentTarget.dataset.logourl
    })
  },
  onLoad() {
    this.initSocket();
    var sd = {
      token: wx.getStorageSync("token"),
      userId: wx.getStorageSync("userId")
     };
     socketObj.send("contact_init",sd);
     this.setData({
      hasLoad: 1
    })
  },
  onHide  (){
    this.setData({
      hasLoad: 0
    })
  },
  onShow(){
    console.log("aaaa:"+this.data.hasLoad);
    if(this.data.hasLoad == 1) return;
    var sd = {
      token: wx.getStorageSync("token"),
      userId: wx.getStorageSync("userId")
     };
     socketObj.send("contact_init",sd);
  },

//SOCKET操作 
initSocket: function(){
  // var userId = wx.getStorageSync("userId");
  // var token = wx.getStorageSync("token");
  
  // var sd = {
  //  token:token,
  //  userId:userId
  // };
  // socketObj.send("contact_init",sd);
  var that = this;

  socketObj.socket.on('contact_init_push', function (data) {
    console.log("contact_init_push:"+JSON.stringify(data));
    var _list = that.data.list;
    _list.splice(2,_list.length-2);
    var dot_flag = 0;
    for(var i=0;i<data.length;i++){
       if(data[i].UnreadCnt>0) dot_flag = 1;
        _list.push({
         userid: data[i].Friendid,
         nickname: data[i].Nickname,
         count: data[i].UnreadCnt,
         avatar: data[i].LogoUrl,
         text: data[i].LastMessage,
         updated: (data[i].LastSendTime == 0)?"":util.format_date(data[i].LastSendTime)
       })
     }
    that.setData({
      list: _list
    });
    if(dot_flag == 1){
      wx.showTabBarRedDot({
        index: 2    
      });
    }
  });

  socketObj.socket.on('contact_stat_push', function (data) {
     console.log("contact_stat_push:"+JSON.stringify(data));
     var _list = that.data.list;
     var _flag = 0;
     console.log("contact_stat_push _list:"+JSON.stringify(_list));
     //var _map;
     for(var i=0;i<_list.length;i++){
        if(_list[i].userid == data.fromuser){
          //_map = _list[i];
          _list[i]["count"] = _list[i]["count"]+1;
          _list[i]["text"] = data.msg;
          _list[i]["updated"] = util.format_date(data.updated);
          _flag = 1;
        }
     }
     if(_flag == 1){
        that.setData({
          list: _list
        });
     }
   });
 
 },

})