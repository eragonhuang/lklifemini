//logs.js
var util = require('../../utils/util.js')
Page({
  data: {
    slideWidth: '', //滑块宽
    slideLeft: 0, //滑块位置
    totalLength: '', //当前滚动列表总长
    slideRatio: '' //滑块比例
  },

getRatio() {
  var _totalLength =  1440; //总长度（单个块宽度*总数）
  var _ratio = 100 / _totalLength * (750 / wx.getSystemInfoSync().windowWidth); //滚动列表长度与滑条长度比例
  var _showLength = 750 / _totalLength * 100; //当前显示蓝色滑条的长度(保留两位小数)
  this.setData({
    slideWidth: _showLength,
    totalLength: _totalLength,
    slideRatio: _ratio
  })
},

//slideLeft动态变化
getleft(e) {
  this.setData({
   slideLeft: e.detail.scrollLeft * this.data.slideRatio
  })
},
onLoad: function () {
  this.getRatio()
}

})
