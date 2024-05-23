const util = require('../../../../utils/util.js');
const api = require('../../../../config/api.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    myforum:[],
    showPinglunIdx:0,
    clickPinglunItem:0,
    clickPinglunIndex:0,
    avatarUrl:null,
    //scrollHeight: '100vh',
    //inputBottom: 0,
    navList: [],
    navArr:[],
    userId: 0,
    loginUserId: 0,
    userInfo:{
      logo:'',
      nickname:''
    },
    scrollLeft: 0,
    scrollHeight: wx.getSystemInfoSync().windowHeight,
    scrollTop: 0,
    showCategory: 0, //是否显示版块
    inputPop: {
      inputType: 'comment', //comment(评论)，relation（自定义关系）
      isShowIpnut: false, //输入弹框
      inputValue: '', // 实时输入内容
      inputMaximum: 140 //最大可输入字数
    },
    pageSize: 10, //每页条数
    pageIndex: 1, //页码
    isEndPage: 0, //是否已是末页
    
    delCommentPop: 0,
    hideModal: true, //删除评论弹框
    animationData: {}, //删除评论动画 
    commentId: 0, //要操作的评论id
    forumId: 0,
    delDataIndex: -1
  },
  getMyForum: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let that = this;
    var token = wx.getStorageSync("token");
    var pageSize = this.data.pageSize;
    var pageIndex = this.data.pageIndex;
    var userId = this.data.userId;
    util.request(api.OtherListUrl,{ token:token,userId:userId,pageIndex:pageIndex,pageSize:pageSize },"POST").then(function (res) {
      if (res.ret === 0) {
        var arr = that.data.myforum;
        if(pageIndex == 1) arr = res.forum;
        else arr = arr.concat(res.forum);
        var _isEndPage = 0;
        if(res.forum.length < 10) _isEndPage = 1;
        that.setData({
          myforum: arr,
          isEndPage: _isEndPage,
          ['userInfo.logo']: res.obj.LogoUrl,
          ['userInfo.nickname']: res.obj.Nickname
        });
        wx.hideNavigationBarLoading() //完成停止加载
      }
    });
  },
  onLoad: function (options) {
    var userId = options.userId;
    var loginUserId = wx.getStorageSync('userId');
    this.setData({
      userId: userId,
      loginUserId: loginUserId
    });
    this.getMyForum();
  },
   
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    console.log("delDataIndex:"+this.data.delDataIndex);
    if(this.data.delDataIndex != -1){
       wx.showToast({
         title: '删除成功',
         icon: 'success',
         duration: 1000
       })
       let _forums = this.data.myforum; 
        _forums.splice(this.data.delDataIndex, 1);
        this.setData({
          myforum: _forums
        })
    }
    if(app.globalData.detailChange != 0){
      this.getMyForum();
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      pageIndex: 1
    });
    this.getMyForum();
    //wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function () {
       //wx.hideNavigationBarLoading() //完成停止加载
       wx.stopPullDownRefresh() //停止下拉刷新 
    }, 500);
  },
  //上拉加载
  onReachBottom: function() {
    if(this.data.isEndPage == 1) return;
    var _pageIndex = this.data.pageIndex;
    _pageIndex++;
    this.setData({
      pageIndex: _pageIndex
    });
    this.getMyForum();
  },
  //浏览图片
  previewImage: function(e){
    var that = this,
    //获取当前图片的下表
      index = e.currentTarget.dataset.index,
      forumIdx = e.currentTarget.dataset.fidx,
      //数据源
      pictures = this.data.forums[forumIdx].ImagesUrl;
    wx.previewImage({
    //当前显示下表
     current: pictures[index],
     //数据源
     urls: pictures
    })
   },
   jumpToDetail: function(e){
     var id = e.currentTarget.dataset.forumid;
     var idx = e.currentTarget.dataset.idx;
     this.setData({
        delDataIndex: -1
     })
     if(id == 0) return;
     wx.navigateTo({
       url: '/pages/index/detail/detail?forumId=' + id + '&index=' + idx
     });
   },
  //切换版块
  switchType: function (event) {
    if (this.data.type == event.currentTarget.dataset.id) {
      return false;
    }
    //ScrollView.scrollTo(0,0);
    var that = this;
    this.setData({
      type: event.currentTarget.dataset.id,
      pageIndex: 1,
      showCategory: 1,
      scrollTop: 0
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    this.getMyForum();
  },

  sendMsg: function(event){
    var userId = event.currentTarget.dataset.userid;
    var logourl = event.currentTarget.dataset.logourl;
    var nickname = event.currentTarget.dataset.name;
    console.log("userId222:"+userId);
    wx.navigateTo({
      url: '/pages/message/contact/contact?userId='+userId+'&logoUrl='+logourl+"&nickname="+nickname
    });
  }

})
