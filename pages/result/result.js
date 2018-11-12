var hotapp = require('../../utils/hotapp.js');
var app = getApp();
// 注册当页全局变量，存放搜索结果以便更新到data中
var curBooksList = [];
Page({
  data: {
    booksList: [],
    keyword: null,
    pageCurrent: null,
    pagesTotal: null,
    scrollHeight: null,//滚动区域高度
    cancel: true,  //是否显示输入框清除按钮
    dropLoadFunc: "dropLoad"
    // animationData: {}
  },

  // 页面初始化
  onLoad: function (param) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight - (104 * res.windowWidth / 750),//窗口高度(px)-搜索模块高度(px)
        })
      }
    })
    that.setData({
      keyword: param.keyword,
    })
    var result = app.globalData.searchResult
    curBooksList = result.results
    // 有搜索结果
    if (result.count > 0) {
      // 更新数据
      that.setData({
        status: "success",
        booksList: result.results,
        pageCurrent: 1,
        pagesTotal: Math.ceil(result.count / 10)
      })
    } else {
      // 无搜索结果
      that.setData({
        status: "fail",
      })
    }

  },
  //搜索按钮事件
  formSubmit: function (e) {
    var that = this;
    var keyword = null;
    if (e.detail.value.book) {
      keyword = e.detail.value.book;
      that.search(keyword);
    } else {
      wx.showToast({
        title: '您没有输入哦',
        icon: 'success',
        duration: 10000
      })
      setTimeout(function () {
        wx.hideToast()
      }, 1000)
      return false;
    }
  },
  //回车事件
  enterSubmit: function (e) {
    var that = this;
    var keyword = null;
    if (e.detail.value) {
      keyword = e.detail.value;
      that.search(keyword);
    } else {
      wx.showToast({
        title: '您没有输入哦',
        icon: 'success',
        duration: 10000
      })
      setTimeout(function () {
        wx.hideToast()
      }, 1000)
      return false;
    }
  },

  // 搜索
  search: function (keyword) {
    var that = this;
    //清空上次搜索的结果
    curBooksList = [];

    that.setData({
      keyword: keyword,
    })

    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })

    hotapp.request({
      url: 'http://122.115.62.15:5678/api/v1/books/?client=wx&limit=10&search=' + keyword,
      success: function (res) {
        // 请求成功隐藏加载中的提示
        wx.hideToast()

        if (res.data.count > 0) {
          curBooksList = res.data.results;
          
          that.setData({
            status: "success",
            booksList: res.data.results,
            pageCurrent: 1,
            pagesTotal: Math.ceil(res.data.count / 10), 
            scrollTop: "0"
          })
        } else {
          // 无搜索结果
          that.setData({
            status: "fail",
          })
        }
      },
      complete:function(){
        
      }
    })
  },

  // 上拉加载
  dropLoad: function () {
    var that = this;
    console.log('this.data.pageCurrent', this.data.pageCurrent);
    console.log('this.data.pagesTotal', this.data.pagesTotal);
    if (this.data.pageCurrent < this.data.pagesTotal) {
      //锁定上拉加载
      that.setData({
        dropLoadFunc: null
      })
      that.loadMore();
    }
  },

  //加载更多
  loadMore: function () {
    var that = this;
    var page = parseInt(that.data.pageCurrent) + 1;
    hotapp.request({
      url: 'http://122.115.62.15:5678/api/v1/books/',
      data: {
        client: 'wx',
        limit: 10,
        offset: (page-1) * 10,
        search: that.data.keyword
      },
      success: function (res) {
        if (res.data.count > 0 && res.data.results.length > 0) {
          // 更新数据
          curBooksList = curBooksList.concat(res.data.results)
          that.setData({
            booksList: curBooksList,
            pageCurrent: page
          })
        } else {
          // 无搜索结果
          console.log("没有结果")
        }
      },
      complete:function(){
        //启动上拉加载
        that.setData({
          dropLoadFunc: "dropLoad"
        })
      }
    })
  },
  //input清除按钮显示
  typeIng: function (e) {
    var that = this;
    if (e.detail.value) {
      that.setData({
        cancel: true
      })
    } else {
      that.setData({
        cancel: false
      })
    }
  },
  //清除输入框
  clearInput: function () {
    this.setData({
      keyword: null,
      cancel: false,
      focus: true
    })
  },
  // 分享搜索结果
   onShareAppMessage: function () {
    return {
      title: '妙想家亲子阅读馆',
      path: '/pages/index/index'
    }
  }
})