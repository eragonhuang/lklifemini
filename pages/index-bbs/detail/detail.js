const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');

var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var screenHeight = wx.getSystemInfoSync().screenHeight;
var keyHeight = 0;

//获取应用实例
const app = getApp()
Page({
  data: {
    banner: [],
    oneforum:[],
    showPinglunIdx:0,
    clickPinglunItem:0,
    clickPinglunIndex:0,
    navList: [],
    navArr:[],
    cateId: 0,
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
    prevPageArrIndex:0,  //上一页面的数组index
    deleteType: 1 //删除按钮的类型 1 删评论 2删帖子
  },
  getForumById: function (rid) {
    let that = this;
    var token = wx.getStorageSync("token");
    util.request(api.getOneForumUrl,{ token:token,Rid:rid },"POST").then(function (res) {
      if (res.ret === 0) {
        var arr = that.data.oneforum;
        arr[0] = res.forum;
        that.setData({
          oneforum: arr
        });
      }
    });
  },
  onLoad: function (options) {
    app.globalData.detailChange = 0;
    var _userid = wx.getStorageSync("userId")

    var _nav = app.globalData.navList;
    var _navArr = new Array();
    for(var i=0;i<_nav.length;i++){
      _navArr[_nav[i].id] = _nav[i].name;
    }
    var navList = [{"id":0,"name":"推荐"}];
    navList = navList.concat(app.globalData.navList);
    var arrindex = options.index;
    this.setData({
      navList: navList,
      navArr: _navArr,
      userId: _userid,
      prevPageArrIndex: arrindex
    });
    
    var forumId = options.forumId;
    this.getForumById(forumId);
  },
   //点击评论图标,显示点赞和评论按钮
  showZanAndPinglun(e){
    var rid = e.currentTarget.dataset.idx;
    if(this.data.showPinglunIdx != rid) this.hideZanAndPinglun();
    var iret = (this.data.showPinglunIdx>0)?0:rid;
    this.setData({
        showPinglunIdx: iret,
        clickPinglunItem: rid
    })
  },
 //点选和评论的隐藏通过事件委托到全页面
 hideZanAndPinglun(){
    this.setData({
      showPinglunIdx: 0
    })
 },
//评论
 clickPinglun(e){
   var forumIndex = e.currentTarget.dataset.fidx;
   var ret = util.checkJumpLogin();
   if(ret == 0) return;
   this.setData({
     ["inputPop.isShowIpnut"]: true,
     clickPinglunIndex: forumIndex
   });
   this.hideZanAndPinglun();
 },

  //点赞
 clickDianzan(e){
   var isPrased = e.currentTarget.dataset.idx;
   var forumIndex = e.currentTarget.dataset.fidx;
   var forumId = this.data.clickPinglunItem;
   var token = wx.getStorageSync("token");
   let that = this;
   console.log("forumIndex:"+forumIndex);
   util.request(api.DianzanUrl,{ ForumId:forumId,isPrased:isPrased,token:token }, "POST").then(function (res) {
     console.log("res:"+res);
     if (res.ret === 0) {
       //that.getIndexData(); 
       that.getForumById(forumId,forumIndex);
       app.globalData.detailChange = 1;
     }
   });
   this.hideZanAndPinglun();
  },
  //隐藏评论工具
  hideShowComponent(){
    this.hideZanAndPinglun();
    this.closeDelComment();
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
    //下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh() //停止下拉刷新 
  },
  //浏览图片
  previewImage: function(e){
    var that = this,
    //获取当前图片的下表
      index = e.currentTarget.dataset.index,
      forumIdx = e.currentTarget.dataset.fidx,
      //数据源
      pictures = this.data.oneforum[forumIdx].ImagesUrl;
    wx.previewImage({
    //当前显示下表
     current: pictures[index],
     //数据源
     urls: pictures
    })
   },
   //发送评论
   sendComment(e){
      var content = this.data.inputPop.inputValue;//e.detail.value;
      var forumIndex = this.data.clickPinglunIndex;
      var forumId = this.data.clickPinglunItem;
      var token = wx.getStorageSync("token");
      let that = this;
      util.request(api.AddCommentUrl,{ Content:content, ForumId:forumId,token:token }, "POST").then(function (res) {
        console.log("res:"+res);
        if (res.ret === 0) {
          that.getForumById(forumId);
          app.globalData.detailChange = 1;
        }
      });
      this.setData({
        ["inputPop.inputValue"]: ''
    })
   },
   //显示隐藏版块
   onShowCategory: function(){
     var ret = (this.data.showCategory == 1)?0:1;
     this.setData({
      showCategory: ret
     })
   },

  /* 显示输入评论框 */
  showIpnutComment: function(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
        ["inputPop.isShowIpnut"]: true,
    })
  },
  /* 关闭输入评论框 */
  closeIpnutComment: function() {
      this.setData({
          ["inputPop.isShowIpnut"]: false,
          //["inputPop.inputValue"]: '',
      })
  },
  /* 评论输入内容 */
  bindKeyInput: function(e) {
      this.setData({
          ["inputPop.inputValue"]: e.detail.inputValue,
      })
  },
  //动画集
  fadeIn:function(){
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })    
  },
  fadeDown:function(){
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),  
    })
  }, 
  submitDelete: function(e){
    //console.log("aaa:"+JSON.stringify(e.currentTarget.dataset));
    let userid = e.currentTarget.dataset.userid;
    var forumIndex = e.currentTarget.dataset.fidx;
    var forumid = e.currentTarget.dataset.forumid;
    let commentid = e.currentTarget.dataset.commentid;
    if(userid == wx.getStorageSync("userId")){
      this.setData({
        clickPinglunIndex: forumIndex,
        commentId: commentid,
        clickPinglunItem: forumid,
        deleteType: 1
      });
      this.showDelComment();
    }
    if(userid == -1 && commentid == -1){
      this.setData({
        clickPinglunItem: forumid,
        deleteType: 2
      });
      this.showDelComment();
    }
  },
  //点击评论控制
  showDelComment:function(){
    var that = this;
    setTimeout(function(){
      that.setData({
        hideModal:false,
        delCommentPop: 1
      })
    },180)
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation 
    setTimeout(function(){
      that.fadeIn();//调用显示动画
    },200)   

  },
  closeDelComment:function(){
    // this.setData({
    //   delCommentPop: 0
    // })
    var that=this; 
    var animation = wx.createAnimation({
      duration: 800,//动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown();//调用隐藏动画   
    setTimeout(function(){
      that.setData({
        hideModal:true,
        delCommentPop: 0
      })
    },100)//先执行下滑动画，再隐藏模块

  },
  deleteOperate: function(){
    if(this.data.deleteType == 1)
      this.delMyComment();
    else 
      this.deleteForum();
  },
  delMyComment:function(){
    var forumIndex = this.data.clickPinglunIndex;
    var forumId = this.data.clickPinglunItem;
    var token = wx.getStorageSync("token");
    let that = this;
      util.request(api.DelCommentUrl,{ Rid:this.data.commentId,token:token }, "POST").then(function (res) {
        console.log("res:"+res);
        if (res.ret === 0) {
          //that.getIndexData(); 
          that.getForumById(forumId,forumIndex);
          app.globalData.detailChange = 1;
        }
      });
  },
  deleteForum:function(){
    var forumId = this.data.clickPinglunItem;
    console.log("forumId:"+forumId);
    var token = wx.getStorageSync("token");
    let that = this;
      util.request(api.DelForumUrl,{ Rid:forumId,token:token }, "POST").then(function (res) {
        console.log("res:"+res);
        if (res.ret === 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length-2];
          prevPage.setData({
             delDataIndex: that.data.prevPageArrIndex
          });
          wx.navigateBack( {delta: 1} );
        }
      });
  },

  favoriteForum:function(e){
    var forumId = e.currentTarget.dataset.fid;
    console.log("forumId:"+forumId);
    var token = wx.getStorageSync("token");
    let that = this;
      util.request(api.FavoriteUrl,{ Rid:forumId,token:token }, "POST").then(function (res) {
        console.log("res:"+res);
        if (res.ret === 0) {
            wx.showToast({
              title: '收藏成功',
              icon: 'success',
              duration: 2000
            })
            let _forum = that.data.oneforum;
            _forum[0]["IsFavorite"] = 1;
            that.setData({
              oneforum: _forum
            })
            app.globalData.detailChange = 2;
        }
    });
  },
  delFavoriteForum:function(e){
    var forumId = e.currentTarget.dataset.fid;
    console.log("forumId:"+forumId);
    var token = wx.getStorageSync("token");
    let that = this;
      util.request(api.DelFavoriteUrl,{ Rid:forumId,token:token }, "POST").then(function (res) {
        console.log("res:"+res);
        if (res.ret === 0) {
            wx.showToast({
              title: '已取消收藏',
              icon: 'success',
              duration: 2000
            })
            let _forum = that.data.oneforum;
            _forum[0]["IsFavorite"] = 0;
            that.setData({
              oneforum: _forum
            })
            app.globalData.detailChange = 2;
        }
    });
  }

})
