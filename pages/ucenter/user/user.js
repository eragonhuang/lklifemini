const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    orderCount: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },

  /**
   * 获取当前用户信息
   */
  getUserDetail: function() {
    let _this = this;
    app._get('user.index/detail', {}, function(result) {
      _this.setData(result.data);
    });
  },

  /**
   * 订单导航跳转
   */
  onTargetList(e) {
    // 记录formid
    // App.saveFormId(e.detail.formId);
    let urls = {
      favorite: '/pages/ucenter/user/list/list?type=0',
      posting: '/pages/ucenter/user/list/list?type=1',
      comment: '/pages/ucenter/user/list/list?type=2',
      pairse: '/pages/ucenter/user/list/list?type=3'
    };
    // 转跳指定的页面
    wx.navigateTo({
      url: urls[e.currentTarget.dataset.type]
    })
  },

  /**
   * 菜单列表导航跳转
   */
  onTargetMenus(e) {
    // 记录formId
    // App.saveFormId(e.detail.formId);
    wx.navigateTo({
      url: '/' + e.currentTarget.dataset.url
    })
  },
  
  onUserInfoClick: function() {
   if (wx.getStorageSync('token')) {
      console.log("token:"+wx.getStorageSync('token'));
    } else {
      wx.navigateTo({
        url: '/pages/wxlogin/wxlogin'
      })
    }
  },
/* 
  showLoginDialog() {
    this.setData({
      showLoginDialog: true
    })
  },

  onCloseLoginDialog () {
    this.setData({
      showLoginDialog: false
    })
  },

 onWechatLogin(e) {
    this.data.showLoginDialog = false;
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
        this.onCloseLoginDialog();
        return false
      }
      wx.showToast({
        title: '微信登录失败',
      })
      return false
    }
    util.login().then((res) => {
      return util.request(api.LoginUrl, {
        code: res,
        userInfo: JSON.stringify(e.detail.userInfo)
      }, 'POST');
    }).then((res) => {
      console.log(res)
      if (res.ret !== 0) {
        wx.showToast({
          title: '微信登录失败!',
        })
        return false;
      }
      console.log("JSON.stringify(e.detail):"+JSON.stringify(res.userInfo));
      // 设置用户信息
      this.setData({
        userInfo: res.userInfo,
        showLoginDialog: false
      });
      app.globalData.userInfo = res.userInfo;
      app.globalData.token = res.data.token;
      wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
      wx.setStorageSync('token', res.data.token);
    }).catch((err) => {
      console.log(err)
    }) 
  }*/


})