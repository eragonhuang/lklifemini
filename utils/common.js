var config = require('../config/config.js');
var md5Util = require('./md5.js');
var app = getApp();
let doLoginParams = {
    code: '',
    url: ''
};
var commonUtil = {
    base_url: '',
    ajax_url: '',
    post_url: '',
    login_count: 0,
    channel_id: 5,
    // 角色id对应名称
    tagDict: {
        0: '无角色',
        1: '儿子',
        2: '女儿',
        3: '爸爸',
        4: '妈妈'
    },
    week: ['日', '一', '二', '三', '四', '五', '六'],
    init() {
        if (config.ENV == 'test') {
            this.base_url = 'https://test.jiazhang.qq.com/wap/com/v4/dist/';
            this.ajax_url = 'https://test.jz.game.qq.com/php/tgclub/v2/';
            this.post_url = 'https://test.jz.game.qq.com/cgi-bin/Gateway.fcgi?method=';
        } else {
            this.base_url = 'https://jiazhang.qq.com/wap/com/v4/dist/';
            this.ajax_url = 'https://jz.game.qq.com/php/tgclub/v2/';
            this.post_url = 'https://jz.game.qq.com/cgi-bin/Gateway.fcgi?method=';
        }
    },
   // 获取session_id
   getSessionId() {
        try {
            var data = wx.getStorageSync('session_id');
            if (data) {
                if (data.expire_time < (new Date).getTime()) {
                    return '';
                } else {
                    return data.session_id;
                }
            }
        } catch (e) {
            return '';
        }
    },
    // 设置session_id
    setSessionId(session_id) {
        try {
            var data = {
                session_id: session_id,
                expire_time: (new Date).getTime() + 3600 * 1000
            };
            wx.setStorageSync('session_id', data)
        } catch (e) {

        }
    },
    /**
     * 格式化时间
     * @param date
     * @param fmt
     * @returns {*}
     */
    formatTime(date, fmt) {
        if (arguments.length == 1) {
            var date = new Date(),
                fmt = arguments[0];
        } else {
            var date = arguments[0],
                fmt = arguments[1];
        }
        
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "H+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },
    // 获取星期
    getWeek(date) {
        return '周' + this.week[date.getDay()];
    },
    // 判断是否是emoji表情
    isEmoji(str) {
        return str.match(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g) != null
    },
    // 根据标签id获取标签名称
    getTagNameById(tagId) {
        return this.tagDict[tagId];
    },
    NumToThousands(num) {
        var result = [], counter = 0;
        num = (num || 0).toString().split('');
        for (var i = num.length - 1; i >= 0; i--) {
            counter++;
            result.unshift(num[i]);
            if (!(counter % 3) && i != 0) {
                result.unshift(',');
            }
        }
        return result.join('');
    },
    // 用户信息放到缓存中
    setUserInfo(data) {
        if (!data.avatarUrl) {
            // 如果没有头像，默认
            data.avatarUrl = 'https://ossweb-img.qq.com/images/chanpin/tgclub/public/jiazhang/wx_logo.png';
        }
        wx.setStorage({
            key: "user_info",
            data: data
        });
    },
    // 从缓存中获取用户信息
    getUserInfo(cb) {
        wx.getStorage({
            key: 'user_info',
            success(res) {
                cb(res.data);
            },
            fail() {
                cb({});
            }
        });
    },
    // 设置约定数据在缓存中
    setAppointData(data, cb) {
        wx.setStorage({
            key: "appoint_data",
            data: data,
            success() {
                cb();
            }
        });
    },
    // 异步请求
    ajax() {
        var url = arguments[0];
        var params = arguments[1] || {};
        if (typeof params == 'function') {
            var callback = params;
            params = {};
            var failCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
        } else {
            var failCallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
            var callback = arguments[2];
        }
        var session_id = this.getSessionId();
        if (!session_id) {
            this.doLogin(url, params, callback, failCallback);
            return;
        }
        
        // url加密
        url = this.signUrl(url, session_id);
        var _this = this;
        wx.request({
            method: 'GET',
            url: this.ajax_url + 'jzwechat_v10_' + url,
            data: params,
            dataType: 'json',
            header: {
                'Content-Type': 'application/json'
            },
            success(ret) {
                ret = ret.data;
                // 用户是否第一次访问 todo beta版本
                var notFirst;
                try {
                    notFirst = wx.getStorageSync('not_first_access');
                } catch (e) {
                    notFirst = 0;
                }
                if (notFirst) {
                    ret.is_first_access = false;
                }
                if (ret.is_first_access && typeof failCallback == 'function') {
                    failCallback({
                        err_code: 99999
                    });
                    return;
                }
                // 执行登录
                if (ret.err_code >= 83000 && ret.err_code <= 83005) {
                    _this.doLogin(url, params, callback, failCallback);
                    return;
                }
                _this.login_count = 0;
                
                // 宽绑的孩子，需要家长激活weteam
                if (ret.err_code == 84976) {
                    wx.redirectTo({
                        url: '/pages/empty/error?msg=' + ret.err_msg
                    });
                    return;
                }
                
                if (ret.err_code == 0) {
                    if (typeof callback == 'function') {
                        callback(ret.data);
                    }
                } else if (typeof failCallback == 'function') {
                    failCallback(ret);
                }
            },
            fail() {
                failCallback({
                    err_code: 10000,
                    err_msg: '网络异常'
                });
            }
        });
    },
    uploadImg(filePath, callback, failCallback) {
        var session_id = this.getSessionId();
        var url = this.signUrl('uploadcos/uploadPic', session_id);
        wx.uploadFile({
            url: this.ajax_url + 'jzwechat_v10_' + url,
            filePath: filePath,
            name: 'file',
            success(ret) {
                ret = JSON.parse(ret.data);
                if (ret.err_code == 0) {
                    if (typeof callback == 'function') {
                        callback(ret.data);
                    }
                } else if (typeof failCallback == 'function') {
                    failCallback(ret);
                }
            }
        })
    },
    // url加密
    signUrl(url, session_id) {
        console.log(url, session_id);
        var action = url.split('/')[1].toLocaleLowerCase(),
            time = Math.floor((new Date()).getTime() / 1000),
            sign = md5Util.md5Encode(action + session_id + time + config.KEY).substr(0, 8);
        url += '?session_id=' + session_id + '&_t=' + time + '&sign=' + sign + '&channel_id=' + this.channel_id;
        return url;
    },
    // 执行登录
    doLogin(url, params, callback, failCallback) {
        if (this.login_count > 5) {
            return;
        }
        var _this = this;
        this.login_count++;
        doLoginParams.url = url;
        doLoginParams.params = params;
        doLoginParams.callback = callback;
        doLoginParams.failCallback = failCallback;
        wx.login({
            success(res) {
                var code = res.code;
                doLoginParams.code = code;
                wx.getUserInfo({
                    withCredentials: true,
                    success(res) {
                        // 用户信息放到缓存中
                        _this.setUserInfo(res.userInfo);
                        var newParams = {
                            code: code,
                            encryptedData: res.encryptedData,
                            iv: res.iv
                        };
                        /*if (config.ENV == 'test') {
                            newParams['test_openid'] = 'o1A_BjujJRzNKue7wARmDxr6ihHk';
                            newParams['test_openid'] = 'o1A_BjmWTkNYMwq5_-KteCPNtyFo';
                        }*/
                        wx.request({
                            method: 'GET',
                            url: _this.ajax_url + 'jzwechat_v10_login/miniappLogin',
                            data: newParams,
                            header: {
                                'Content-Type': 'application/json'
                            },
                            success(res) {
                                var res = res.data;
                                if (res.data && res.data.sessionId) {
                                    if (res.data.sessionId) {
                                        _this.setSessionId(res.data.sessionId);
                                        _this.request(url, params, callback, failCallback);
                                    }
                                    app.setOpenId(res.data.openid);
                                }
                            }
                        });
                    },
                    fail() {
                        wx.redirectTo({
                            url: "/pages/index/start"
                        });
                    }
                });
            },
            fail() {
            
            }
        });
    },
    login_success(res) {
        let _this = this;
        // 用户信息放到缓存中
        _this.setUserInfo(res.userInfo);
        var newParams = {
            code: doLoginParams.code,
            encryptedData: res.encryptedData,
            iv: res.iv
        };
        /*if (config.ENV == 'test') {
            newParams['test_openid'] = 'o1A_BjujJRzNKue7wARmDxr6ihHk';
            newParams['test_openid'] = 'o1A_BjmWTkNYMwq5_-KteCPNtyFo';
        }*/
        wx.request({
            method: 'GET',
            url: _this.ajax_url + 'jzwechat_v10_login/miniappLogin',
            data: newParams,
            header: {
                'Content-Type': 'application/json'
            },
            success(res) {
                var res = res.data;
                if (res.data && res.data.sessionId) {
                    if (res.data.sessionId) {
                        _this.setSessionId(res.data.sessionId);
                        _this.ajax(doLoginParams.url, doLoginParams.params, doLoginParams.callback, doLoginParams.failCallback);
                    }
                    app.setOpenId(res.data.openid);
                }
            }
        });
    },
    // 前端打点
    report(eid, data) {
        if (!eid) {
            return true;
        }
        data = data || '';
        var params = {
            pvid: '',
            uvid: '',
            user_id: app.getOpenId(),
            real_user_id: app.getUserId(),
            group_id: app.getGroupId(),
            user_type: 1,
            visit_type: this.channel_id, // 5：小程序
            module_id: parseInt(eid / 1000),
            event_id: eid,
            con_id: '',
            url: '',
            err_code: 0,
            data: data
        };
        
        wx.request({
            method: 'GET',
            url: this.ajax_url + 'jiazhang_clicklog/click',
            data: params,
            header: {
                'Content-Type': 'application/json'
            }
        });
    },
    // 跳到启动页
    goStart(params) {
        var url = '/pages/index/index';
        for (var i in params) {
            url += '&' + i + '=' + params[i];
        }
        wx.redirectTo({
            url: url
        });
    },
    request() {
        var url = arguments[0];
        var params = arguments[1] || {};
        if (typeof params == 'function') {
            var callback = params;
            params = {};
            var isShowLoading = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var failCallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
        } else {
            var isShowLoading = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
            var failCallback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
            var callback = arguments[2];
        }
        var session_id = this.getSessionId();
        if (!session_id) {
            this.doLogin(url, params, callback, failCallback);
            return;
        }
        
        isShowLoading && wx.showLoading({
            title: '正在加载中...',
        });
        
        var _this = this;
        wx.request({
            method: 'POST',
            url: this.post_url + url + `&session_id=${session_id}&channel_id=5`,
            // url: this.post_url + url + `&channel_id=5`,
            data: params,
            dataType: 'json',
            header: {
                'Content-Type': 'application/json'
            },
            success(ret) {
                var statusCode = ret.statusCode;
                ret = ret.data;
                if (statusCode != 200) {
                    if (typeof failCallback == 'function') {
                        failCallback(ret);
                    } else {
                        wx.showToast({
                            title: '网络异常，请稍后重试',
                            icon: 'none',
                            duration: 2000
                        });
                    }
                    return;
                }
                
                // 执行登录
                if (ret.ret >= 83000 && ret.ret <= 83005) {
                    _this.doLogin(url, params, callback, failCallback);
                    return;
                }
                _this.login_count = 0;
                
                if (ret.ret == 0 || ret.ret == 50502) {
                    if (typeof callback == 'function') {
                        callback(ret);
                    }
                } else if (typeof failCallback == 'function') {
                    failCallback(ret);
                } else {
                    wx.showToast({
                        title: ret.msg,
                        icon: 'none',
                        duration: 2000
                    });
                }
            },
            fail() {
                if (typeof failCallback == 'function') {
                    failCallback({
                        ret: 10000,
                        msg: '网络异常'
                    });
                } else {
                    wx.showToast({
                        title: '网络异常',
                        icon: 'none',
                        duration: 2000
                    });
                }
            },
            complete() {
                isShowLoading && wx.hideLoading();
            }
        });
    },
};
commonUtil.init();
module.exports = commonUtil;