App({
  onLaunch: function() {
    try {
      if(wx.getStorageSync("token") !== null && wx.getStorageSync("token").length > 32) {
        wx.setStorageSync("token",null);
        wx.setStorageSync("userInfo",null);
        wx.setStorageSync("userId",0);
      }
      if(wx.getStorageSync("token") !== null){
        this.globalData.userInfo = JSON.parse(wx.getStorageSync('userInfo'));
        this.globalData.token = wx.getStorageSync('token');
        this.globalData.userId = wx.getStorageSync('userId');
      }

    }catch (e) {
      console.log("userinfo exp:"+e);
    }
  },

  globalData: {
    userInfo: {
      nickName: '立即登录',
      avatarUrl: '/static/images/default.png',
      userId: 0
    },
    cartCount: 0,   //购物车商品数量
    contactNews:[{userId:5,count:3}],
    token: '',
    navList: [{"id":1,"name":"团购空间"},{"id":2,"name":"跳蚤市场"},{"id":3,"name":"房屋租赁"},{"id":4,"name":"兴趣社团"},{"id":5,"name":"其他"}],
    detailChange: 0, //记录detail页面做了变更操作，是则刷新index页面,1为 操作评论和点赞 2为操作收藏
    getUrl: function(){
      var pages = getCurrentPages()
      var currentPage = pages[pages.length-1]
      var url = currentPage.route
      var urlmap = {"pages/message/index/index":1,
                    "pages/message/contact/contact":2,
                    "pages/index/index":0,
                    "pages/trade/trade":0,
                    "pages/ucenter/user/user":0
                   };
      //定义url的类型，pages/message/index/index：1 
      // pages/message/contact/contact：2
      // pages/index/index,pages/trade/trade,pages/ucenter/user/user 等导航为0
      // 其他页面为9,表示未定义
      var ret = urlmap[url];
      ret = (ret == undefined)?9:ret;
      //console.log("current url:"+url+",ret:"+ret);
      return ret;
    }
  }
})
