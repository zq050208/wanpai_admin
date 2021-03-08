import Main from '@/components/main'
// import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [{
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [{
      path: '/home',
      name: 'home',
      meta: {
        hideInMenu: true,
        title: '首页',
        notCache: true,
        icon: 'md-home icon-home'
      },
      component: () => import('@/view/single-page/home')
    }]
  },
  {
    path: '/account-access',
    name: 'account-access',
    component: Main,
    meta: {
      hideInMenu: true,
      icon: ' iconfont icon-zhanghao',
      title: '权限'
    },
    children: [{
        path: 'add-account',
        name: 'add-account',
        meta: {
          hideInMenu: true,
          icon: ' iconfont icon-accountnum',
          title: '管理员列表'
        },
        component: () => import('@/view/account-access/add-account.vue')
      },
      {
        path: 'add-roles',
        name: 'add-roles',
        meta: {
          hideInMenu: true,
          icon: ' iconfont icon-jiaoseguanli',
          title: '角色列表'
        },
        component: () => import('@/view/account-access/add-roles.vue')
      },
      {
        path: 'controller',
        name: 'controller',
        meta: {
          hideInMenu: true,
          icon: ' iconfont icon-jiaoseguanli',
          title: '菜单管理'
        },
        component: () => import('@/view/account-access/controller.vue')
      }
    ]
  },
  {
    path: '/party',
    name: 'party',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '派对',
      hideInMenu: true
    },
    children: [{
        path: 'audit',
        name: 'audit',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '派对审核',
          hideInMenu: true
        },
        component: () => import('@/view/party/audit.vue')
      },
      {
        path: 'party',
        name: 'partyManagement',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '派对管理',
          hideInMenu: true
        },
        component: () => import('@/view/party/party.vue')
      },
      {
        path: 'facade',
        name: 'facade',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '每日门面',
          hideInMenu: true
        },
        component: () => import('@/view/banner/facade.vue')
      },
      {
        path: 'giftUpload',
        name: 'giftUpload',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '礼物上传',
          hideInMenu: true
        },
        component: () => import('@/view/banner/giftUpload.vue')
      },
      {
        path: 'music',
        name: 'music',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '音乐管理',
          hideInMenu: true
        },
        component: () => import('@/view/party/music.vue')
      },
      {
        path: 'contnetManage',
        name: 'contnetManage',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '内容管理',
          hideInMenu: true
        },
        component: () => import('@/view/contnetManage/contnetManage.vue')
      },
      {
        path: 'managementAudit',
        name: 'managementAudit',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '管理审核',
          hideInMenu: true
        },
        component: () => import('@/view/party/managementAudit.vue')
      }
      // {
      //   path: 'tags',
      //   name: 'tags',
      //   meta: {
      //     icon: ' iconfont icon-gouxuan',
      //     title: '标签管理',
      //     hideInMenu: true
      //   },
      //   component: () => import('@/view/party/tags.vue')
      // }
    ]
  },
  {
    path: '/topic',
    name: '_topic',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '话题管理',
      hideInMenu: true
    },
    children: [{
      path: 'topic',
      name: 'topic',
      meta: {
        icon: ' iconfont icon-gouxuan',
        title: '话题操作',
        hideInMenu: true
      },
      component: () => import('@/view/topic/topic.vue')
    }]
  },
  {
    path: '/gift',
    name: '_gift',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '礼物管理',
      hideInMenu: true
    },
    children: [{
      path: 'gift',
      name: 'gift',
      meta: {
        icon: ' iconfont icon-gouxuan',
        title: '礼物上传',
        hideInMenu: true
      },
      component: () => import('@/view/gift/gift.vue')
    }]
  },
  {
    path: '/ranking',
    name: '_ranking',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '排行榜',
      hideInMenu: true
    },
    children: [{
      path: 'popularity',
      name: 'popularity',
      meta: {
        icon: ' iconfont icon-gouxuan',
        title: '人气排行榜',
        hideInMenu: true
      },
      component: () => import('@/view/ranking/popularity.vue')
    }]
  },
  {
    path: '/banner',
    name: '_banner',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: 'banner管理',
      hideInMenu: true
    },
    children: [{
      path: 'banner',
      name: 'banner',
      meta: {
        icon: ' iconfont icon-gouxuan',
        title: 'banner上传',
        hideInMenu: true
      },
      component: () => import('@/view/banner/components/banner.vue')
    }]
  },
  {
    path: '/complaints',
    name: '_complaints',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '投诉&举报',
      hideInMenu: true
    },
    children: [{
      path: 'complaint',
      name: 'complaint',
      meta: {
        icon: ' iconfont icon-gouxuan',
        title: '投诉&举报',
        hideInMenu: true
      },
      component: () => import('@/view/complaints/complaint.vue')
    }]
  },
  {
    path: '/operation_center',
    name: 'operation_center',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '工作台',
      hideInMenu: true
    },
    children: [{
      path: 'login_log',
      name: 'login_log',
      meta: {
        icon: ' iconfont icon-gouxuan',
        title: '登录日志',
        hideInMenu: true
      },
      component: () => import('@/view/workCenter/loginLog.vue')
    }]
  },
  {
    path: '/setting',
    name: '_setting',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '设置',
      hideInMenu: true
    },
    children: [{
        path: 'operating',
        name: 'operating',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '操作记录',
          hideInMenu: true
        },
        component: () => import('@/view/setting/operating.vue')
      },
      {
        path: 'amend',
        name: 'amend',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '修改密码',
          hideInMenu: true
        },
        component: () => import('@/view/setting/amend.vue')
      },
      {
        path: 'versionManage',
        name: 'versionManage',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '版本管理',
          hideInMenu: false
        },
        component: () => import('@/view/setting/versionManage.vue')
      }
    ]
  },
  {
    path: '/content',
    name: '_content',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '内容',
      hideInMenu: true
    },
    children: [{
        path: 'content',
        name: 'content',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '内容管理',
          hideInMenu: true
        },
        component: () => import('@/view/content/contentManagement/content.vue')
      },
      {
        path: 'content/detail',
        name: 'contentDetail',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '内容详情',
          hideInMenu: true
        },
        component: () => import('@/view/content/contentManagement/contentDetail.vue')
      },
      {
        path: 'content/:mode/:id?',
        name: 'add_content',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '添加内容',
          hideInMenu: true
        },
        component: () => import('@/view/content/contentManagement/edit.vue')
      },
      {
        path: 'category',
        name: 'category',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '分类管理',
          hideInMenu: true
        },
        component: () => import('@/view/content/category/cateManagement.vue')
      },
      {
        path: 'category/:mode/:id?',
        name: 'add_category',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '添加分类',
          hideInMenu: true
        },
        component: () => import('@/view/content/category/edit.vue')
      },
      {
        path: 'tag',
        name: 'tag',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '标签管理',
          hideInMenu: true
        },
        component: () => import('@/view/content/tagManagement/tag.vue')
      },
      {
        path: 'tag/:mode/:id?',
        name: 'add_tag',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '添加标签',
          hideInMenu: true
        },
        component: () => import('@/view/content/tagManagement/edit.vue')
      },
      {
        path: 'comment',
        name: 'comment',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '评论列表',
          hideInMenu: true
        },
        component: () => import('@/view/content/comment.vue')
      }
    ]
  },
  {
    path: '/user',
    name: '_user',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '用户',
      hideInMenu: true
    },
    children: [{
        path: 'virtualUser',
        name: 'virtualUser',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '虚拟用户列表',
          hideInMenu: true
        },
        component: () => import('@/view/user/virtualUser.vue')
      },
      {
        path: 'userDetail',
        name: 'userDetail',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '用户详情',
          hideInMenu: true
        },
        component: () => import('@/view/user/userDetail.vue')
      },
      {
        path: 'bannedList',
        name: 'bannedList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '用户封禁列表',
          hideInMenu: true
        },
        component: () => import('@/view/user/bannedList.vue')
      },
      {
        path: 'userList',
        name: 'userList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '用户列表',
          hideInMenu: true
        },
        component: () => import('@/view/user/userList.vue')
      }
      // {
      //   path: 'userGroup',
      //   name: 'userGroup',
      //   meta: {
      //     icon: ' iconfont icon-gouxuan',
      //     title: '用户分组',
      //     hideInMenu: false
      //   },
      //   component: () => import('@/view/user/userGroup.vue')
      // },
    ]
  },
  {
    path: '/operation',
    name: '_operation',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '运营',
      hideInMenu: true
    },
    children: [
      // {
      //   path: 'version',
      //   name: 'version',
      //   meta: {
      //     icon: ' iconfont icon-gouxuan',
      //     title: '版本管理',
      //     hideInMenu: true
      //   },
      //   component: () => import('@/view/operation/version.vue')
      // },

      {
        path: 'station_letter',
        name: 'stationLetter',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '站内信消息',
          hideInMenu: true
        },
        component: () => import('@/view/operation/stationLetter/stationLetter.vue')
      },
      {
        path: 'station_letter/type',
        name: 'messageType',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '选择消息类型',
          hideInMenu: true
        },
        component: () => import('@/view/operation/stationLetter/selectType.vue')
      },
      {
        path: 'station_letter/send',
        name: 'sendMessage',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '发送站内信',
          hideInMenu: true
        },
        component: () => import('@/view/operation/stationLetter/sendMessage.vue')
      },
      {
        path: 'app',
        name: 'app',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '推送消息',
          hideInMenu: true
        },
        component: () => import('@/view/operation/appMessage/appMessage.vue')
      },
      {
        path: 'code',
        name: 'code',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '验证码记录',
          hideInMenu: true
        },
        component: () => import('@/view/operation/code.vue')
      },
      {
        path: 'sensitive',
        name: 'sensitive',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '敏感词库',
          hideInMenu: true
        },
        component: () => import('@/view/operation/sensitiveWord/sensitiveWord.vue')
      },
      {
        path: 'ad_list',
        name: 'ad_list',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '广告管理',
          hideInMenu: true
        },
        component: () => import('@/view/operation/adList/adList.vue')
      },
      {
        path: 'report',
        name: 'report',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '举报列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/report.vue')
      },
      {
        path: 'imageList',
        name: 'imageList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '图片列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/imageList.vue')
      },
      {
        path: 'add_banner/:mode',
        name: 'add_banner',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '添加banner',
          hideInMenu: true
        },
        component: () => import('@/view/operation/adList/addBanner.vue')
      },
      {
        path: `add_ad/:mode`,
        name: 'add_ad',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '添加弹窗广告',
          hideInMenu: true
        },
        component: () => import('@/view/operation/adList/addAd.vue')
      },
      {
        path: `add_screen`,
        name: 'add_screen',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '添加开屏页',
          hideInMenu: true
        },
        component: () => import('@/view/operation/adList/addScreen.vue')
      },
      {
        path: 'version',
        name: 'version',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '版本管理',
          hideInMenu: true
        },
        component: () => import('@/view/operation/version.vue')
      },
      {
        path: 'managementList',
        name: 'managementList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '百科管理员列表',
          hideInMenu: false
        },
        component: () => import('@/view/operation/managementList.vue')
      },
      {
        path: 'feedback',
        name: 'feedback',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '意见反馈',
          hideInMenu: true
        },
        component: () => import('@/view/operation/feedback.vue')
      },
      {
        path: 'publicMedal',
        name: 'publicMedal',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '发放勋章列表',
          hideInMenu: false
        },
        component: () => import('@/view/operation/publicMedal/publicMedal.vue')
      },
      {
        path: 'medal',
        name: 'medal',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '勋章列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/medal.vue')
      },
      {
        path: 'gameEmploy',
        name: 'gameEmploy',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏收录列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/gameEmploy.vue')
      },
      {
        path: 'applyAdmin',
        name: 'applyAdmin',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '申请管理员列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/applyAdmin/applyAdmin.vue')
      },
      {
        path: 'circle',
        name: 'circle',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '圈子列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/circle/circle.vue')
      },
      {
        path: 'questionAndAnswserList',
        name: 'questionAndAnswserList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '问答团列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/questionAndAnswer/questionAndAnswserList.vue')
      },
      {
        path: 'lookRecommendList',
        name: 'lookRecommendList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '关注推荐列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/lookRecommend/lookRecommendList.vue')
      },
      {
        path: 'lightenEncyclopediaList',
        name: 'lightenEncyclopediaList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '点亮百科列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/lightenEncyclopedia/lightenEncyclopediaList.vue')
      },
      {
        path: 'wikiErrorList',
        name: 'wikiErrorList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '百科纠错列表',
          hideInMenu: false
        },
        component: () => import('@/view/operation/wikiErrorList/wikiErrorList.vue')
      },
      {
        path: 'experApplyList',
        name: 'experApplyList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '达人认证申请列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/experApply/experApplyList.vue')
      },
      // {
      //   path: 'wikiAdminList',
      //   name: 'wikiAdminList',
      //   meta: {
      //     icon: ' iconfont icon-gouxuan',
      //     title: '百科管理员列表',
      //     hideInMenu: false
      //   },
      //   component: () => import('@/view/operation/wikiAdmin/wikiAdminList.vue')
      // }
      {
        path: 'circleCommentList',
        name: 'circleCommentList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          // title: '圈子评论列表',
          title: '帖子评论列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/circleCommentList.vue')
      },
      {
        path: 'circleManegeList',
        name: 'circleManegeList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '圈子管理员列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/circleManegeList.vue')
      },
      {
        path: 'gameMetrics',
        name: 'gameMetrics',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏指标列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/gameMetrics/gameMetrics.vue')
      },

      {
        path: 'invitation',
        name: 'invitation',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '帖子列表',
          hideInMenu: true
        },
        component: () => import('@/view/operation/invitation/invitation.vue')
      }
    ]
  },

  // {
  //   path: '/financial',
  //   name: 'financial',
  //   component: Main,
  //   meta: {
  //     icon: ' iconfont icon-zhanduiyijiesan',
  //     title: '财务管理',
  //     hideInMenu: true
  //   },
  //   children: [{
  //     path: 'financials',
  //     name: 'financials',
  //     meta: {
  //       icon: ' iconfont icon-gouxuan',
  //       title: '财务管理',
  //       hideInMenu: true
  //     },
  //     component: () => import('@/view/financial/financial.vue')
  //   }]
  // },
  {
    path: '/active',
    name: 'active',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '活动',
      hideInMenu: true
    },
    children: [{
        path: 'opinion',
        name: 'opinion',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '意见收发室',
          hideInMenu: true
        },
        component: () => import('@/view/active/opinion.vue')
      },
      {
        path: 'gambit',
        name: 'gambit',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '瞎聊什么',
          hideInMenu: true
        },
        component: () => import('@/view/active/gambit.vue')
      },
      {
        path: 'superIdol',
        name: 'superIdol',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '超级偶像',
          hideInMenu: true
        },
        component: () => import('@/view/active/superIdol.vue')
      }
    ]
  },
  {
    path: '/currencySystem',
    name: 'currencySystem',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '货币系统',
      hideInMenu: true
    },
    children: [{
        path: 'currencyMessage',
        name: 'currencyMessage',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '货币信息',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/currencyMessage/index.vue')
      },
      {
        path: 'userCurrencyList',
        name: 'userCurrencyList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '用户货币列表',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/userCurrencyList.vue')
      },
      {
        path: 'rechargeList',
        name: 'rechargeList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '充值订单列表',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/rechargeList.vue')
      },
      {
        path: 'currencyGainList',
        name: 'currencyGainList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '货币获取列表',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/currencyGainList.vue')
      },
      {
        path: 'currencyConsumeList',
        name: 'currencyConsumeList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '货币消耗列表',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/currencyConsumeList.vue')
      },
      {
        path: 'currencyManageLog',
        name: 'currencyManageLog',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '货币管理日志',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/currencyManageLog.vue')
      },
      {
        path: 'nodeSendTemplate',
        name: 'nodeSendTemplate',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '短信发送模板',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/nodeSendTemplate.vue')
      },
      {
        path: 'controlSystem',
        name: 'controlSystem',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '风控系统',
          hideInMenu: true
        },
        component: () => import('@/view/currencySystem/controlSystem.vue')
      },
      {
        path: 'withdraw',
        name: 'withdraw',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '提现审核列表',
          hideInMenu: true
        },
        component: () => import('@/view/financial/withdraw.vue')
      }
    ]
  },
  {
    path: '/market',
    name: 'market',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '商城',
      hideInMenu: true
    },
    children: [{
        path: 'auth',
        name: 'auth',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '权限开关',
          hideInMenu: true
        },
        component: () => import('@/view/market/auth.vue')
      },
      {
        path: 'toolList',
        name: 'toolList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '道具列表',
          hideInMenu: true
        },
        component: () => import('@/view/market/toolList.vue')
      },
      {
        path: 'orderList',
        name: 'orderList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '订单列表',
          hideInMenu: true
        },
        component: () => import('@/view/market/orderList.vue')
      },
      {
        path: 'outOrderList',
        name: 'outOrderList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '道具取出列表',
          hideInMenu: true
        },
        component: () => import('@/view/market/outOrderList.vue')
      },
      {
        path: 'sortToolList',
        name: 'sortToolList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '道具分类表',
          hideInMenu: true
        },
        component: () => import('@/view/market/sortToolList.vue')
      }
    ]
  },
  {
    path: '/upload',
    name: 'upload',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '上传',
      hideInMenu: true
    },
    children: [{
      path: 'upload',
      name: 'file-upload',
      meta: {
        icon: ' iconfont icon-gouxuan',
        title: '上传文件',
        hideInMenu: true
      },
      component: () => import('@/view/upload/upload.vue')
    }]
  },
  // 游戏
  {
    path: '/game',
    name: 'game',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '游戏',
      hideInMenu: true
    },
    children: [{
        path: 'gameList',
        name: 'gamelist',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏列表',
          hideInMenu: true
        },
        component: () => import('@/view/game/gameList.vue')
      },
      {
        path: 'gameEvaluationList',
        name: 'gameEvaluationList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏评价列表',
          hideInMenu: false
        },
        component: () => import('@/view/game/gameEvaluationList.vue')
      },
      {
        path: `gameCommentList`,
        name: 'gamecommentList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏评论',
          hideInMenu: true
        },
        component: () => import('@/view/game/gameCommentList.vue')
      },

      {
        path: 'game/gameCommentDetail',
        name: 'gameCommentDetail',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏评价详情',
          hideInMenu: true
        },
        component: () => import('@/view/game/gameCommentDetail.vue')
      },
      
      {
        path: 'encyclopedia',
        name: 'encyclopedia',
        meta: {
          hideInMenu: true,
          title: '百科模块'
        },
        // component: () => import('@/view/game/encyclopedia.vue')
        component: () => import('@/view/game/encyclopedia/moduleChoose.vue')
      },
      {
        path: 'encyclopedia/addOrEdit_content/:submod_id?',
        name: 'addOrEdit_content',
        meta: {
          title: '添加内容',
          hideInMenu: true
        },
        beforeEnter: (to, from, next) => {
          to.meta.title = to.query.content_id === undefined ? '添加内容' : '编辑内容'
          next()
        },
        component: () => import('@/view/game/encyclopedia/components/components/addOrEdit_content')
      },
      {
        path: 'encyclopedia/addOrEdit_banner/:submod_id?',
        name: 'addOrEdit_banner',
        meta: {
          title: '添加banner',
          hideInMenu: true
        },
        beforeEnter: (to, from, next) => {
          to.meta.title = to.query.id === undefined ? '添加bnenr' : '编辑banner'
          next()

        },
        component: () => import('@/view/game/encyclopedia/components/components/addOrEdit_banner')
      },
      {
        path: 'editmoudel/:mode/:id?',
        name: 'editmoudelContent',
        meta: {
          title: '编辑模板',
          hideInMenu: true
        },
        component: () => import('@/view/game/encyclopedia/components/components/editMoudle.vue')
      },

      {
        path: 'gameDetail',
        name: 'gameDetail',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏详情',
          hideInMenu: true
        },
        component: () => import('@/view/game/gameDetail.vue')
      },
      {
        path: 'gameCheck',
        name: 'gameCheck',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏审核列表',
          hideInMenu: true
        },
        component: () => import('@/view/game/gameCheck.vue')
      },
      {
        path: 'gameTag',
        name: 'gameTag',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏分类列表',
          hideInMenu: true
        },
        component: () => import('@/view/game/gameClass/gameTag.vue'),
        beforeEnter: (to, from, next) => {
          if (from.name === 'bannerManage') {
            window.localStorage.setItem('tab', 2)
          } else {
            window.localStorage.setItem('tab', 1)
          }
          next()
        }
      },
      {
        path: 'bannerManage',
        name: 'bannerManage',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: 'banner管理',
          hideInMenu: true
        },
        component: () => import('@/view/game/bannerManage.vue')
      },
      {
        path: 'resourceManageList',
        name: 'resourceManageList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '资源位管理',
          hideInMenu: true
        },
        component: () => import('@/view/game/resourceManage/resourceManageList.vue')
      },
      {
        path: 'editCircle',
        name: 'editCircle',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '编辑圈子',
          hideInMenu: true
        },
        component: () => import('@/view/game/editCircle.vue'),
      },
      {
        path: 'addBanner',
        name: 'addBanner',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '添加Banner',
          hideInMenu: true
        },
        beforeEnter: (to, from, next) => {
          console.log('to', to)
          if (to.query.bannerId) {
            to.meta.title = "编辑Banner"
          } else {
            to.meta.title = "添加Banner"
          }
          next()
        },
        component: () => import('@/view/game/editCircleModule/addBanner.vue')
      },
      {
        path: 'checkDetail',
        name: 'gameCheckDetail',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '游戏审核列表编辑',
          hideInMenu: true
        },
        component: () => import('@/view/game/gameCheckDetail.vue')
      },
      {
        path: 'wordsCheckList',
        name: 'wordsCheckList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '百科词条审核列表',
          hideInMenu: false
        },
        component: () => import('@/view/game/wordsCheckList.vue')
      }
    ]
  },
  {
    path: '/waterSystem',
    name: 'waterSystem',
    component: Main,
    meta: {
      icon: ' iconfont icon-zhanduiyijiesan',
      title: '水军系统',
      hideInMenu: true
    },
    children: [{
        path: 'avatorStock',
        name: 'avatorStock',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '头像库',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/avatorStock.vue')
      },
      {
        path: 'waterUserList',
        name: 'waterUserList',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '虚拟用户列表',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/waterUserList.vue')
      },
      {
        path: `edit_user/:mode`,
        name: 'edit_user',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '编辑虚拟用户',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/editUser.vue')
      },
      {
        path: 'nicknameStock',
        name: 'nicknameStock',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '昵称库',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/nicknameStock.vue')
      },
      {
        path: 'briefStock',
        name: 'briefStock',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '简介库',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/briefStock.vue')
      },
      {
        path: 'commentStock',
        name: 'commentStock',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '评论库',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/commentStock.vue')
      },
      {
        path: 'evaluateStock',
        name: 'evaluateStock',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '评价库',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/evaluateStock.vue')
      },
      {
        path: 'contentStock',
        name: 'contentStock',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '内容库',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/contentStock.vue')
      },
      {
        path: `edit_content/:mode`,
        name: 'edit_content',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '资讯内容配置',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/editContent.vue')
      },
      {
        path: `edit_amway/:mode`,
        name: 'edit_amway',
        meta: {
          icon: ' iconfont icon-gouxuan',
          title: '安利文内容配置',
          hideInMenu: true
        },
        component: () => import('@/view/waterSystem/editAmway.vue')
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
import Router from 'vue-router'
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location)
}
