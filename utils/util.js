var api = require('../config/api.js')

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function format_date(timestamp){
  var now = Date.parse(new Date())/1000;
  var t = now - timestamp + 1;
  t = (t<0)?1:t;
  var f = [{"31536000":'年'},{"2592000":'个月'},{"604800":'星期'},{"86400":'天'},{"3600":'小时'},{"60":'分钟'},{"1":'秒'}];
  for(var i=0;i<f.length;i++){
      for(var key in f[i]){
          //alert(key);
          //alert(f[i][key]);
          var c = Math.floor(t/parseInt(key));
          if (0 != c) {
            return c+f[i][key]+'前';
          }
      }
  }
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  console.log(url);
  return new Promise(function (resolve, reject) {
    console.log(url);
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        //'Content-Type': 'application/json',
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        'X-Lkshop-Token': wx.getStorageSync('token')
      },
      success: function (res) {
        console.log("success");
        console.log(res);
        if (res.statusCode == 200) {

          if (res.data.errno == -8) {
             //需要登录后才可以操作
             wx.navigateTo({
               url: '/pages/wxlogin/wxlogin'
             });
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }

      },
      fail: function (err) {
        reject(err)
        console.log("failed")
      }
    })
  });
}

function get(url, data = {}) {
  return request(url, data, 'GET')
}

function post(url, data = {}) {
  return request(url, data, 'POST')
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        if (res.detail.errMsg === 'getUserInfo:ok') {
          resolve(res);
        } else {
          reject(res)
        }
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

/**
 * 校验登录态
 */
function checkJumpLogin() {
  var ret = 0;
  if(wx.getStorageSync("token") === null || wx.getStorageSync("token") == ""){
    ret = 0;
    //需要登录后才可以跳转
    wx.navigateTo({
      url: '/pages/wxlogin/wxlogin'
    });
  }else{
    ret = 1;
  }
  return ret;
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}


module.exports = {
  formatTime,
  format_date,
  request,
  get,
  post,
  redirect,
  showErrorToast,
  checkSession,
  login,
  getUserInfo,
  checkJumpLogin
}


