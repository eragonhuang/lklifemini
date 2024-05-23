// 图片处理工具
// 防止图片加载不出来，一直空白
var imageUtil = {
    map: {},        // 已经下载的图片, 1还没有开始下载，2下载成功，3下载失败
    list: [],       // 将要下载的图片队列
    downing: false, // downing为true代表下载在进行，当下载队列空的时候，会变为false，如果有新的图片进来，会重新激活
    count: 0,
    /**
     * @param url
     * @param noClear 如果为true，就不会清理，适用于那些调用频繁的页面
     * @param noCache 不从缓存获取数据
     * @returns url
     */
    getImageUrl(url, noClear, noCache) {
        if (!url) return '';
        // 加https是为了兼容安卓
        if (url.indexOf('//') == 0) {
            url = 'https:' + url;
        }

        if (!noClear) {
            // 加载十次，清理一次
            this.count++;
            if (this.count % 10 == 0) {
                this.clearMap();
            }
        }

        // 如果是已经下载的图片，使用临时文件
        if (!noCache && this.map[url] && this.map[url].status == 2) {
            return this.map[url].new_url;
        } else {
            this.addImage(url);
            return url;
        }
    },
    // 添加图片到下载队列
    addImage(url) {
        if (!this.map[url] || this.map[url].status == 3) {
            // 下载成功的，不再处理
            this.map[url] = {
                status: 1,
                new_url: ''
            };
            this.list.unshift(url);
            if (!this.downing) {
                this.downing  = true;
                this.downLoadImage();
            }
        }
    },
    // 下载图片
    downLoadImage() {
        // 图片
        if (this.list.length > 0) {
            var url = this.list.pop();
            var _this = this;
            wx.downloadFile({
                url: url,
                success(res) {
                    if (res.statusCode === 200) {
                        _this.map[url].status = 2;
                        _this.map[url].new_url = res.tempFilePath;
                    } else {
                        _this.map[url].status = 3;
                    }
                },
                fail() {
                    _this.map[url].status = 3;
                },
                complete() {
                    _this.downLoadImage();
                }
            });
        } else {
            this.downing = false;
        }
    },
    // 定期触发，这个操作是防止失效的临时文件被使用
    clearMap() {
        var clearList = [],
            _this = this;
        for (var i in this.map) {
            // 只有status等于2的文件需要被清理
            if (this.map[i].status == 2) {
                clearList.push(this.map[i].new_url);
            }
        }
        var doClear = function (index) {
            if (index < clearList.length) {
                var url = clearList[index];
                wx.getFileInfo({
                    filePath: url,
                    fail() {
                        delete _this.map[url];
                    },
                    complete() {
                        setTimeout(() => {
                            doClear(++index);
                        }, 200);
                    }
                });
            }
        };
        if (clearList.length > 0) {
            doClear(0);
        }
    }
};
module.exports = imageUtil;