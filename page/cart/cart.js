var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
const orginalPrice = 0; //由于0.00在赋值时是0，用toFixed()取余
const Initnum=0;
// carts[index].num=0;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectTab: true,
    selectBook: true,
    selectThing: false, 
 
    carts: [], // 购物车列表
    num:Initnum,
    hasList: false, // 列表是否有数据
    totalPrice: orginalPrice.toFixed(2), // 总价，初始为0
    selectAllStatus: false, // 全选状态，默认不全选
    bookId: '',
    isMyCartShow: false,
    studentId: '', 
    myCartBookLength: '5',
    bookPrice: 0,
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  gotoDetail(e){
    console.log(e);
    let index=e.currentTarget.dataset.index;
    let bookId=e.currentTarget.dataset.bookid;
    wx.navigateTo({
      url: '../component/details/details?index=' + index+'&'+'bookId='+bookId,
    })
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
 
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    // var studentId = that.data.studentId;
    var hasList = that.data.hasList;
    this.getBookCartList()
  },
 
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
 
  },
 
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
 
  },
 
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 动态设置导航条标题
    // wx.setNavigationBarTitle({
    //   title: '购物车'
    // });
    // wx.showNavigationBarLoading(); //在标题栏中显示加载图标
    // setTimeout(function(){
    //   wx.stopPullDownRefresh(); //停止加载
    //   wx.hideNavigationBarLoading(); //隐藏加载icon
    // },2000)
  },
 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.selectBook){
      this.getBookCartList()
    }
  },
getBookCartList(){
  var that = this;
  var url = api.CartList;
  var ismyCartShow = that.data.ismyCartShow;
  var carts = that.data.carts;
  var myCartBookLength = that.data.myCartBookLength;
  var studentId = that.data.studentId;
  wx.showToast({
    title: '加载中',
    icon: 'loading',
    duration: 1000,
  })
  wx.request({
    url:url,
    method: 'POST',
    header: {
      'token': wx.getStorageSync('token'),
      'Content-Type': 'application/json'
    },
    data: { //此处设置，一定要与后台一一对应，属性名和属性的先后位置。
      // studentId: studentId,
    },
    success: res => {
      carts = res.data.data || [];
      for(var i=0;i<carts.length;i++){
        carts[i].num=0;
      }
      var data = res.data.data;  
      console.log(res.data);
      if(data === undefined) {
        wx.hideToast()
        that.setData({
          isMyCartShow: true
        })
        return 
      }
      that.setData({
        myCartBookLength: data.length  //每次获取5组值
      })
      myCartBookLength = data.length; 
      console.log(myCartBookLength);
      // data.forEach(item => {
      //     let messege = {
      //     selected: false,
      //     ...item
      //   }
      //   carts.push(messege); //实现购物车的最近添加的物品，展现在最前面
      // })
      that.setData({
        carts:  carts ,
      })
     
    },
    fail: err => {
      console.log(err);
    }
  })
},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
 
  },
  /*绑定加数量事件*/
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    // console.log(carts[index].num);
    let num =this.data.num;
    num++;
    carts[index].num = num;
    this.setData({
      num:num,
      carts: carts
    });
    this.getTotalPrice();
  },
  /* 绑定减数量事件*/
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    const obj = e.currentTarget.dataset.obj;
    let carts = this.data.carts;
    let num = this.data.num;
    if(num===0){
      return false;
    }else{num = num - 1;}
    carts[index].num = num;
    this.setData({
      num:num,
      carts: carts
    });
    this.getTotalPrice();
  },
  //计算总价
  getTotalPrice() {
    // const index = e.currentTarget.dataset.index;
    // let num=carts[index].num;
    let carts = this.data.carts; // 获取购物车列表
    console.log(this.data.bookPrice);
    let bookPrice = parseFloat(this.data.bookPrice);
    let total = 0.00;
    for (let i = 0; i < carts.length; i++) { // 循环列表得到每个数据
      if (carts[i].selected) { // 判断选中才会计算价格
       
        total += parseFloat(carts[i].num*carts[i].originPrice); // 所有价格加起来
      }
    }
    this.setData({
      bookPrice: total.toFixed(2)
    })
    // total += thingPrice;
    this.setData({ // 最后赋值到data中渲染到页面
      carts: carts, 
      totalPrice: total.toFixed(2) //保留小数后面2两位
    });
  },
  //选择事件
  selectList(e) {
    let that = this;
    const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
    console.log(index);
  
    let selectAllStatus = that.data.selectAllStatus; //是否已经全选
    let str = true;  //用str与每一项进行状态判断
    let carts = that.data.carts;                    // 获取购物车列表
    const selected = carts[index].selected;         // 获取当前商品的选中状态
    carts[index].selected = !selected;              // 改变状态
    that.setData({
      carts: carts
    });
    that.getTotalPrice();                           // 重新获取总价
    for (var i = 0; i < carts.length; i++) {
      str = str && carts[i].selected;           //用str与每一项进行状态判断
    }
  
    if (str === true) {
      that.setData({
        selectAllStatus: true
      })
    } else {
      that.setData({
        selectAllStatus: false
      })
    }
  },
  //全选事件
  selectAll(e) {
    var that = this;
    let selectAllStatus = that.data.selectAllStatus;    // 是否全选状态
    let carts = that.data.carts;
    var selectThing = that.data.selectThing;
    var selectBook = that.data.selectBook;
  if(selectBook) {
    selectAllStatus = !selectAllStatus;
    for (let i = 0; i < carts.length; i++) {
      carts[i].selected = selectAllStatus;            // 改变所有商品状态
    }
    that.setData({
      selectAllStatus: selectAllStatus,
      carts: carts
    });
    that.getTotalPrice();                               // 重新获取总价
    if (carts.length === 0) { //当没有物品时，不能再点“全选”
      wx.showModal({
        title: '提示',
        content: '购物车空空如也~',
        success: function (res) {   //模糊层成功出来后
          if (res.confirm) {
            console.log('用户点击确定')
            that.setData({
              selectAllStatus: false
            })
          } else {
            console.log('用户点击取消')
            that.setData({
              selectAllStatus: false
            })
          }
        },
      })
    }
  }else {
    selectAllStatus = !selectAllStatus;
    that.setData({
      selectAllStatus: selectAllStatus,
      thingCarts: thingCarts
    });
    that.getTotalPriceThing();                               // 重新获取总价
    if (thingCarts.length === 0) { //当没有物品时，不能再点“全选”
      wx.showModal({
        title: '提示',
        content: '购物车空空如也~',
        success: function (res) {   //模糊层成功出来后
          if (res.confirm) {
            console.log('用户点击确定')
            that.setData({
              selectAllStatus: false
            })
          } else {
            console.log('用户点击取消')
            that.setData({
              selectAllStatus: false
            })
          }
        },
 
      })
 
    }
  }
  },
 
  //删除商品
  deleteList(e) {
    const index = e.currentTarget.dataset.index;
    var selectAllStatus = this.data.selectAllStatus;
    let carts = this.data.carts;
    let totalPrice = this.data.totalPrice;
    wx.showModal({
      title: '提示',
      content: '将此产品移除购物车？',
      success: res=> {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.request({
            url: api.CartDelete+'/'+carts[index].id,
            method:'POST',
            header: {
              'token': wx.getStorageSync('token'),
              'Content-Type': 'application/json'
            },
            success:function(res){
              console.log('删除成功');
            }
          })
          carts.splice(index, 1);              // 删除购物车列表里这个商品
          this.setData({
            carts: carts
          });
          if (carts.length == 0) {                  // 如果购物车为空
            this.setData({
              hasList: false,             // 修改标识为false，显示购物车为空页面
              selectAllStatus: false,
              totalPrice: orginalPrice.toFixed(2)              //此时价格为0
            });
          } else {                              // 如果不为空
            this.getTotalPrice();           // 重新计算总价格
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
 
  chooseBookCart() {
    var that = this;
    var selectBook = that.data.selectBook;
    var selectThing = that.data.selectThing;
    let selectAllStatus = that.data.selectAllStatus; //是否已经全选
    let str = true;  //用str与每一项进行状态判断
    let carts = that.data.carts;  
    for (var i = 0; i < carts.length; i++) {
      str = str && carts[i].selected;           //用str与每一项进行状态判断
    }
    console.log(str);
    that.setData({
      selectBook: true,
      selectThing: false, 
    })
   
  },
  toBuy(){
    var totalPrice = this.data.totalPrice;
    var bookCarts = this.data.carts;
    var bookId = this.data.bookId;
    var bookCart = [];
    bookCarts.forEach(item=>{
      if (item.selected){
        bookCart.push(item);
      }
    })
    let shoppingCartList = {bookCart};
    console.log(bookCart);
    if(totalPrice === '0.00'){
      wx.showToast({
        title: '请选择商品！',
        type:'icon',
        success:()=>{
          console.log('提示成功');
        }
      })
     console.log(totalPrice);
    }else {
      bookCart=JSON.stringify(bookCart);
      console.log(shoppingCartList);
      wx.navigateTo({
        url: '../component/orders/orders?bookCart='+bookCart,
            })
    }
 
  }
})