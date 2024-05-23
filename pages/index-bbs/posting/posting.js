var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    array: [],
    selIndex: 0,
    inputCnt:0,
    inputVal:"",
    imageList:[],
    imagesUrl:""
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      selIndex: e.detail.value
    })
  },
  bindWordLimit: function (e) {
    this.setData({
      inputVal:e.detail.value,
      inputCnt: e.detail.value.length
    })
  },
  onLoad: function (options) {
    var modId = options.modId;
    var navList = [{"id":1,"name":"请选择版块"}];
    navList = navList.concat(app.globalData.navList);
    this.setData({
      array: navList,
      selIndex: modId
    });
    console.log("array:"+JSON.stringify(this.data.array));
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  
  chooseImage: function(){ 
      var token = wx.getStorageSync("token");
      var that = this;     
      wx.chooseImage({ 
        count: 3, 
        success: function (res) { 
          var plusImageList = that.data.imageList.concat(res.tempFilePaths);
          that.setData({ 
            imageList: plusImageList
          })
          //向服务器端上传图片
          for(var i=0;i<res.tempFilePaths.length;i++){
              var filep = res.tempFilePaths[i];
              wx.uploadFile({
                 url: api.UploadImgUrl, 
                 filePath: filep, 
                 name: 'file', 
                 success: function (res) {
                    var resjson = JSON.parse(res.data);
                    console.log(res.data) 
                    var imagesUrls = that.data.imagesUrl+";"+resjson.imgurl;
                    that.setData({ 
                      imagesUrl: imagesUrls
                    })
                 },
                fail: function (err) { 
                     console.log(err) 
                 }
              }); 
           }

        }
      });

   },
   previewImage: function (e) { 
    var current = e.target.dataset.src 
    wx.previewImage({ 
      current: current, 
      urls: this.data.imageList 
    }) 
   },

  sendNote: function (e) {
     //console.log("inputVal:"+this.data.inputVal);
     var content = this.data.inputVal;
     var module_id = this.data.selIndex;
     var images_url = this.data.imagesUrl;
     var token = wx.getStorageSync("token");
     console.log("images_url:"+images_url);
     images_url = images_url.substr(1,images_url.length);
     console.log("images_url2:"+images_url);
     //let that = this;
     util.request(api.SendNoteUrl,{ Content:content,ModuleId:module_id,ImagesUrl:images_url,token:token }, "POST").then(function (res) {
      console.log("res:"+res);
      if (res.ret === 0) {
          // wx.switchTab({
          //   url: '/pages/index/index'
          // });
          var pages = getCurrentPages();
          var prevPage = pages[pages.length-2];
          prevPage.setData({
             addFlag: 1
          });
          wx.navigateBack( {delta: 1} );
      }
    });
  },
})