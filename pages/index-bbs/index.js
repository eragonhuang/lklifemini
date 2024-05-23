const util = require('../../utils/util.js');
const api = require('../../config/api.js');
import socketObj from '../../utils/socket'

var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var screenHeight = wx.getSystemInfoSync().screenHeight;
var keyHeight = 0;

//获取应用实例
const app = getApp()
Page({
  data: {
    banner: [],
    forums:[],
    showPinglunIdx:0,
    clickPinglunItem:0,
    clickPinglunIndex:0,
    avatarUrl:null,
    //scrollHeight: '100vh',
    //inputBottom: 0,
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
    delDataIndex: -1,  // 删除帖子index
    addFlag: 0, //添加标志
    detailInfo: {
      forumId: 0, //帖子id
      arrIndex: -1 //所在数组index
    },
    //showMoreComment: true,
    //downUpImages:"/static/images/down_min.png"
  },
  onShareAppMessage: function () {//转发
    return {
      title: 'LKlife',
      desc: '桃源居社区',
      path: '/pages/index/index'
    }
  },

  getIndexData: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let that = this;
    var cateId = this.data.cateId;
    var pageSize = this.data.pageSize;
    var pageIndex = this.data.pageIndex;
    var token = wx.getStorageSync("token");
    util.request(api.IndexUrl,{ cateId:cateId,token:token,pageIndex:pageIndex,pageSize:pageSize },"POST").then(function (res) {
      if (res.ret === 0) {
        for(var i in res.forum){
          res.forum[i].downUpImg = "/static/images/down_min.png";
          res.forum[i].showMore = true;
        }
        var arr = that.data.forums;
        if(pageIndex == 1) arr = res.forum;
        else arr = arr.concat(res.forum);
        var _isEndPage = 0;
        if(res.forum.length < 10) _isEndPage = 1;
        var bannerArr = that.data.banner;
        if(bannerArr.length == 0) bannerArr = res.banner;
        that.setData({
          banner: bannerArr,
          forums: arr,
          isEndPage: _isEndPage
        });
        wx.hideNavigationBarLoading() //完成停止加载
      }

    });
  },
  getForumById: function (rid,arrindex) {
    var arr = this.data.forums;
    if(arr[arrindex].Rid != rid) return;
    let that = this;
    var token = wx.getStorageSync("token");
    util.request(api.getOneForumUrl,{ token:token,Rid:rid },"POST").then(function (res) {
      if (res.ret === 0) {
        res.forum.downUpImg = arr[arrindex].downUpImg;
        res.forum.showMore = arr[arrindex].showMore;
        arr[arrindex] = res.forum;
        that.setData({
          forums: arr
        });
      }
    });
  },
  //跳转发帖
  jumpToPosting: function(){
    var ret = util.checkJumpLogin();
    if(ret == 0) return;
    this.setData({
      addFlag: 0,
      delDataIndex: -1
    })
    wx.navigateTo({
      url: '/pages/index/posting/posting?modId='+this.data.cateId
    });
  },
  jumpToDetail: function(e){
    var id = e.currentTarget.dataset.forumid;
    var idx = e.currentTarget.dataset.forumidx;
    this.setData({
      addFlag: 0,
      delDataIndex: -1,
      ["detailInfo.forumId"]: id,
      ["detailInfo.arrIndex"]: idx
    })

    this.setData({
      ["inputPop.isShowIpnut"]: false,
      //["inputPop.inputValue"]: '',
  })
    if(id == 0) return;
    wx.navigateTo({
      url: '/pages/index/detail/detail?forumId=' + id + '&index=' + idx
    });    
  },
  jumpToOther:function(e){
    var userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: '/pages/ucenter/user/other/other?userId=' + userId
    }); 
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
  onLoad: function (options) {
    var _nav = app.globalData.navList;
    var _navArr = new Array();
    for(var i=0;i<_nav.length;i++){
      _navArr[_nav[i].id] = _nav[i].name;
    }
    var navList = [{"id":0,"name":"推荐"}];
    navList = navList.concat(app.globalData.navList);
    this.setData({
      navList: navList,
      navArr: _navArr
    });
    this.getIndexData();
    socketObj.socketConnect();
    //socketObj.socketLogin();
    //监听小程序切回前台事件
    wx.onAppShow(function(res){
      socketObj.socketConnect();
      console.log("lauchAppOnshow:");
    });
    //监听小程序切后台事件
    wx.onAppHide(function(res){
      socketObj.socketClose();
      console.log("lauchAppOnhide:");
    });
    //app.globalData.contactNews.push({userId:6,count:33});

  },
  onShow: function () {
    // 页面显示
    var pages = getCurrentPages();
    var currPage = pages[pages.length-1];
    //console.log("currPage:"+JSON.stringify(currPage));
    console.log("id:"+this.data.delDataIndex);
    if(this.data.delDataIndex != -1){
       wx.showToast({
         title: '删除成功',
         icon: 'success',
         duration: 1000
       })
       let _forums = this.data.forums; 
        _forums.splice(this.data.delDataIndex, 1);
        this.setData({
          forums: _forums
        })
    }
    if(this.data.addFlag == 1){
      wx.showToast({
        title: '发送成功',
        icon: 'success',
        duration: 1000
      })
      this.getIndexData(); 
    }
    this.setData({
      addFlag: 0,
      delDataIndex: -1
    })
    //手动从detail页面返回时刷新
    if(app.globalData.detailChange == 1 && this.data.detailInfo.forumId != 0 && this.data.detailInfo.arrIndex != -1){
      this.getForumById(this.data.detailInfo.forumId,this.data.detailInfo.arrIndex);
      app.globalData.detailChange = 0;
    }
  },
  onHide: function () {
    // 页面隐藏
    //var activeRrl = app.route; 
    //console.log("activeRrl222:"+JSON.stringify(activeRrl));
  },
  onUnload: function () {
    // 页面关闭
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      pageIndex: 1
    });
    this.getIndexData();
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
    this.getIndexData();
    /*wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function () {
       wx.hideNavigationBarLoading() //完成停止加载
    }, 1000);*/
  },
  //滚动页面
  onPageScroll:function(){
    this.closeDelComment();
  },
  //点击 tab 时触发
  onTabItemTap: function(){
    this.closeDelComment();
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
          /*var arr = that.data.forums;
          arr[forumIndex].downUpImg = false;
          arr[forumIndex].showMore = "/static/images/up_min.png";
          that.setData({
            forums: arr
          });*/
          that.getForumById(forumId,forumIndex);
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
   //切换版块
   switchCate: function (event) {
    if (this.data.cateId == event.currentTarget.dataset.id) {
      return false;
    }
    //ScrollView.scrollTo(0,0);
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {//这里iphone5机型兼容不好
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    console.log("scrollLeft:"+that.data.scrollLeft);
    console.log("scrollTop:"+that.data.scrollTop);
    this.setData({
      cateId: event.currentTarget.dataset.id,
      pageIndex: 1,
      showCategory: 1,
      scrollTop: 0
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    this.getIndexData();
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
  followComment: function(e){
    let userid = e.currentTarget.dataset.userid;
    var forumIndex = e.currentTarget.dataset.fidx;
    var forumid = e.currentTarget.dataset.forumid;
    let commentid = e.currentTarget.dataset.commentid;
    if(userid == wx.getStorageSync("userId")){
      this.setData({
        clickPinglunIndex: forumIndex,
        commentId: commentid,
        clickPinglunItem: forumid
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
        }
      });
  },
  showMoreComment:function(e){
    let  idx = e.currentTarget.dataset.idx;
    let  _flag = e.currentTarget.dataset.flag;
    var flag = (_flag)?false:true;
    var src = (_flag)?"/static/images/up_min.png":"/static/images/down_min.png";
    
    var _forums = this.data.forums;
    _forums[idx].showMore = flag;
    _forums[idx].downUpImg = src;
    this.setData({
      forums: _forums
    })
  }

})
