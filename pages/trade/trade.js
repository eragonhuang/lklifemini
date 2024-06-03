var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    channel: [],
    navList: [],
    categoryList: [],
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    goodsList: [],
    selectId: 0,
    channelSelectId: 0,
    switchFlag:true
  },
  init: function () {
    var that = this;
    var channelId = wx.getStorageSync("mainChannelId");;
    this.setData({
      channelSelectId: channelId
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight-100
        });
      }
    });
    this.getCatalog();
  },
  
  getCatalog: function () {
    //CatalogList
    let that = this;
    let _channelSelectId = that.data.channelSelectId
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CatalogList).then(function (res) {
        var _channel = res.data.channel;
        var _navList = res.data.categoryList["cate_"+_channelSelectId]
        var _categoryId = _navList[0].category_id;
        that.setData({
          channel: _channel,
          navList: _navList,
          //currentCategory: res.data.currentCategory,
          categoryList: res.data.categoryList,
          selectId: _categoryId
        });
        that.getGoodsList(that.data.selectId);
        wx.hideLoading();
      });
    
  },

  onLoad: function (options) {
    var that = this;
    this.init()
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.init()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
 
  unfoldChannel: function (event) {
    var that = this;
    var flag = (that.data.switchFlag)?false:true;
    that.setData({
      switchFlag: flag
    });
  },
  
  getGoodsList: function (categoryId) {
    var that = this;
    util.post(api.GoodsList, {categoryId: categoryId, page: 1, size: 1000})
      .then(function (res) {
        that.setData({
          goodsList: res.data.goodsList,
          selectId: categoryId
        });
      });
  },

  switchChannel: function (event) {
    var that = this;
    var _navList = that.data.categoryList['cate_'+event.currentTarget.dataset.id]
    var _categoryId = _navList[0].category_id;
    that.setData({
      channelSelectId: event.currentTarget.dataset.id,
      navList: _navList,
      selectId: _categoryId,
      switchFlag: true
    });
    this.getGoodsList(_categoryId);
  },

  switchCate: function (event) {
    var that = this;
    var currentTarget = event.currentTarget;
    var cateId = event.currentTarget.dataset.cateid;
    that.setData({
      selectId: cateId
    });
    if (that.data.selectId == event.currentTarget.dataset.id) {
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
  }

})