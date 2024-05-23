// components/input/input.js
Component({

  properties: {
    inputPop: {
      type: Object,
      value: {},
    }
  },

  data: {
    inputValue:'',
  },

  methods: {
    /* 关闭 */
    closeIpnutComment () {
      let inputs = this.data.inputValue
      this.setData({
        inputValue: ''
      })
      this.triggerEvent('closeInput', {
        inputValue: inputs
      }, {})
    },
    /* 输入内容 */
    bindKeyInput (e) {
      this.setData({
        inputValue: e.detail.value
      })
      this.triggerEvent('writeInput', {
        inputValue: e.detail.value
      }, {})
    },
    /* 发布 */
    sendInput () {
      var successDetail = {}
      var successOption = {}
      this.triggerEvent('sendInput', successDetail, successOption)
    }
  }
})
