const ApiRootUrl = 'http://119.29.93.180/api/';
const ApiRootUrl2 = 'http://119.29.93.180/lkshop/php/do.cgi?';

module.exports = {
  IndexUrl: ApiRootUrl2 + 'method=main', //首页数据接口2
  getOneForumUrl: ApiRootUrl2 + 'method=maindetail', //首页单条数据接口
  AddCommentUrl: ApiRootUrl2 + 'method=commentadd', //评论
  DianzanUrl: ApiRootUrl2 + 'method=dianzan', //点赞
  SendNoteUrl: ApiRootUrl2 + 'method=fatie', //发帖
  UploadImgUrl: ApiRootUrl2 + 'method=upimg', //上传图片
  LoginUrl: ApiRootUrl2 + 'method=login', //登录
  DelCommentUrl: ApiRootUrl2 + 'method=commentdel', //删除评论
  MyListUrl: ApiRootUrl2 + 'method=mylist', //我的列表
  OtherListUrl: ApiRootUrl2 + 'method=otlist', //他人列表
  DelForumUrl: ApiRootUrl2 + 'method=delforum', //删除帖子
  FavoriteUrl: ApiRootUrl2 + 'method=fav', //收藏
  DelFavoriteUrl: ApiRootUrl2 + 'method=delfav', //取消收藏
  ChatUrl: ApiRootUrl2 + 'method=chat', //聊天记录

  MainUrl: ApiRootUrl2 + 'method=mainlist', //首页数据接口
  GoodsCount: ApiRootUrl2 + 'method=goodscount',  //统计商品总数
  SearchIndex: ApiRootUrl2 + 'method=searchlist',  //搜索页面数据
  CatalogList: ApiRootUrl2 + 'method=cataloglist',  //分类目录全部分类数据接口
  GoodsList: ApiRootUrl2 + 'method=goodslist',  //获得商品列表
  GoodsDetail: ApiRootUrl2 + 'method=goodsdetail',  //获得商品的详情
  CartGoodsCount: ApiRootUrl2 + 'method=cartgoodscount', // 获取购物车商品件数
  GoodsRelated: ApiRootUrl2 + 'method=related',  //商品详情页的关联商品（大家都在看）
  CartList: ApiRootUrl2 + 'method=cartlist', //获取购物车的数据
  CartAdd: ApiRootUrl2 + 'method=cartadd', //添加商品到购物车
  CartUpdate: ApiRootUrl2 + 'method=cartmod', //更新购物车的商品
  CartDelete: ApiRootUrl2 + 'method=cartdel', // 删除购物车的商品
  CartChecked: ApiRootUrl2 + 'method=checked', // 选择或取消选择商品
  CartCheckout: ApiRootUrl2 + 'method=checkout', // 下单前信息确认
  AddressList: ApiRootUrl2 + 'method=addrlist',  //收货地址列表
  AddressDetail: ApiRootUrl2 + 'method=addrdetail',  //收货地址详情
  AddressSave: ApiRootUrl2 + 'method=addrsave',  //保存收货地址
  AddressDelete: ApiRootUrl2 + 'method=addrdelete',  //删除收货地址
  RegionList: ApiRootUrl2 + 'method=regionlist',  //获取区域列表
  OrderList: ApiRootUrl2 + 'method=orderlist',  //订单列表
  OrderDetail: ApiRootUrl2 + 'method=orderdetail',  //订单详情
  OrderExpress: ApiRootUrl2 + 'method=orderexpress',  //物流详情
  OrderSubmit: ApiRootUrl2 + 'method=ordersubmit', // 提交订单
  GoodsHot: ApiRootUrl2 + 'method=goodshot',  //热门
  BrandList: ApiRootUrl2 + 'method=brandlist',  //品牌列表
  //BrandList: ApiRootUrl + 'brand/list',  //品牌列表

  BrandDetail: ApiRootUrl2 + 'method=branddetail',  //品牌详情
  GoodsCategory: ApiRootUrl2 + 'method=category',  //获得分类数据
  //GoodsCategory: ApiRootUrl + 'goods/category',  //获得分类数据

  CollectList: ApiRootUrl2 + 'method=collectlist',  //收藏列表
  CollectAddOrDelete: ApiRootUrl2 + 'method=collectaddordelete',  //添加或取消收藏
  SearchHelper: ApiRootUrl2 + 'method=searchhelper',  //搜索辅助
  SearchClearHistory: ApiRootUrl2 + 'method=searchclearhis',  //搜索历史清空

  //OrderList: ApiRootUrl + 'order/list',  //订单列表
  //OrderDetail: ApiRootUrl + 'order/detail',  //订单详情
  //OrderExpress: ApiRootUrl + 'order/express', //物流详情
  //OrderSubmit: ApiRootUrl + 'order/submit', // 提交订单

  //AddressList: ApiRootUrl + 'address/list',  //收货地址列表
  //AddressDetail: ApiRootUrl + 'address/detail',  //收货地址详情
  //AddressSave: ApiRootUrl + 'address/save',  //保存收货地址
  //AddressDelete: ApiRootUrl + 'address/delete',  //保存收货地址

  //CartAdd: ApiRootUrl + 'cart/add', // 添加商品到购物车
  //CartUpdate: ApiRootUrl + 'cart/update', // 更新购物车的商品
  //CartDelete: ApiRootUrl + 'cart/delete', // 删除购物车的商品
  //CartChecked: ApiRootUrl + 'cart/checked', // 选择或取消选择商品
  //CartCheckout: ApiRootUrl + 'cart/checkout', // 下单前信息确认

  //MainUrl: ApiRootUrl + 'index/index', //首页数据接口

  //CatalogList: ApiRootUrl + 'catalog/index',  //分类目录全部分类数据接口
  //AuthLoginByWeixin: ApiRootUrl + 'auth/loginByWeixin', //微信登录

  //GoodsCount: ApiRootUrl + 'goods/count',  //统计商品总数
  //GoodsList: ApiRootUrl + 'goods/list',  //获得商品列表
  //GoodsDetail: ApiRootUrl + 'goods/detail',  //获得商品的详情
  //GoodsNew: ApiRootUrl + 'goods/new',  //新品
  
  //GoodsRelated: ApiRootUrl + 'goods/related',  //商品详情页的关联商品（大家都在看）


  PayPrepayId: ApiRootUrl + 'pay/prepay', //获取微信统一下单prepay_id

  CommentList: ApiRootUrl + 'comment/list',  //评论列表
  CommentCount: ApiRootUrl + 'comment/count',  //评论总数
  CommentPost: ApiRootUrl + 'comment/post',   //发表评论

  TopicList: ApiRootUrl + 'topic/list',  //专题列表
  TopicDetail: ApiRootUrl + 'topic/detail',  //专题详情
  TopicRelated: ApiRootUrl + 'topic/related',  //相关专题

  //SearchIndex: ApiRootUrl + 'search/index',  //搜索页面数据
  SearchResult: ApiRootUrl + 'search/result',  //搜索数据
  //SearchHelper: ApiRootUrl + 'search/helper',  //搜索帮助
  //SearchClearHistory: ApiRootUrl + 'search/clearhistory',  //搜索帮助

  FootprintList: ApiRootUrl + 'footprint/list',  //足迹列表
  FootprintDelete: ApiRootUrl + 'footprint/delete',  //删除足迹
};