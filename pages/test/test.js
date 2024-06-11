Page({
  data: {
    listData: [{
      id: '1',
      name: '这是一个左滑删除功能',
    }, {
      id: '1',
      name: '这是一个左滑删除功能',
    }, {
      id: '1',
      name: '这是一个左滑删除功能',
    }, {
      id: '1',
      name: '这是一个左滑删除功能',
    }, {
      id: '1',
      name: '这是一个左滑删除功能',
    }, ],

  },
    /**
   * 触摸开始
   */
    touchS: function (e) {
      let index = e.currentTarget.dataset.index;
      //遍历复位
      this.data.listData.forEach(function (item, key) {
        if (key != index) {
          item.leftx = 0;
        }
      });
      //复位后,赋值
      this.setData({
        listData: this.data.listData,
      });
      if (e.touches.length == 1) {
        this.setData({
          //设置触摸起始点水平方向位置
          startX: e.touches[0].clientX
        });
      }
    },
    /**
     * 触摸移动
     */
    touchM: function (e) {
      let index = e.currentTarget.dataset.index;
      var endX = e.touches[0].clientX;
      var disX = this.data.startX - endX;
      var pcontrolWidth = this.data.pcontrolWidth;
      var left = 0;
      //因为会和下滑有冲突，所以这里设置一定的距离
      if (disX <= -20) {
        left = 0;
      } else if (disX > 30) {
        left = 180;
        // if (disX >= pcontrolWidth) {
        //     //控制手指移动距离最大值为删除按钮的宽度
        //     left = pcontrolWidth;
        // }
      }
      this.data.listData[index].leftx = -left;
      this.setData({
        listData: this.data.listData,
      });
    },
    /**
     * 触摸结束
     */
    touchE: function (e) {
  
    },
  
});