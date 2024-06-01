const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    goodsCount: 0,
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    //floorGoods: [],
    banner: [],
    channel: [],
    slideWidth: '', //滑块宽
    slideLeft: 0, //滑块位置
    totalLength: '', //当前滚动列表总长
    slideRatio: '' //滑块比例
  },
  onShareAppMessage: function () {
    return {
      title: 'NideShop',
      desc: 'sam小程序商城',
      path: '/pages/main/index'
    }
  },

  getRatio() {
    var _totalLength =  1440; //总长度（单个块宽度*总数）
    var _ratio = 100 / _totalLength * (780 / wx.getSystemInfoSync().windowWidth); //滚动列表长度与滑条长度比例
    var _showLength = 780 / _totalLength * 100; //当前显示蓝色滑条的长度(保留两位小数)
    this.setData({
      slideWidth: _showLength,
      slideRatio: _ratio
    })
  },
  
  //slideLeft动态变化
  getleft(e) {
    this.setData({
     slideLeft: e.detail.scrollLeft * this.data.slideRatio
    })
  },

  getIndexData: function () {
    let that = this;
    util.request(api.MainUrl).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          topics: res.data.topicList,
          brand: res.data.brandList,
          //floorGoods: res.data.categoryList,
          banner: res.data.banner,
          channel: res.data.channel
        });
        that.getRatio();
      }
    });
  },
  onLoad: function (options) {
    this.getIndexData();
    util.request(api.GoodsCount).then(res => {
      this.setData({
        goodsCount: res.data.goodsCount
      });
    });
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
})
