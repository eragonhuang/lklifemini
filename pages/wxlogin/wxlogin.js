const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const app = getApp();
Page({
  data: {
    userInfo: {}
  },

  onLoad(options) {
  },
  
  backtopage(){
    wx.navigateBack({
      delta: 1
    });
  },
  
  onWechatLogin(e){
    //console.log("aa:"+JSON.stringify(e.detail));
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
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
      });
      app.globalData.userInfo = res.userInfo;
      app.globalData.token = res.data.token;
      wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userId', res.data.userId);
      wx.navigateBack( {delta: 1} );
      
      //设置购物车Badge
      app.globalData.cartCount = res.data.cartCount
      if(app.globalData.cartCount>0){
      console.log("app.globalData.cartCount:",app.globalData.cartCount);
      wx.setTabBarBadge({
        index: 2,
        text: String(app.globalData.cartCount)
       })
     }

    }).catch((err) => {
      console.log(err)
    })
  }
  

})