var util = require('../../utils/util.js');
var api = require('../../config/api.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    channel: [],
    navList: [],
    keywordsList: [],
    categoryList: [],
    currentCategory: {},
    keyword:'全部',
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    goodsList: [],
    categoryId: 0,
    channelSelectId: 1,
    switchFlag:true,
    isBack:0,  //是否下一页面返回
    sortFlag:0   //排序flag, 0 默认空 1 综合 2销量 3价格升序 4价格倒序
  },
  init: function () {
    var that = this;
    var channelId = wx.getStorageSync("mainChannelId");
    channelId = (channelId == "")?1:channelId;
    this.setData({
      channelSelectId: channelId
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight-110-56
        });
      }
    });
    this.getCatalog();
  },
  
  getCatalog: function () {
    let that = this;
    var _channelSelectId = this.data.channelSelectId
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CatalogList).then(function (res) {
        var _channel = res.data.channel;
        var _navList = res.data.categoryList["cate_"+_channelSelectId];
        var _keywords = (_navList.length>0)?_navList[0].keywords:-1;
        var _categoryId = (_navList.length>0)?_navList[0].category_id:-1;
        that.setData({
          channel: _channel,
          navList: _navList,
          keywordsList: _keywords,
          //currentCategory: res.data.currentCategory,
          categoryList: res.data.categoryList,
          categoryId: _categoryId
        });
        that.getGoodsList(that.data.categoryId);
        wx.hideLoading();
      });
  },

  onLoad: function (options) {
    this.init()
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    if (currPage.data.isBack==1) {
      console.log(currPage.data.isBack)
      this.setData({
        isBack: 1,
      })       
    }

    if (this.data.isBack==1) {//上一页返回，不加载新内容
      this.setData({
        isBack:0,
      }) 
    } else {
      this.init()
    }
     
    //设置购物车Badge
    if(app.globalData.cartCount>0){
      console.log("app.globalData.cartCount:",app.globalData.cartCount);
      wx.setTabBarBadge({
        index: 2,
        text: String(app.globalData.cartCount)
      })
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
 
  unfoldChannel: function (event) {
    var that = this;
    if(event.currentTarget.dataset.type == 2) return
    var flag = (that.data.switchFlag)?false:true;
    that.setData({
      switchFlag: flag
    });
  },
  
  getGoodsList: function (categoryId) {
    var that = this;
    util.post(api.GoodsList, {categoryId: categoryId,keyword: that.data.keyword,sortFlag: that.data.sortFlag,page: 1, size: 1000})
      .then(function (res) {
        that.setData({
          goodsList: res.data.goodsList,
          categoryId: categoryId
        });
      });
  },

  reloadKeyword: function (event) {
     var that = this;
     var _keyword = event.currentTarget.dataset.item
     that.setData({
      keyword: _keyword
    });
     this.getGoodsList(that.data.categoryId);
  },

  reloadSort: function (event) {
    var that = this;
    var _sortflag = event.currentTarget.dataset.sortflag
    that.setData({
      sortFlag: _sortflag
   });
    this.getGoodsList(that.data.categoryId);
 },

  switchChannel: function (event) {
    var that = this;
    var _navList = that.data.categoryList['cate_'+event.currentTarget.dataset.id]
    var _keywords = _navList[0].keywords
    var _categoryId = _navList[0].category_id;
    that.setData({
      channelSelectId: event.currentTarget.dataset.id,
      navList: _navList,
      keywordsList: _keywords,
      categoryId: _categoryId,
      switchFlag: true,
      keyword:"全部"
    });
    this.getGoodsList(_categoryId);
  },

  switchCate: function (event) {
    var that = this;
    var currentTarget = event.currentTarget;
    var cateId = currentTarget.dataset.cateid;
    var index = currentTarget.dataset.index+1;
    console.log("index:",index)
    //console.log("categoryList:",that.data.categoryList)
    var _navList = that.data.categoryList['cate_'+this.data.channelSelectId]
    console.log("_navList:",_navList)
    var _keywords = _navList[index-1].keywords
    that.setData({
      categoryId: cateId,
      keywordsList: _keywords,
      keyword:"全部"
    });
    if (that.data.categoryId == currentTarget.dataset.id) {
      return false;
    }
   // this.getCurrentCategory(event.currentTarget.dataset.id);
   this.getGoodsList(cateId);
  },
  
  openGoods(event) {
    var goodsId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods/goods?id=' + goodsId,
    });
  },

  addCart(event) {
    var goodsId = event.currentTarget.dataset.goodsid
    console.log("GoodsId:",goodsId);
    
    //添加到购物车
    util.request(api.CartAdd, { goodsId: goodsId, number: 1, productId: -1}, "POST")
    .then(function (res) {
      let _res = res;
      if (_res.errno == 0) {
        wx.showToast({
          title: '添加成功'
        });
      //更新购物车Badge
      app.globalData.cartCount++
      if(app.globalData.cartCount>0){
        console.log("app.globalData.cartCount:",app.globalData.cartCount);
        wx.setTabBarBadge({
          index: 2,
          text: String(app.globalData.cartCount)
        })
      }

      } else {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: _res.errmsg,
          mask: true
        });
      }

    });

  }

})