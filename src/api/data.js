import axios from '@/libs/api.request'

/**
 * 获取左侧动态菜单
 * @returns {*}
 */
export const mainList = () => {
  return axios.request({
    url: 'Index/getMenu',
    method: 'post'
  })
}
/***
 * 获取登录的校验码
 * @returns {*}
 */
export const getLoginCode = () => {
  return axios.request({
    url: 'Login/index',
    method: 'post'
  })
}
/***
 * 获取添加角色的校验码
 * @returns {*}
 */
export const getRoleCode = () => {
  return axios.request({
    url: 'Role/addView',
    method: 'post'
  })
}
/***
 * 获取修改角色的校验码
 * @returns {*}
 */
export const getUpdateRoleCode = data => {
  return axios.request({
    url: 'Role/editView',
    method: 'get',
    params: data
  })
}
/***
 * 添加角色
 * @param data
 * @returns {*}
 */
export const getRoleAdd = data => {
  return axios.request({
    url: 'Role/add',
    method: 'post',
    data: data
  })
}
/***
 * 删除角色
 * @param data
 * @returns {*}
 */
export const delRole = data => {
  return axios.request({
    url: 'Role/del',
    method: 'get',
    params: data
  })
}
/***
 * 权限列表
 * @returns {*}
 */
export const getPrivilegeList = () => {
  return axios.request({
    url: 'Privilege/index',
    method: 'post'
  })
}
/***
 * 启用禁用控制器权限
 * @returns {*}
 */
export const delPrivilege = data => {
  return axios.request({
    url: 'Privilege/del',
    method: 'post',
    data: data
  })
}
/***
 * 获取对应权限下的子权限
 * @returns {*}
 */
export const getSonPri = data => {
  return axios.request({
    url: 'Privilege/getSonPri',
    method: 'post',
    data: data
  })
}
/***
 * 获取修改权限的校验码
 * @returns {*}
 */
export const getSavePriCode = data => {
  return axios.request({
    url: 'Privilege/saveView',
    method: 'post',
    data: data
  })
}
/***
 * 获取添加权限的校验码
 * @returns {*}
 */
export const getPrivilegeAddCode = () => {
  return axios.request({
    url: 'Privilege/addView',
    method: 'post'
  })
}
/***
 * 添加权限
 * @returns {*}
 */
export const addPrivilege = data => {
  return axios.request({
    url: 'Privilege/add',
    method: 'post',
    data: data
  })
}
/***
 * 添加权限
 * @returns {*}
 */
export const savePrivilege = data => {
  return axios.request({
    url: 'Privilege/save',
    method: 'post',
    data: data
  })
}
/***
 * 角色列表
 * @returns {*}
 */
export const getRoleList = data => {
  return axios.request({
    url: 'Role/index',
    method: 'get',
    params: data
  })
}
/***
 * 修改角色列表
 * @param data
 * @returns {*}
 */
export const getRoleSave = data => {
  return axios.request({
    url: 'Role/edit',
    method: 'post',
    data: data
  })
}
/***
 * 添加管理用户
 * @returns {*}
 */
export const addUser = data => {
  return axios.request({
    url: 'Account/add',
    method: 'post',
    data: data
  })
}
/***
 * 删除管理用户
 * @returns {*}
 */
export const delUser = data => {
  return axios.request({
    url: 'Account/del',
    method: 'post',
    params: data
  })
}
/***
 * 新增管理员的校验码
 * @returns {*}
 */
export const getAddAccountCode = data => {
  return axios.request({
    url: 'Account/addView',
    method: 'get',
    params: data
  })
}
/***
 * 管理用户列表
 * @param data
 * @returns {*}
 */
export const getAccountList = data => {
  return axios.request({
    url: 'Account/index',
    method: 'get',
    params: data
  })
}
/***
 * 获取修改管理用户
 * @param data
 * @returns {*}
 */
export const getSaveView = data => {
  return axios.request({
    url: 'Account/editView',
    method: 'get',
    params: data
  })
}
/***
 * 修改用户
 * @param data
 * @returns {*}
 */
export const userSave = data => {
  return axios.request({
    url: 'Account/edit',
    method: 'post',
    data: data
  })
}
/***
 * 操作日志
 * @returns {*}
 */
export const getIndexLog = data => {
  return axios.request({
    url: 'Account/indexLog',
    method: 'post',
    data: data
  })
}
/***
 * 获取编辑用户密码的校验码
 * @param data
 * @returns {*}
 */
export const getEditPasswordCode = () => {
  return axios.request({
    url: 'Account/editPasswordView',
    method: 'post'
  })
}
/***
 * 编辑用户密码
 * @param data
 * @returns {*}
 */
export const getEditPassword = data => {
  return axios.request({
    url: 'Account/editPassword',
    method: 'post',
    data: data
  })
}
/***
 * 首页
 * @param data
 * @returns {*}
 */
export const getIndexStatistics = data => {
  return axios.request({
    url: 'indexStatistics/index',
    method: 'post',
    data: data
  })
}
/***
 * 获取门店信息
 * @param data
 * @returns {*}
 */
export const getChannelInfo = data => {
  return axios.request({
    url: 'channel/index',
    method: 'post',
    data: data
  })
}
/**
 * 启用|停用管理用户
 * @returns {*}
 */
export const startToStopUser = data => {
  return axios.request({
    url: 'Account/editStatus',
    method: 'post',
    params: data
  })
}
/**
 * 启用|停用角色
 * @returns {*}
 */
export const startToStopRole = data => {
  return axios.request({
    url: 'Role/editIsOn',
    method: 'get',
    params: data
  })
}

/***
 * 获取七牛云上传token
 * @param data
 * @returns {*}
 */
export const getQiniuToken = () => {
  return axios.request({
    url: 'common/qiniu/uptoken',
    method: 'get'
  })
}
/**
 *  获取添加话题的校验码
 * @returns {*}
 */
export const addTopicCode = () => {
  return axios.request({
    url: 'topic',
    method: 'get'
  })
}
/**
 *  添加话题
 * @returns {*}
 */
export const addTopic = data => {
  return axios.request({
    url: 'topic',
    method: 'post',
    data: data
  })
}
/**
 *  获取话题列表
 * @returns {*}
 */
export const getTopicList = data => {
  return axios.request({
    url: 'topic/index',
    method: 'get',
    params: data
  })
}
/**
 *  删除话题
 * @returns {*}
 */
export const deleteTopic = data => {
  return axios.request({
    url: 'topic/index',
    method: 'delete',
    data: data
  })
}
/**
 *  获取添加派对的校验码
 * @returns {*}
 */
export const addPartyCode = () => {
  return axios.request({
    url: 'party/checkcode',
    method: 'get'
  })
}
/**
 *  添加派对
 * @returns {*}
 */
export const addParty = data => {
  return axios.request({
    url: 'party',
    method: 'post',
    data: data
  })
}
/**
 *  获取派对列表
 * @returns {*}
 */
export const getPartyList = data => {
  return axios.request({
    url: 'party/index',
    method: 'get',
    params: data
  })
}
/**
 *  更新派对
 * @returns {*}
 */
export const updateParty = data => {
  return axios.request({
    url: 'party/' + data.params,
    method: 'put',
    params: data
  })
}
/**
 *   获取派对详情
 * @returns {*}
 */
export const getPartyDetails = data => {
  return axios.request({
    url: 'party/' + data,
    method: 'get'
  })
}
/**
 *  设置派对管理员
 * @returns {*}
 */
export const setAdmin = data => {
  return axios.request({
    url: 'party/setController/',
    method: 'post',
    data: data
  })
}
/**
 *  删除派对管理员
 * @returns {*}
 */
export const delController = data => {
  return axios.request({
    url: 'party/delController',
    method: 'post',
    data: data
  })
}
/**
 *  设置派对铭牌权限
 * @returns {*}
 */
export const setNameplate = data => {
  return axios.request({
    url: 'party/nameplatePermission',
    method: 'post',
    data: data
  })
}
/**
 *  用户派对加入官方/取消加入官方
 * @returns {*}
 */
export const joinOfficial = data => {
  return axios.request({
    url: 'party/joinOfficial',
    method: 'post',
    data: data
  })
}
/**
 *  派对审核列表
 * @returns {*}
 */
export const partyAuditList = data => {
  return axios.request({
    url: 'party/checkIndex',
    method: 'get',
    params: data
  })
}
/**
 *  批量审核派对【通过】
 * @returns {*}
 */
export const batchCheck = data => {
  return axios.request({
    url: 'party/batchCheck',
    method: 'post',
    data: data
  })
}
/**
 *  批量审核派对【拒绝】
 * @returns {*}
 */
export const batchRefuse = data => {
  return axios.request({
    url: 'party/batchRefuse',
    method: 'post',
    data: data
  })
}
/**
 *  派对审核申请
 * @returns {*}
 */
export const partyAuditApply = data => {
  return axios.request({
    url: 'party/check',
    method: 'post',
    data: data
  })
}
/**
 *  封禁派对(用户)
 * @returns {*}
 */
export const blockParty = data => {
  return axios.request({
    url: 'party/prohibit',
    method: 'post',
    data: data
  })
}
/**
 *  获取封禁原因及校验码
 * @returns {*}
 */
export const getProhibitReason = data => {
  return axios.request({
    url: 'party/getProhibitReason',
    method: 'get',
    params: data
  })
}
/**
 *  添加热门标签
 * @returns {*}
 */
export const addHotTags = data => {
  return axios.request({
    url: 'tag',
    method: 'post',
    data: data
  })
}
/**
 *  获取热门标签
 * @returns {*}
 */
export const getHotTags = () => {
  return axios.request({
    url: 'tag',
    method: 'get'
  })
}
/**
 *  获取礼物列表
 * @returns {*}
 */
export const getGiftList = data => {
  return axios.request({
    url: 'gift/index',
    method: 'get',
    params: data
  })
}
/**
 *  删除礼物
 * @returns {*}
 */
export const deleteGift = data => {
  return axios.request({
    url: 'gift',
    method: 'delete',
    data: data
  })
}
/**
 *  礼物上下架
 * @returns {*}
 */
export const shelfGift = data => {
  return axios.request({
    url: 'gift/shelf',
    method: 'post',
    data: data
  })
}
/**
 *  获取添加/编辑礼物校验码
 * @returns {*}
 */
export const getGiftCode = () => {
  return axios.request({
    url: 'gift/checkcode',
    method: 'GET'
  })
}
/**
 *  添加礼物
 * @returns {*}
 */
export const addGift = data => {
  return axios.request({
    url: 'gift',
    method: 'post',
    data: data
  })
}
/**
 *  更新礼物
 * @returns {*}
 */
export const updateGift = data => {
  return axios.request({
    url: 'gift/' + data.params,
    method: 'put',
    params: data
  })
}
/**
 *  人气排行榜
 * @returns {*}
 */
export const rankingList = data => {
  return axios.request({
    url: 'Ranking/getRankingList',
    method: 'get',
    params: data
  })
}
/**
 *  获取最近六周开始和结束时间
 * @returns {*}
 */
export const getWeek = data => {
  return axios.request({
    url: 'Ranking/getWeek',
    method: 'get',
    params: data
  })
}
/**
 *  获取banner列表
 * @returns {*}
 */
export const getBanner = data => {
  return axios.request({
    url: 'banner/index',
    method: 'get',
    params: data
  })
}
/**
 *  获取广告类型
 * @returns {*}
 */
export const getBannerType = data => {
  return axios.request({
    url: 'banner/getAdType',
    method: 'get',
    params: data
  })
}
/**
 *  上传Banner图
 * @returns {*}
 */
export const saveNewBanner = data => {
  return axios.request({
    url: 'banner',
    method: 'post',
    data: data
  })
}
/**
 *  更新Banner图
 * @returns {*}
 */
export const updateOldBanner = data => {
  return axios.request({
    url: 'banner/' + data.params,
    method: 'put',
    params: data
  })
}
/**
 *  删除Banner图
 * @returns {*}
 */
export const delBanner = data => {
  return axios.request({
    url: 'banner/del',
    method: 'get',
    params: data
  })
}
/**
 *  获取上传广告的校验码
 * @returns {*}
 */
export const getCheckCode = data => {
  return axios.request({
    url: 'banner/checkcode',
    method: 'get',
    params: data
  })
}
/**
 *  获取投诉举报详情
 * @returns {*}
 */
export const getComDetail = data => {
  return axios.request({
    url: 'complaint/detail',
    method: 'get',
    params: data
  })
}
/**
 *  获取投诉举报列表[已处理]
 * @returns {*}
 */
export const getComHandled = data => {
  return axios.request({
    url: 'complaint/handle',
    method: 'get',
    params: data
  })
}
/**
 *  封禁操作[封禁/解禁/修改]
 * @returns {*}
 */
export const saveComPending = data => {
  return axios.request({
    url: 'complaint',
    method: 'post',
    data: data
  })
}
/**
 *  获取投诉举报列表[待处理]
 * @returns {*}
 */
export const getComPending = data => {
  return axios.request({
    url: 'complaint',
    method: 'get',
    params: data
  })
}
/**
 *  忽略投诉举报
 * @returns {*}
 */
export const saveIgnoreCom = data => {
  return axios.request({
    url: 'complaint/' + data.id,
    method: 'put',
    params: data
  })
}
/**
 *  获取校验码,封禁原因,封禁类型，封禁时长
 * @returns {*}
 */
export const getComConfig = data => {
  return axios.request({
    url: 'complaint/config',
    method: 'get',
    params: data
  })
}
/**
 *  获取标签列表
 * @returns {*}
 */
export const getTagList = data => {
  return axios.request({
    url: 'appTags/getAppTagLists',
    method: 'get',
    params: data
  })
}
/**
 *  获取app标签数据
 * @returns {*}
 */
export const getAppTagDataById = data => {
  return axios.request({
    url: 'appTags/getAppTagData',
    method: 'post',
    data: data
  })
}
/**
 *  获取单个标签信息
 * @returns {*}
 */
export const getTagInfo = data => {
  return axios.request({
    url: 'appTags/getOneDetail',
    method: 'get',
    params: data
  })
}
/**
 *  新增标签
 * @returns {*}
 */
export const addTag = data => {
  return axios.request({
    url: 'appTags/appTagAdd',
    method: 'post',
    data: data
  })
}
/**
 *  新增标签前获取校验码
 * @returns {*}
 */
export const getTagCheckCode = data => {
  return axios.request({
    url: 'appTags/getCheckCode',
    method: 'get',
    params: data
  })
}
/**
 *  编辑标签
 * @returns {*}
 */
export const editTag = data => {
  return axios.request({
    url: 'appTags/appTagEdit',
    method: 'post',
    data: data
  })
}
/**
 *  删除标签
 * @returns {*}
 */
export const deleteTag = data => {
  return axios.request({
    url: 'appTags/appTagDelete',
    method: 'post',
    data: data
  })
}
/**
 *  获取APP分类列表
 * @returns {*}
 */
export const getCategoryList = data => {
  return axios.request({
    url: 'category/getCategoryLists',
    method: 'get',
    params: data
  })
}
/**
 *  添加单个APP分类
 * @returns {*}
 */
export const addCategory = data => {
  return axios.request({
    url: 'category/categoryAdd',
    method: 'post',
    data: data
  })
}
/**
 *  添加APP分类之前获取校验码
 * @returns {*}
 */
export const getCateCheckCode = data => {
  return axios.request({
    url: 'category/getCheckCode',
    method: 'post',
    data: data
  })
}
/**
 *  编辑APP分类
 * @returns {*}
 */
export const editCategory = data => {
  return axios.request({
    url: 'category/categoryEdit',
    method: 'post',
    data: data
  })
}
/**
 *  获取单个APP分类信息
 * @returns {*}
 */
export const getCategoryInfo = data => {
  return axios.request({
    url: 'category/getOneDetail',
    method: 'get',
    params: data
  })
}
/**
 *  删除单个APP分类
 * @returns {*}
 */
export const deleteCategory = data => {
  return axios.request({
    url: 'category/categoryDelete',
    method: 'post',
    data: data
  })
}
/**
 *  点赞资讯
 * @returns {*}
 */
export const likeContent = data => {
  return axios.request({
    url: 'AppGameAssessComment/likeContent',
    method: 'post',
    data
  })
}
/**
 *  点赞安利文
 * @returns {*}
 */
export const likeGameAssess = data => {
  return axios.request({
    url: 'AppGameAssessComment/likeGameAssess',
    method: 'post',
    data
  })
}
/**
 *  获取评论组
 * @returns {*}
 */
export const getCommentGroupData = data => {
  return axios.request({
    url: 'AppGameAssessComment/getCommentGroupData',
    method: 'get',
    params: data
  })
}
/**
 *  获取评论列表
 * @returns {*}
 */
export const getCommentList = data => {
  return axios.request({
    url: 'comment/getCommentLists',
    method: 'get',
    params: data
  })
}
/**
 *  删除评论
 * @returns {*}
 */
export const delComment = data => {
  return axios.request({
    url: 'comment/delComment',
    method: 'post',
    data: data
  })
}
/**
 *  获取内容列表
 * @returns {*}
 */
export const getContentLists = data => {
  return axios.request({
    url: 'content/getContentLists',
    method: 'get',
    params: data
  })
}
/**
 *  新增内容
 * @returns {*}
 */
export const addContentData = data => {
  return axios.request({
    url: 'content/addContentData',
    method: 'post',
    data: data
  })
}
/**
 *  获取分类数据
 * @returns {*}
 */
export const getCategoryData = data => {
  return axios.request({
    url: 'content/getCategoryData',
    method: 'post',
    data: data
  })
}
/**
 *  删除内容
 * @returns {*}
 */
export const delContent = data => {
  return axios.request({
    url: 'content/delContent',
    method: 'post',
    data: data
  })
}
/**
 *  导出内容
 * @returns {*}
 */
export const exportContentList = data => {
  return axios.request({
    url: 'content/exportContentList',
    method: 'get',
    params: data
  })
}
/**
 *  获取内容详情
 * @returns {*}
 */
export const getContentInfo = data => {
  return axios.request({
    url: 'content/getContentInfo',
    method: 'get',
    params: data
  })
}
/**
 *  内容详情评论列表
 * @returns {*}
 */
export const getContentCommentList = data => {
  return axios.request({
    url: 'content/getCommentList',
    method: 'get',
    params: data
  })
}
/**
 *  获取安利文详情
 * @returns {*}
 */
export const getAssessInfo = data => {
  return axios.request({
    url: 'AppGameAssessComment/getAssessInfo',
    method: 'get',
    params: data
  })
}
/**
 *  编辑内容
 * @returns {*}
 */
export const editContentInfo = data => {
  return axios.request({
    url: 'content/editContentData',
    method: 'post',
    data: data
  })
}
/**
 *  编辑内容
 * @returns {*}
 */
export const editContentData = data => {
  return axios.request({
    url: 'content/editContentData',
    method: 'get',
    params: data
  })
}
/**
 *  启用或禁用内容
 * @returns {*}
 */
export const setContentStatus = data => {
  return axios.request({
    url: 'content/isStart',
    method: 'post',
    data: data
  })
}
/**
 *  获取添加内容的校验码
 * @returns {*}
 */
export const getContentCheckCode = data => {
  return axios.request({
    url: 'content/getCheckCode',
    method: 'get',
    params: data
  })
}
/**
 *  获取内容标签数据
 * @returns {*}
 */
export const getAppTagData = data => {
  return axios.request({
    url: 'content/getAppTagData',
    method: 'post',
    data: data
  })
}
/**
 *  获取添加游戏里面的标签
 * @returns {*}
 */
export const getCategoryLists = data => {
  // console.log('data',data)
  return axios.request({
    url: 'GameCategory/getCategoryLists',
    method: 'get',
    params: data
  })
}
/**
 *  查看标签
 * @returns {*}
 */
export const getContentTagById = data => {
  return axios.request({
    url: 'content/getContentTagById',
    method: 'post',
    data: data
  })
}
/**
 *  获取发布账号数据
 * @returns {*}
 */
export const getContentUserData = data => {
  return axios.request({
    url: 'content/getUserData',
    method: 'post',
    data: data
  })
}
/**
 *  获取发布账号数据
 * @returns {*}
 */
export const getGameData = data => {
  return axios.request({
    url: 'content/getGameData',
    method: 'post',
    data: data
  })
}
/**
 *  获取用户列表
 * @returns {*}
 */
export const getUserList = data => {
  return axios.request({
    url: 'User/getUserList',
    method: 'get',
    params: data
  })
}
/**
 *  用户列表更新达人状态
 * @returns {*}
 */
export const updateMasterStatus = data => {
  return axios.request({
    url: 'User/updateMasterStatus',
    method: 'post',
    data: data
  })
}
/**
 *  获取用户详情
 * @returns {*}
 */
export const getUserDetail = data => {
  return axios.request({
    url: 'User/getUserDetail',
    method: 'get',
    params: data
  })
}
/**
 *  获取用户详情
 * @returns {*}
 */
export const changePassword = data => {
  return axios.request({
    url: 'Setup/ChangePassword',
    method: 'get',
    params: data
  })
}
/**
 *  获取用户详情
 * @returns {*}
 */
export const prohibitUser = data => {
  return axios.request({
    url: 'User/prohibitUser',
    method: 'get',
    params: data
  })
}
/**
 *  获取用户详情
 * @returns {*}
 */
export const getProhibitUserList = data => {
  return axios.request({
    url: 'User/getProhibitUserList',
    method: 'get',
    params: data
  })
}
/**
 *  获取站内信消息列表
 * @returns {*}
 */
export const getStationLetter = data => {
  return axios.request({
    url: 'stationLetter/index',
    method: 'get',
    params: data
  })
}
/**
 *  获取关联作品列表
 * @returns {*}
 */
export const getRelationContent = data => {
  return axios.request({
    url: 'stationLetter/getRelationContent',
    method: 'get',
    params: data
  })
}
/**
 *  获取站内信消息校验码
 * @returns {*}
 */
export const getStationLetterCode = data => {
  return axios.request({
    url: 'stationLetter/addView',
    method: 'get',
    params: data
  })
}
/**
 *  删除站内信消息（1个或多个）
 * @returns {*}
 */
export const delStationLetter = data => {
  return axios.request({
    url: 'stationLetter/del',
    method: 'post',
    data: data
  })
}
/**
 *  发送站内消息
 * @returns {*}
 */
export const sendStationLetter = data => {
  return axios.request({
    url: 'stationLetter/add',
    method: 'post',
    data: data
  })
}
/**
 *  修改密码
 * @returns {*}
 */
export const revampPassword = data => {
  return axios.request({
    url: 'Setup/ChangePassword',
    method: 'get',
    params: data
  })
}
/**
 *  获取虚拟用户分组列表
 * @returns {*}
 */
export const getUserGroupList = data => {
  return axios.request({
    url: 'InventedUser/getUserGroupList',
    method: 'get',
    params: data
  })
}
/**
 *  删除用户分组列表
 * @returns {*}
 */
export const delGroup = data => {
  return axios.request({
    url: 'InventedUser/delGroup',
    method: 'get',
    params: data
  })
}
/**
 *  重命名用户分组
 * @returns {*}
 */
export const editUserGroup = data => {
  return axios.request({
    url: 'InventedUser/editUserGroup',
    method: 'get',
    params: data
  })
}
/**
 *  新增用户分组
 * @returns {*}
 */
export const addUserGroup = data => {
  return axios.request({
    url: 'InventedUser/addUserGroup',
    method: 'get',
    params: data
  })
}
/**
 *  用户加入分组
 * @returns {*}
 */
export const userJoinGroup = data => {
  return axios.request({
    url: 'InventedUser/userJoinGroup',
    method: 'get',
    params: data
  })
}
/**
 *  用户分组排序
 * @returns {*}
 */
export const groupSort = data => {
  return axios.request({
    url: 'InventedUser/groupSort',
    method: 'get',
    params: data
  })
}
/**
 *  获取虚拟用户列表
 * @returns {*}
 */
export const getVirtualList = data => {
  return axios.request({
    url: 'InventedUser/getUserList',
    method: 'get',
    params: data
  })
}
/**
 *  获取添加虚拟用户页面数据
 * @returns {*}
 */
export const getAddUserData = data => {
  return axios.request({
    url: 'InventedUser/getAddUserData',
    method: 'get',
    params: data
  })
}
/**
 *  添加虚拟用户
 * @returns {*}
 */
export const getAddVirtualUser = data => {
  return axios.request({
    url: 'InventedUser/addUser',
    method: 'post',
    data: data
  })
}
/**
 *  获取城市三级联动JSON
 * @returns {*}
 */
export const getAreaList = data => {
  return axios.request({
    url: 'Common/getAreaList',
    method: 'post',
    data: data
  })
}
/**
 *  获取编辑虚拟用户页面数据
 * @returns {*}
 */
export const getEditUserData = data => {
  return axios.request({
    url: 'InventedUser/getEditUserData',
    method: 'post',
    data: data
  })
}
/**
 *  获取编辑虚拟用户页面数据
 * @returns {*}
 */
export const relieveProhibitUser = data => {
  return axios.request({
    url: 'User/relieveProhibitUser',
    method: 'get',
    params: data
  })
}
/**
 *  获取编辑虚拟用户页面数据
 * @returns {*}
 */
export const editUser = data => {
  return axios.request({
    url: 'InventedUser/editUser',
    method: 'get',
    params: data
  })
}
/**
 *  导出虚拟用户数据
 * @returns {*}
 */
export const exportVirtualUserList = data => {
  return axios.request({
    url: 'InventedUser/exportUserList',
    method: 'get',
    params: data
  })
}
/**
 *  导出用户列表的数据
 * @returns {*}
 */
export const exportUserList = data => {
  return axios.request({
    url: 'User/exportUserList',
    method: 'get',
    params: data
  })
}
/**
 *  导出封禁用户列表数据
 * @returns {*}
 */
export const exportProhibitUserList = data => {
  return axios.request({
    url: 'User/exportProhibitUserList',
    method: 'get',
    params: data
  })
}
/**
 *  操作记录
 * @returns {*}
 */
export const getOperationLog = data => {
  return axios.request({
    url: 'Setup/getOperationLog',
    method: 'get',
    params: data
  })
}
/**
 *  验证码记录
 * @returns {*}
 */
export const getMsgRecord = data => {
  return axios.request({
    url: 'msgRecord/index',
    method: 'get',
    params: data
  })
}
/**
 *  APP推送消息列表
 * @returns {*}
 */
export const appMessageList = data => {
  return axios.request({
    url: 'ForwardNews/index',
    method: 'get',
    params: data
  })
}
/**
 *  添加APP推送消息
 * @returns {*}
 */
export const addAppMessage = data => {
  return axios.request({
    url: 'ForwardNews/add',
    method: 'post',
    data: data
  })
}
/**
 *  删除APP推送消息
 * @returns {*}
 */
export const delAppMessage = data => {
  return axios.request({
    url: 'ForwardNews/del',
    method: 'post',
    data: data
  })
}
/**
 *  获取APP推送消息操作校验码
 * @returns {*}
 */
export const appMessageCode = data => {
  return axios.request({
    url: 'ForwardNews/addView',
    method: 'get',
    params: data
  })
}
/**
 *  获取敏感词列表
 * @returns {*}
 */
export const getWordsList = data => {
  return axios.request({
    url: 'SensitiveWords/getWordsList',
    method: 'get',
    params: data
  })
}
/**
 *  编辑敏感词
 * @returns {*}
 */
export const editWords = data => {
  return axios.request({
    url: 'SensitiveWords/editWords',
    method: 'get',
    params: data
  })
}
/**
 *  添加敏感词
 * @returns {*}
 */
export const addWords = data => {
  return axios.request({
    url: 'SensitiveWords/addWords',
    method: 'get',
    params: data
  })
}
/**
 *  删除敏感词
 * @returns {*}
 */
export const delWords = data => {
  return axios.request({
    url: 'SensitiveWords/delWords',
    method: 'get',
    params: data
  })
}
/**
 *  获取添加敏感词页面数据
 * @returns {*}
 */
export const getAddWordsData = data => {
  return axios.request({
    url: 'SensitiveWords/getAddWordsData',
    method: 'get',
    params: data
  })
}
/**
 *  获取编辑敏感词页面数据
 * @returns {*}
 */
export const getEditWordsData = data => {
  return axios.request({
    url: 'SensitiveWords/getEditWordsData',
    method: 'get',
    params: data
  })
}
/**
 *  导入敏感词
 * @returns {*}
 */
export const importWords = data => {
  return axios.request({
    url: 'SensitiveWords/importWords',
    method: 'post',
    data: data
  })
}
/**
 *  获取导出敏感词列表数据
 * @returns {*}
 */
export const exportWordsList = data => {
  return axios.request({
    url: 'SensitiveWords/exportWordsList',
    method: 'get',
    params: data
  })
}
/**
 *  获取举报列表
 * @returns {*}
 */
export const getReport = data => {
  return axios.request({
    url: 'complaint/getReport',
    method: 'get',
    params: data
  })
}
/**
 *  获取举报详情
 * @returns {*}
 */
export const reportInfo = data => {
  return axios.request({
    url: 'complaint/reportInfo',
    method: 'get',
    params: data
  })
}
/**
 *  举报失败
 * @returns {*}
 */
export const ignoreInfo = data => {
  return axios.request({
    url: 'complaint/ignore',
    method: 'get',
    params: data
  })
}
/**
 *  举报成功
 * @returns {*}
 */
export const disposeInfo = data => {
  return axios.request({
    url: 'complaint/dispose',
    method: 'get',
    params: data
  })
}
/**
 *  登录日志
 * @returns {*}
 */
export const getLoginLog = data => {
  return axios.request({
    url: 'User/getLoginLog',
    method: 'get',
    params: data
  })
}
/**
 *  获取运营图片列表
 * @returns {*}
 */
export const operationImageList = data => {
  return axios.request({
    url: 'Img/index',
    method: 'get',
    params: data
  })
}
/**
 *   申请圈子管理员列表
 * @returns {*}
 */
export const applyCircleMagageList = data => {
  return axios.request({
    url: 'CircleAdmin/applyIndex',
    method: 'get',
    params: data
  })
}
/**
 *   通过|拒绝用户申请圈子管理员记录
 * @returns {*}
 */
export const examineApply = data => {
  return axios.request({
    url: 'CircleAdmin/examineApply',
    method: 'post',
    data: data
  })
}
/**
 *   删除用户申请圈子管理记录[通过|拒绝后]
 * @returns {*}
 */
export const delCircleApply = data => {
  return axios.request({
    url: 'CircleAdmin/delApply',
    method: 'post',
    data: data
  })
}
/**
 *  获取圈子管理员列表
 * @returns {*}
 */
export const getCircleAdminList = data => {
  return axios.request({
    url: 'CircleAdmin/getList',
    method: 'post',
    data: data
  })
}
/**
 *  获取圈子管理员列表--编辑初始化数据
 * @returns {*}
 */
export const getCircleEditInfo = data => {
  return axios.request({
    url: 'CircleAdmin/getEditInfo',
    method: 'post',
    data: data
  })
}

/**
 *  搜索圈子列表
 * @returns {*}
 */
export const searchCircleList = data => {
  return axios.request({
    url: 'CircleAdmin/getCircleList',
    method: 'post',
    data: data
  })
}
/**
 *  搜索圈子列表
 * @returns {*}
 */
export const addChangeCircleAdmin = data => {
  return axios.request({
    url: 'CircleAdmin/create',
    method: 'post',
    data: data
  })
}
/**
 *  获取圈子管理员校验码(达人认证页面也用到这个)
 * @returns {*}
 */
export const GameMetricsAdminCheckCode = data => {
  return axios.request({
    url: 'CheckCode/getCode',
    method: 'get',
    params: data
  })
}

/**
 *  圈子评论列表获取 (CircleComment/getDeepList 这个接口分页有所不同)
 * @returns {*}
 */
export const circleCommentGetDeepList = data => {
  return axios.request({
    url: 'CircleComment/getList',
    method: 'post',
    data: data
  })
}
/**
 *  圈子评论列表删除
 * @returns {*}
 */
export const circleCommentDel = data => {
  return axios.request({
    url: 'CircleComment/del',
    method: 'post',
    data: data
  })
}
/**
 *  圈子管理列表删除
 * @returns {*}
 */
export const circleAdminDel = data => {
  return axios.request({
    url: 'CircleAdmin/del',
    method: 'post',
    data: data
  })
}
/**
 *  圈子管理修改状态
 * @returns {*}
 */
export const circleAdminSetStatus = data => {
  return axios.request({
    url: 'CircleAdmin/setStatus',
    method: 'post',
    data: data
  })
}
/**
 *  获取用户
 * @returns {*}
 */
export const circleGetUserInfo = data => {
  return axios.request({
    url: 'CircleAdmin/getUserInfo',
    method: 'post',
    data: data
  })
}
/**
 *  获取游戏指标分组列表
 * @returns {*}
 */
export const GameMetricsGameList = data => {
  return axios.request({
    url: 'GameMetrics/indexGroup',
    method: 'get',
    params: data
  })
}
/**
 *  获取新增群组的校验码
 * @returns {*}
 */
export const GameMetricsCode = data => {
  return axios.request({
    url: 'GameMetrics/addView',
    method: 'get',
    params: data
  })
}
/**
 *  新增群组
 * @returns {*}
 */
export const GameMetricsAddGroup = data => {
  return axios.request({
    url: 'GameMetrics/addGroup',
    method: 'post',
    data: data
  })
}
/**
 *  编辑群组
 * @returns {*}
 */
export const GameMetricsEditGroup = data => {
  return axios.request({
    url: 'GameMetrics/editGroup',
    method: 'post',
    data: data
  })
}
/**
 *  删除群组
 * @returns {*}
 */
export const GameMetricsDelGroup = data => {
  return axios.request({
    url: 'GameMetrics/delGroup',
    method: 'post',
    data: data
  })
}

/**
 *  获取添加群组时的游戏列表
 * @returns {*}
 */
export const GameMetricsGroupGameList = data => {
  return axios.request({
    url: 'GameMetrics/getGameList',
    method: 'post',
    data: data
  })
}
/**
 *  获取添加群组详情
 * @returns {*}
 */
export const GameMetricsDetailGroup = data => {
  return axios.request({
    url: 'GameMetrics/detailGroup',
    method: 'get',
    params: data
  })
}
/**
 *  获取图片列表校验码及封禁原因、封禁类型
 * @returns {*}
 */
export const imageListCheckcode = data => {
  return axios.request({
    url: 'Img/addView',
    method: 'post',
    data: data
  })
}
/**
 *  拒绝头像、图片申请
 * @returns {*}
 */
export const rejectImageApply = data => {
  return axios.request({
    url: 'Img/refuse',
    method: 'post',
    data: data
  })
}
/**
 *  通过[批量通过]图片审核
 * @returns {*}
 */
export const passImageApply = data => {
  return axios.request({
    url: 'Img/agree',
    method: 'post',
    data: data
  })
}
/**
 * 运营-修改广告排序
 * @returns {*}
 */
export const editSort = data => {
  return axios.request({
    url: 'Advertisement/editSort',
    method: 'get',
    params: data
  })
}
/**
 *  运营-显示隐藏广告
 * @returns {*}
 */
export const editIsShow = data => {
  return axios.request({
    url: 'Advertisement/editIsShow',
    method: 'get',
    params: data
  })
}
/**
 *  运营-删除广告
 * @returns {*}
 */
export const delAd = data => {
  return axios.request({
    url: 'Advertisement/del',
    method: 'get',
    params: data
  })
}
/**
 *  运营-批量删除广告
 * @returns {*}
 */
export const bulkDelAd = data => {
  return axios.request({
    url: 'Advertisement/bulkDel',
    method: 'get',
    params: data
  })
}
/**
 *  运营-新增广告的校验码
 * @returns {*}
 */
export const getAdCode = () => {
  return axios.request({
    url: 'Advertisement/addView',
    method: 'get'
  })
}
/**
 *  运营-新增|编辑广告的内容列表
 * @returns {*}
 */
export const getContentList = data => {
  return axios.request({
    url: 'Advertisement/getContentList',
    method: 'get',
    params: data
  })
}
/**
 *  运营-新增banner广告
 * @returns {*}
 */
export const bannerAdd = data => {
  return axios.request({
    url: 'Advertisement/bannerAdd',
    method: 'post',
    data: data
  })
}
/**
 *  运营-新增弹窗广告
 * @returns {*}
 */
export const popAdd = data => {
  return axios.request({
    url: 'Advertisement/popAdd',
    method: 'post',
    data: data
  })
}
/**
 *  运营-获取编辑banner广告验证码
 * @returns {*}
 */
export const bannerEditCode = data => {
  return axios.request({
    url: 'Advertisement/editView',
    method: 'get',
    params: data
  })
}
/**
 *  运营-编辑banner广告
 * @returns {*}
 */
export const bannerEdit = data => {
  return axios.request({
    url: 'Advertisement/bannerEdit',
    method: 'post',
    data: data
  })
}
/**
 *  运营-编辑banner广告
 * @returns {*}
 */
export const popEdit = data => {
  return axios.request({
    url: 'Advertisement/popEdit',
    method: 'post',
    data: data
  })
}
/**
 *  运营-广告列表
 * @returns {*}
 */
export const adList = data => {
  return axios.request({
    url: 'Advertisement/index',
    method: 'get',
    params: data
  })
}
/**
 *  运营-获取举报校验码
 * @returns {*}
 */
export const getReportCheckCode = data => {
  return axios.request({
    url: 'complaint/getCheckCode',
    method: 'get',
    params: data
  })
}
/**
 *  运营-获取版本管理列表
 * @returns {*}
 */
export const getVersionManagement = data => {
  return axios.request({
    url: 'Setup/versionManagement',
    method: 'get',
    params: data
  })
}
/**
 *  运营-百科管理员列表
 * @returns {*}
 */
export const indexUserAdmin = data => {
  return axios.request({
    url: 'ApplyAdmin/indexUserAdmin',
    method: 'post',
    data: data
  })
}
/**
 *  运营-百科管理 获取用户名字
 * @returns {*}
 */
export const getUser = data => {
  return axios.request({
    url: 'ApplyAdmin/getUser',
    method: 'post',
    data: data
  })
}
/**
 *  运营-添加百科管理员绑定游戏
 * @returns {*}
 */
export const addUserAdmin = data => {
  return axios.request({
    url: 'ApplyAdmin/addUserAdmin',
    method: 'post',
    data: data
  })
}
/**
 *  运营-修改百科管理员绑定游戏
 * @returns {*}
 */
export const editUserAdmin = data => {
  return axios.request({
    url: 'ApplyAdmin/editUserAdmin',
    method: 'post',
    data: data
  })
}
/**
 *  运营-添加百科管理员绑定游戏

 * @returns {*}
 */
export const getCheckCodeBai = data => {
  return axios.request({
    url: 'ApplyAdmin/getCheckCode',
    method: 'post',
    data: data
  })
}
/**
 *  运营-百科管理员列表状态更改
 * @returns {*}
 */
export const editUserAdminStatus = data => {
  return axios.request({
    url: 'ApplyAdmin/editUserAdminStatus',
    method: 'post',
    data: data
  })
}
/**
 *  运营-百科管理员列表删除
 * @returns {*}
 */
export const delUserAdmin = data => {
  return axios.request({
    url: 'ApplyAdmin/delUserAdmin',
    method: 'post',
    data: data
  })
}
/**
 *  运营-获取编辑版本页面数据
 * @returns {*}
 */
export const getEditVersionData = data => {
  return axios.request({
    url: 'Setup/getEditVersionData',
    method: 'get',
    params: data
  })
}
/**
 *  运营-更新版本
 * @returns {*}
 */
export const editVersion = data => {
  return axios.request({
    url: 'Setup/editVersion',
    method: 'get',
    params: data
  })
}
/**
 *  运营-更新版本
 * @returns {*}
 */
export const addVersion = data => {
  return axios.request({
    url: 'Setup/addVersion',
    method: 'get',
    params: data
  })
}
/**
 *  运营-删除版本
 * @returns {*}
 */
export const delVersion = data => {
  return axios.request({
    url: 'Setup/delVersion',
    method: 'get',
    params: data
  })
}

/**
 *  运营-删除招募管理员申请记录
 * @returns {*}
 */
export const delApply = data => {
  return axios.request({
    url: 'ApplyAdmin/delApply',
    method: 'get',
    params: data
  })
}
/**
 *  运营-审核招募管理员申请记录
 * @returns {*}
 */
export const checkStatus = data => {
  return axios.request({
    url: 'ApplyAdmin/checkStatus',
    method: 'get',
    params: data
  })
}
/**
 *  运营-获取招募管理员列表
 * @returns {*}
 */
export const indexApplyAdmin = data => {
  return axios.request({
    url: 'ApplyAdmin/indexApplyAdmin',
    method: 'get',
    params: data
  })
}

/**
 *  运营-获取百科管理员
 * @returns {*}
 */
export const ApplyAdmin = data => {
  return axios.request({
    url: 'ApplyAdmin/indexUserAdmin',
    method: 'post',
    params: data
  })
}
// /**
//  *  运营-删除百科管理员
//  * @returns {*}
//  */
// export const delUserAdmin = data => {
//   return axios.request({
//     url: 'ApplyAdmin/delUserAdmin',
//     method: 'post',
//     params: data
//   })
// }

/**
/**
 *  运营-获取游戏收录列表
 * @returns {*}
 */
export const gameIncludedListDel = data => {
  return axios.request({
    url: 'GameIncluded/del',
    method: 'get',
    params: data
  })
}
/**
 *  运营-获取游戏收录列表
 * @returns {*}
 */
export const getGameIncludedList = data => {
  return axios.request({
    url: 'GameCollection/getGameCollectionList',
    method: 'get',
    params: data
  })
}
/**
 *  运营-删除游戏收录列表
 * @returns {*}
 */
export const delGameCollection = data => {
  return axios.request({
    url: 'GameCollection/delGameCollection',
    method: 'get',
    params: data
  })
}
/**
 *  运营-获取勋章列表
 * @returns {*}
 */
export const getMedalList = data => {
  return axios.request({
    url: 'Medal/getMedalList',
    method: 'get',
    params: data
  })
}
/**
 *  运营- 删除勋章
 * @returns {*}
 */
export const delMedal = data => {
  return axios.request({
    url: 'Medal/delMedal',
    method: 'get',
    params: data
  })
}
/**
 *  运营-新增勋章
 * @returns {*}
 */
export const addMedal = data => {
  return axios.request({
    url: 'Medal/addMedal',
    method: 'post',
    data: data
  })
}
/**
 *  运营-修改勋章状态
 * @returns {*}
 */
export const saveMedalStatus = data => {
  return axios.request({
    url: 'Medal/saveMedalStatus',
    method: 'get',
    params: data
  })
}
/**
 *  运营-修改勋章状态
 * @returns {*}
 */
export const saveMedal = data => {
  return axios.request({
    url: 'Medal/saveMedal',
    method: 'post',
    data: data
  })
}

/**
 *  运营-获取反馈列表
 * @returns {*}
 */
export const getFeedback = data => {
  return axios.request({
    url: 'FeedBack/getFeedback',
    method: 'get',
    params: data
  })
}
/**
 *  运营-回复反馈列表
 * @returns {*}
 */
export const feedbackReplay = data => {
  return axios.request({
    // url: 'partyOpinion/replay',
    url: 'feedBack/replayFeedback',
    method: 'post',
    data: data
  })
}
/**
 *  运营-回复反馈列表
 * @returns {*}
 */
export const feedbackDelete = data => {
  return axios.request({
    url: 'feedBack/delFeedback',
    method: 'post',
    data: data
  })
}
/**
 *  运营-处理反馈列表
 * @returns {*}
 */
export const disposeFeedback = data => {
  return axios.request({
    url: 'feedBack/dispose',
    method: 'get',
    params: data
  })
}
/**
 *  用户-获取封禁用户页面数据
 * @returns {*}
 */
export const getProhibitUserData = data => {
  return axios.request({
    url: 'User/getProhibitUserData',
    method: 'get',
    params: data
  })
}
/*
 *  内容管理-派对内容列表
 * @returns {*}
 */
export const getPartyContent = data => {
  return axios.request({
    url: 'PartyContent/index',
    method: 'get',
    params: data
  })
}
/**
 *  修改封禁用户
 * @returns {*}
 */
export const editProhibitUser = data => {
  return axios.request({
    url: 'User/editProhibitUser',
    method: 'get',
    params: data
  })
}
/**
 *  内容管理-派对内容屏蔽|解除屏蔽
 * @returns {*}
 */
export const getEditStatus = data => {
  return axios.request({
    url: 'PartyContent/editStatus',
    method: 'get',
    params: data
  })
}
/**
 *  内容管理-删除派对内容
 * @returns {*}
 */
export const getDeleteConetnt = data => {
  return axios.request({
    url: 'PartyContent/del',
    method: 'get',
    params: data
  })
}
/**
 *  内容管理-批量删除派对内容
 * @returns {*}
 */
export const getBatchtDeleteConetnt = data => {
  return axios.request({
    url: 'PartyContent/deletes',
    method: 'get',
    params: data
  })
}
/**
 *  内容管理-新增派对内容的校验码
 * @returns {*}
 */
export const getPartyContentCode = data => {
  return axios.request({
    url: 'PartyContent/addView',
    method: 'get',
    params: data
  })
}
/**
 *  内容管理-新增派对内容
 * @returns {*}
 */
export const getAddPartyContent = data => {
  return axios.request({
    url: 'PartyContent/add',
    method: 'post',
    data: data
  })
}
/**
 *  运营操作-礼物列表
 * @returns {*}
 */
export const getGifDatatList = data => {
  return axios.request({
    url: 'gift/index',
    method: 'post',
    params: data
  })
}
/**
 *  运营操作-礼物上下架
 * @returns {*}
 */
export const geteditIsShow = data => {
  return axios.request({
    url: 'gift/editIsShow',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-删除礼物
 * @returns {*}
 */
export const getDelGift = data => {
  return axios.request({
    url: 'gift/del',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-新增礼物的校验码
 * @returns {*}
 */
export const getaddView = data => {
  return axios.request({
    url: 'gift/addView',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-新增礼物
 * @returns {*}
 */
export const getAddGift = data => {
  return axios.request({
    url: 'gift/add',
    method: 'post',
    data: data
  })
}
/**
 *  运营操作-编辑礼物校验码
 * @returns {*}
 */
export const geteditView = data => {
  return axios.request({
    url: 'gift/editView',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-编辑礼物
 * @returns {*}
 */
export const editGift = data => {
  return axios.request({
    url: 'gift/edit',
    method: 'post',
    data: data
  })
}
/**
 *  运营操作-获取每日门面列表
 * @returns {*}
 */
export const getIndexDailyFacade = data => {
  return axios.request({
    url: 'DailyFacade/indexDailyFacade',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-删除每日门面
 * @returns {*}
 */
export const getDelDailyFacade = data => {
  return axios.request({
    url: 'DailyFacade/delDailyFacade',
    method: 'post',
    data: data
  })
}
/**
 *  运营操作-获取每日门店评论列表
 * @returns {*}
 */
export const getDailyindexComment = data => {
  return axios.request({
    url: 'DailyFacade/indexComment',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-删除每日门面评论
 * @returns {*}
 */
export const getDailyindexdelComment = data => {
  return axios.request({
    url: 'DailyFacade/delComment',
    method: 'post',
    data: data
  })
}
/**
 *  运营操作-添加每日门面
 * @returns {*}
 */
export const getDailyindexAdd = data => {
  return axios.request({
    url: 'DailyFacade/add',
    method: 'post',
    data: data
  })
}
/**
 *  运营操作-添加每日门面校验码
 * @returns {*}
 */
export const getDailyindexAddCode = data => {
  return axios.request({
    url: 'DailyFacade/addView',
    method: 'post',
    data: data
  })
}
/**
 *  运营操作-获取派对管理审核列表
 * @returns {*}
 */
export const getPartyManagerList = data => {
  return axios.request({
    url: 'PartyReviewManager/index',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-删除派对管理审核
 * @returns {*}
 */
export const getPartyManagerdel = data => {
  return axios.request({
    url: 'PartyReviewManager/del',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-派对管理审核 通过|拒绝
 * @returns {*}
 */
export const partyManagerEditStatus = data => {
  return axios.request({
    url: 'PartyReviewManager/editStatus',
    method: 'get',
    params: data
  })
}
/**
 *  运营操作-导出派对管理审核列表
 * @returns {*}
 */
export const exportPartyManager = data => {
  return axios.request({
    url: 'PartyReviewManager/export',
    method: 'get',
    params: data
  })
}
/**
 *  运营-点亮百科列表
 * @returns {*}
 */
export const getLightGameWikiList = data => {
  return axios.request({
    url: 'GameResource/lightGameWikiList',
    method: 'get',
    params: data
  })
}
/**
 *  运营-查看点亮用户列表
 * @returns {*}
 */
export const seeLightGameWikiUserList = data => {
  return axios.request({
    url: 'GameResource/lightGameWikiUserList',
    method: 'get',
    params: data
  })
}
/**
 *  运营-查看关注推荐列表
 * @returns {*}
 */
export const getLookRecommendList = data => {
  return axios.request({
    url: 'FollowRecommend/lists',
    method: 'get',
    params: data
  })
}
/**
 *  运营-添加关注推荐列表
 * @returns {*}
 */
export const addFollowRecommend = data => {
  return axios.request({
    url: 'FollowRecommend/addFollowRecommend',
    method: 'get',
    params: data
  })
}
/**
 *  运营-删除关注推荐列表
 * @returns {*}
 */
export const deleteFollowRecommend = data => {
  return axios.request({
    url: 'FollowRecommend/deleteFollowRecommend',
    method: 'get',
    params: data
  })
}
/**
 *  运营-关注推荐列表排序
 * @returns {*}
 */
export const sortFollowRecommend = data => {
  return axios.request({
    url: 'FollowRecommend/sortFollowRecommend',
    method: 'get',
    params: data
  })
}
/**
 *  运营-修改关注推荐列表排序
 * @returns {*}
 */
export const editLookRecommendSort = data => {
  return axios.request({
    url: 'FollowRecommend/saveSortFollowRecommend',
    method: 'post',
    data: data
  })
}
/**
 *  运营-问答团列表
 * @returns {*}
 */
export const getQuestionsLists = data => {
  return axios.request({
    url: 'Questions/lists',
    method: 'get',
    params: data
  })
}
/**
 *  运营-添加问答团列表
 * @returns {*}
 */
export const addQuestions = data => {
  return axios.request({
    url: 'Questions/addQuestions',
    method: 'get',
    params: data
  })
}
/**
 *  运营-删除问答团列表
 * @returns {*}
 */
export const deleteQuestions = data => {
  return axios.request({
    url: 'Questions/deleteQuestions',
    method: 'get',
    params: data
  })
}
/**
 *  运营-问答团列表排序
 * @returns {*}
 */
export const sortQuestions = data => {
  return axios.request({
    url: 'Questions/sortQuestions',
    method: 'get',
    params: data
  })
}
/**
 *  运营-修改问答团排序
 * @returns {*}
 */
export const editQuestionsSort = data => {
  return axios.request({
    url: 'Questions/saveSortQuestions',
    method: 'post',
    data: data
  })
}
/**
 *  运营-申请达人列表审核通过(站内、站外共用)
 * @returns {*}
 */
export const approveMasterApply = data => {
  return axios.request({
    url: 'MasterApply/approved',
    method: 'get',
    params: data
  })
}
/**
 *  运营-申请达人列表审核拒绝(站内、站外共用)
 * @returns {*}
 */
export const refuseMasterApply = data => {
  return axios.request({
    url: 'MasterApply/refuse',
    method: 'get',
    params: data
  })
}
/**
 *  运营-站内达人列表
 * @returns {*}
 */
export const getMasterApplyStationList = data => {
  return axios.request({
    url: 'MasterApply/stationList',
    method: 'get',
    params: data
  })
}
/**
 *  运营-编辑站内达人页面数据
 * @returns {*}
 */
export const getSaveStationView = data => {
  return axios.request({
    url: 'MasterApply/saveStationView',
    method: 'get',
    params: data
  })
}
/**
 *  运营-编辑站外达人页面数据
 * @returns {*}
 */
export const getsaveOutStationView = data => {
  return axios.request({
    url: 'MasterApply/saveOutStationView',
    method: 'get',
    params: data
  })
}
/**
 *  运营-编辑站内达人数据
 * @returns {*}
 */
export const editorMasterApply = data => {
  return axios.request({
    url: 'MasterApply/saveStation',
    method: 'post',
    data: data
  })
}
/**
 *  运营-编辑站外达人数据
 * @returns {*}
 */
export const editorMasterApplyOut = data => {
  return axios.request({
    url: 'MasterApply/saveOutStation',
    method: 'post',
    data: data
  })
}
/**
 *  运营-删除站内、站外达人列表
 * @returns {*}
 */
export const deleteMasterApply = data => {
  return axios.request({
    url: 'MasterApply/delete',
    method: 'get',
    params: data
  })
}
/**
 *  运营-站外达人列表
 * @returns {*}
 */
export const getMasterApplyOutStationList = data => {
  return axios.request({
    url: 'MasterApply/outStationList',
    method: 'get',
    params: data
  })
}
/**
 *  运营-百科纠错列表
 * @returns {*}
 */
export const getTemContentErrorList = data => {
  return axios.request({
    url: 'TemContentError/index',
    method: 'get',
    params: data
  })
}
/**
 *  运营-修正|忽略百科词条纠错记录
 * @returns {*}
 */
export const changeUpStatus = data => {
  return axios.request({
    url: 'TemContentError/upStatus',
    method: 'post',
    data: data
  })
}
/**
 *  财务管理-提现审核列表
 * @returns {*}
 */
export const getWithdrawApply = data => {
  return axios.request({
    url: 'Finance/withdrawApply',
    method: 'get',
    params: data
  })
}
/**
 *  提现审核列表导出
 * @returns {*}
 */
export const withdrawApplyExport = data => {
  return axios.request({
    url: 'Finance/withdrawApplyExport',
    method: 'get',
    params: data
  })
}
/**
 *  财务管理-提现审核查看详情
 * @returns {*}
 */
export const getWithdrawRecord = data => {
  return axios.request({
    url: 'Finance/record',
    method: 'get',
    params: data
  })
}
/**
 *  财务管理-提现审核操作【同意/拒绝】
 * @returns {*}
 */
export const getWithdrawCheck = data => {
  return axios.request({
    url: 'Finance/check',
    method: 'post',
    data: data
  })
}
/**
 *  财务管理-收入管理
 * @returns {*}
 */
export const getIncomeList = data => {
  return axios.request({
    url: 'Finance/income',
    method: 'get',
    params: data
  })
}
/**
 *  音乐管理-获取派对音乐列表
 * @returns {*}
 */
export const getMusicList = data => {
  return axios.request({
    url: 'PartyMusic/getMusicList',
    method: 'get',
    params: data
  })
}
/**
 *  音乐管理-删除音乐数据
 * @returns {*}
 */
export const getDelMusic = data => {
  return axios.request({
    url: 'PartyMusic/delMusic',
    method: 'post',
    data: data
  })
}
/**
 *  财务管理-收入管理导出
 * @returns {*}
 */
export const incomeExport = data => {
  return axios.request({
    url: 'Finance/incomeExport',
    method: 'get',
    params: data
  })
}
/**
 *  分子派对活动-话题列表
 * @returns {*}
 */
export const topicList = data => {
  return axios.request({
    url: 'topic/index',
    method: 'get',
    params: data
  })
}
/**
 *  分子派对活动-评论列表
 * @returns {*}
 */
export const topicCommentList = data => {
  return axios.request({
    url: 'topic/indexComment',
    method: 'get',
    params: data
  })
}
/**
 *  分子派对活动-话获取添加话题的校验码
 * @returns {*}
 */
export const topicAddView = data => {
  return axios.request({
    url: 'topic/addView',
    method: 'get',
    params: data
  })
}
/**
 *  分子派对活动-删除话题
 * @returns {*}
 */
export const ActivedeleteTopic = data => {
  return axios.request({
    url: 'topic/delete',
    method: 'post',
    data: data
  })
}
/**
 *  分子派对活动-删除话题评论
 * @returns {*}
 */
export const topicdelComment = data => {
  return axios.request({
    url: 'topic/delComment',
    method: 'post',
    data: data
  })
}
/**
 *  分子派对活动-删除话题评论
 * @returns {*}
 */
export const getAddTopic = data => {
  return axios.request({
    url: 'topic/add',
    method: 'post',
    data: data
  })
}
/**
 *  分子派对活动-删除话题评论
 * @returns {*}
 */
export const getpartyOpinion = data => {
  return axios.request({
    url: 'partyOpinion/index',
    method: 'get',
    params: data
  })
}
/**
 *  分子派对活动-回复用户意见
 * @returns {*}
 */
export const replaypartyOpinion = data => {
  return axios.request({
    url: 'partyOpinion/replay',
    method: 'post',
    data: data
  })
}
/**
 *  分子派对活动-单个/批量删除用户派对意见
 * @returns {*}
 */
export const partyOpiniondel = data => {
  return axios.request({
    url: 'partyOpinion/del',
    method: 'post',
    data: data
  })
}
/**
 *  财务管理-拒绝提现审核-
 * @returns {*}
 */
export const refuseFinance = data => {
  return axios.request({
    url: 'Finance/refuse',
    method: 'post',
    data: data
  })
}
/**
 *  财务管理-同意提现审核
 * @returns {*}
 */
export const agreeFinance = data => {
  return axios.request({
    url: 'Finance/agree',
    method: 'post',
    data: data
  })
}
/**
 *  参与超级偶像人气大赏派对列表
 * @returns {*}
 */
export const getPartySuperPopularity = data => {
  return axios.request({
    url: 'PartySuperPopularity/index',
    method: 'get',
    params: data
  })
}
/**
 *  单个/批量删除参与超级偶像人气大赏的派对
 * @returns {*}
 */
export const delPartySuperPopularity = data => {
  return axios.request({
    url: 'PartySuperPopularity/del',
    method: 'post',
    data: data
  })
}
/**
 *  单个/批量添加参与超级偶像人气大赏的派对
 * @returns {*}
 */
export const addPartySuperPopularity = data => {
  return axios.request({
    url: 'PartySuperPopularity/add',
    method: 'post',
    data: data
  })
}
/**
 *  获取超级偶像人气大赏活动时间
 * @returns {*}
 */
export const getPartySuperPopularityTime = () => {
  return axios.request({
    url: 'PartySuperPopularity/getTime',
    method: 'get'
  })
}
/**
 *  编辑超级偶像人气大赏活动时间
 * @returns {*}
 */
export const editPartySuperPopularityTime = data => {
  return axios.request({
    url: 'PartySuperPopularity/addTime',
    method: 'post',
    data: data
  })
}
/**
 *  派对铭牌详情列表
 * @returns {*}
 */
export const getPartyNameplate = data => {
  return axios.request({
    url: 'partyNameplate/index',
    method: 'get',
    params: data
  })
}
/**
 *  批量添加派对铭牌
 * @returns {*}
 */
export const addPartyNameplate = data => {
  return axios.request({
    url: 'partyNameplate/add',
    method: 'post',
    data: data
  })
}
/**
 *  获取派对铭牌颜色，边框及校验码
 * @returns {*}
 */
export const partyNameplateAddView = () => {
  return axios.request({
    url: 'partyNameplate/addView',
    method: 'get'
  })
}
/**
 *  派对铭牌上|下架
 * @returns {*}
 */
export const shelfPartyNameplate = data => {
  return axios.request({
    url: 'partyNameplate/shelf',
    method: 'post',
    data: data
  })
}
/**
 *  派对铭牌删除
 * @returns {*}
 */
export const delPartyNameplate = data => {
  return axios.request({
    url: 'partyNameplate/del',
    method: 'post',
    data: data
  })
}
/**
 *  获取举报成功页面的封禁数据
 * @returns {*}
 */
export const getDisposeViewData = data => {
  return axios.request({
    url: 'complaint/getDisposeViewData',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-货币管理日志列表
 * @returns {*}
 */
export const getCurrecnyLog = data => {
  return axios.request({
    url: 'Finance/currecnyLog',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-获取用户货币列表
 * @returns {*}
 */
export const getUserCurrencyList = data => {
  return axios.request({
    url: 'CurrencySystem/getUserCurrencyList',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-导出用户货币列表
 * @returns {*}
 */
export const getExportUserCurrencyList = data => {
  return axios.request({
    url: 'CurrencySystem/getExportUserCurrencyList',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-封禁用户登录
 * @returns {*}
 */
export const prohibitUserLogin = data => {
  return axios.request({
    url: 'CurrencySystem/prohibitUserLogin',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-解除用户登录封禁
 * @returns {*}
 */
export const relieveUserLoginProhibit = data => {
  return axios.request({
    url: 'CurrencySystem/relieveUserLoginProhibit',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-获取用户货币明细
 * @returns {*}
 */
export const getCurrencyDetailed = data => {
  return axios.request({
    url: 'CurrencySystem/getCurrencyDetailed',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-获取用户货币明细
 * @returns {*}
 */
export const getCurrencyView = data => {
  return axios.request({
    url: 'CurrencySystem/getCurrencyView',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-保存货币设置
 * @returns {*}
 */
export const setCurrency = data => {
  return axios.request({
    url: 'CurrencySystem/setCurrency',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-保存货币设置
 * @returns {*}
 */
export const setCurrencySafe = data => {
  return axios.request({
    url: 'CurrencySystem/setCurrencySafe',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-获取风控列表数据
 * @returns {*}
 */
export const getRiskManagementList = data => {
  return axios.request({
    url: 'CurrencySystem/getRiskManagementList',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-导出风控列表
 * @returns {*}
 */
export const exportRiskManagementList = data => {
  return axios.request({
    url: 'CurrencySystem/exportRiskManagementList',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-获取货币信息图表数据
 * @returns {*}
 */
export const getCurrencyCharts = data => {
  return axios.request({
    url: 'CurrencyInfo/getCurrencyCharts',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-获取货币信息表格数据
 * @returns {*}
 */
export const getCurrencyInfo = data => {
  return axios.request({
    url: 'CurrencyInfo/getCurrencyInfo',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-获取充值订单列表
 * @returns {*}
 */
export const getRechargeOrderList = data => {
  return axios.request({
    url: 'CurrencySystem/getRechargeOrderList',
    method: 'get',
    params: data
  })
}
/**
 *  货币系统-充值退款
 * @returns {*}
 */
export const refundOrder = data => {
  return axios.request({
    url: 'CurrencySystem/refundOrder',
    method: 'post',
    data: data
  })
}
/**
 *  货币系统-补单
 * @returns {*}
 */
export const supplementOrder = data => {
  return axios.request({
    url: 'CurrencySystem/supplementOrder',
    method: 'get',
    params: data
  })
}
/**
 *  设置管理员通知状态
 * @returns {*}
 */
export const editNotic = data => {
  return axios.request({
    url: 'Account/editNotic',
    method: 'get',
    params: data
  })
}
/**
 *  获取货币系统基础配置
 * @returns {*}
 */
export const getCurrencyConfig = data => {
  return axios.request({
    url: 'CurrencySystem/getCurrencyConfig',
    method: 'get',
    params: data
  })
}
/**
 *  商城-获取订单列表
 * @returns {*}
 */
export const getOrderList = data => {
  return axios.request({
    url: 'Shop/getOrderList',
    method: 'get',
    params: data
  })
}
/**
 *  商城-获取商品类型
 * @returns {*}
 */
export const getShopCate = data => {
  return axios.request({
    url: 'ShopTool/getShopCate',
    method: 'get',
    params: data
  })
}
/**
 *  商城-获取道具取出列表
 * @returns {*}
 */
export const getToolExchangeList = data => {
  return axios.request({
    url: 'Shop/getToolExchangeList',
    method: 'get',
    params: data
  })
}
/**
 *  商城-获取道具分类列表
 * @returns {*}
 */
export const getShopToolCateList = data => {
  return axios.request({
    url: 'ShopToolCate/getShopToolCateList',
    method: 'get',
    params: data
  })
}
/**
 *  商城-获取道具分类校验码
 * @returns {*}
 */
export const getShopCheckCode = data => {
  return axios.request({
    url: 'ShopToolCate/getCheckCode',
    method: 'get',
    params: data
  })
}
/**
 *  商城-添加道具分类
 * @returns {*}
 */
export const addShopToolCate = data => {
  return axios.request({
    url: 'ShopToolCate/addShopToolCate',
    method: 'post',
    data: data
  })
}
/**
 *  商城-添加道具分类
 * @returns {*}
 */
export const editShopToolCate = data => {
  return axios.request({
    url: 'ShopToolCate/editShopToolCate',
    method: 'post',
    data: data
  })
}
/**
 *  商城-添加道具分类
 * @returns {*}
 */
export const delShopToolCate = data => {
  return axios.request({
    url: 'ShopToolCate/delShopToolCate',
    method: 'post',
    data: data
  })
}
/**
 *  设置商城权限密码
 * @returns {*}
 */
export const setShopPassword = data => {
  return axios.request({
    url: 'shopPassword/set',
    method: 'post',
    data
  })
}
/**
 *  获取添加道具的校验码
 * @returns {*}
 */
export const getToolCheckCode = () => {
  return axios.request({
    url: 'ShopTool/getCheckCode',
    method: 'get'
  })
}
/**
 *  添加道具
 * @returns {*}
 */
export const addShopTool = data => {
  return axios.request({
    url: 'ShopTool/addShopTool',
    method: 'post',
    data
  })
}
/**
 *  编辑道具
 * @returns {*}
 */
export const editShopTool = data => {
  return axios.request({
    url: 'Shop/editTool',
    method: 'post',
    data
  })
}
/**
 *  删除道具
 * @returns {*}
 */
export const delTool = data => {
  return axios.request({
    url: 'Shop/delTool',
    method: 'get',
    params: data
  })
}
/**
 *  获取道具列表
 * @returns {*}
 */
export const getToolList = data => {
  return axios.request({
    url: 'Shop/getToolList',
    method: 'get',
    params: data
  })
}
/**
 *  道具上/下架
 * @returns {*}
 */
export const updateToolStatus = data => {
  return axios.request({
    url: 'Shop/updateToolStatus',
    method: 'get',
    params: data
  })
}
/**
 *  获取游戏列表
 * @returns {*}
 */
export const getGameList = data => {
  return axios.request({
    url: 'Game/getGameList',
    method: 'get',
    params: data
  })
}
/**
 *  获取游戏列表
 * @returns {*}
 */
export const gameList = data => {
  return axios.request({
    url: 'Advertisement/gameList',
    method: 'get',
    params: data
  })
}
/**
 *  获取游戏百科列表
 * @returns {*}
 */
export const gameWikiList = data => {
  return axios.request({
    url: 'Advertisement/gameWikiList',
    method: 'get',
    params: data
  })
}
/**
 *  获取游戏百科词条列表
 * @returns {*}
 */
export const gameWikiEntryList = data => {
  return axios.request({
    url: 'Advertisement/gameWikiEntryList',
    method: 'get',
    params: data
  })
}
/**
 *  修改游戏热度状态
 * @returns {*}
 */
export const updateGameHots = data => {
  return axios.request({
    url: 'Game/updateGameHots',
    method: 'get',
    params: data
  })
}
/**
 *  修改游戏状态
 * @returns {*}
 */
export const updateGameStatus = data => {
  return axios.request({
    url: 'Game/updateGameStatus',
    method: 'post',
    data
  })
}
/**
 *  获取添加游戏页面数据
 * @returns {*}
 */
export const getAddGameViewData = data => {
  return axios.request({
    url: 'Game/getAddGameViewData',
    method: 'get',
    params: data
  })
}
/**
 *  添加游戏
 * @returns {*}
 */
export const addGame = data => {
  return axios.request({
    url: 'Game/addGame',
    method: 'post',
    data
  })
}
/*
 *  编辑游戏
 * @returns {*}
 */
export const editGame = data => {
  return axios.request({
    url: 'Game/editGame',
    method: 'post',
    data
  })
}
/**
 *  删除游戏
 * @returns {*}
 */
export const delGame = data => {
  return axios.request({
    url: 'Game/delGame',
    method: 'post',
    data
  })
}
/**
 *  获取游戏百科分类列表
 * @returns {*}
 */
export const getWikiCateListByGameId = data => {
  return axios.request({
    url: 'Wiki/getWikiCateListByGameId',
    method: 'get',
    params: data
  })
}
/**
 *  添加游戏百科分类
 * @returns {*}
 */
export const addGameWikiCate = data => {
  return axios.request({
    url: 'Wiki/addGameWikiCate',
    method: 'post',
    data
  })
}
/**
 *  编辑游戏百科分类
 * @returns {*}
 */
export const editGameWikiCate = data => {
  return axios.request({
    url: 'Wiki/editGameWikiCate',
    method: 'post',
    data
  })
}
/**
 *  排序游戏百科分类|词条
 * @returns {*}
 */
export const orderGameWiki = data => {
  return axios.request({
    url: 'Wiki/orderGameWiki',
    method: 'post',
    data
  })
}
/**
 *  删除游戏百科分类|词条
 * @returns {*}
 */
export const delGameWiki = data => {
  return axios.request({
    url: 'Wiki/delGameWiki',
    method: 'post',
    data
  })
}
/**
 *  显示|隐藏百科分类|词条
 * @returns {*}
 */
export const hideGameWiki = data => {
  return axios.request({
    url: 'Wiki/hideGameWiki',
    method: 'post',
    data
  })
}
/**
 *  获取游戏百科词条列表
 * @returns {*}
 */
export const getWikiListByGameId = data => {
  return axios.request({
    url: 'Wiki/getWikiListByGameId',
    method: 'get',
    params: data
  })
}
/**
 *  添加游戏百科词条
 * @returns {*}
 */
export const addGameWiki = data => {
  return axios.request({
    url: 'Wiki/addGameWiki',
    method: 'post',
    data
  })
}
/**
 *  获取编辑百科词条数据
 * @returns {*}
 */
export const getWikiData = data => {
  return axios.request({
    url: 'Wiki/getWikiData',
    method: 'post',
    data
  })
}
/**
 * 获取百科分类数据
 * @returns {*}
 */
export const getWikiDataByGameId = data => {
  return axios.request({
    url: 'Wiki/getWikiDataByGameId',
    method: 'post',
    data
  })
}
/**
 *  编辑游戏百科词条
 * @returns {*}
 */
export const editGameWiki = data => {
  return axios.request({
    url: 'Wiki/editGameWiki',
    method: 'post',
    data
  })
}
/**
 *  获取游戏点评列表
 * @returns {*}
 */
export const getindexGameAssess = data => {
  return axios.request({
    url: 'GameAssess/indexGameAssess',
    method: 'post',
    data
  })
}
/**
 *  删除游戏点评
 * @returns {*}
 */
export const getdelGameAssess = data => {
  return axios.request({
    url: 'GameAssess/delGameAssess',
    method: 'post',
    data
  })
}
/**
 *  修改点评状态||是否安利状态
 * @returns {*}
 */
export const editGameAssess = data => {
  return axios.request({
    url: 'GameAssess/editGameAssess',
    method: 'post',
    data
  })
}
/**
 *  获取游戏点评信息
 * @returns {*}
 */
export const getGameAssessInfo = data => {
  return axios.request({
    url: 'GameAssess/getGameAssessInfo',
    method: 'post',
    data
  })
}
/**
 *  获取游戏点评下的评论列表
 * @returns {*}
 */
export const getGamedetailComment = data => {
  return axios.request({
    url: 'GameAssess/indexComment',
    method: 'post',
    data
  })
}
/**
 *  获取游戏详情
 * @returns {*}
 */
export const getGameDetail = data => {
  return axios.request({
    url: 'Game/getGameDetail',
    method: 'post',
    data
  })
}
/**
 *  修改游戏标签状态
 * @returns {*}
 */
export const updateGameTagStatus = data => {
  return axios.request({
    url: 'Game/updateGameTagStatus',
    method: 'post',
    data
  })
}
/**
 *  修改游戏
 * @returns {*}
 */
export const geteditGame = data => {
  return axios.request({
    url: 'Game/editGame',
    method: 'post',
    data
  })
}
/*
 *  获取所属游戏数据
 * @returns {*}
 */
export const getGameReviewList = data => {
  return axios.request({
    url: 'AppGameLibrary/getGameReviewList',
    method: 'get',
    params: data
  })
}

/*
 *  删除每日推荐信息
 * @returns {*}
 */
export const deleteDaily = data => {
  return axios.request({
    url: 'GameResource/deleteDaily',
    method: 'get',
    params: data
  })
}
/*
 *  修改每日推荐信息
 * @returns {*}
 */
export const saveDailyRecommend = data => {
  return axios.request({
    url: 'GameResource/saveDailyRecommend',
    method: 'get',
    params: data
  })
}

/*
=======
/*
 *  获取每日推荐列表
 * @returns {*}
 */
// export const dailyRecommendList = data => {
//   return axios.request({
//     url: 'GameResource/dailyRecommendList',
//     method: 'get',
//     params: data
//   })
// }
/*
 *  获取每日推荐查看信息
 * @returns {*}
 */
export const dailyPlan = data => {
  return axios.request({
    url: 'GameResource/dailyPlan',
    method: 'get',
    params: data
  })
}
/*
>>>>>>> dba2163e1f07d08a07868b968cd4fa192f8aa532
 *  百科主推列表列表
 * @returns {*}
 */
export const gameWikiRecommendList = data => {
  return axios.request({
    url: 'GameResource/gameWikiRecommendList',
    method: 'get',
    params: data
  })
}
/*
 *  每日推荐获取资源位
 * @returns {*}
 */
export const getRecommend = data => {
  return axios.request({
    url: 'GameResource/getRecommend',
    method: 'get',
    params: data
  })
}
/*
 *  百科主推\每日推荐、搜索，用的是同一个接口
 * @returns {*}
 */
export const search = data => {
  return axios.request({
    url: 'GameResource/search',
    method: 'get',
    params: data
  })
}
/*
 *  获取所属游戏数据
 * @returns {*}
 */
export const reviewGame = data => {
  return axios.request({
    url: 'AppGameLibrary/reviewGame',
    method: 'post',
    data
  })
}
/*
 *  获取所属游戏数据
 * @returns {*}
 */
export const delGameReview = data => {
  return axios.request({
    url: 'AppGameLibrary/delGameReview',
    method: 'post',
    data
  })
}
/*
 *  获取所属游戏数据
 * @returns {*}
 */
export const synchReviewGame = data => {
  return axios.request({
    url: 'AppGameLibrary/synchReviewGame',
    method: 'post',
    data
  })
}
/*
 *  获取审核游戏详情
 * @returns {*}
 */
export const getReviewGameDetail = data => {
  return axios.request({
    url: 'AppGameLibrary/getReviewGameDetail',
    method: 'get',
    params: data
  })
}
/*
 *  获取审核游戏详情
 * @returns {*}
 */
export const editReviewGame = data => {
  return axios.request({
    url: 'AppGameLibrary/editReviewGame',
    method: 'post',
    data
  })
}
/**
 *  获取虚拟昵称列表
 * @returns {*}
 */
export const getNicknameList = data => {
  return axios.request({
    url: 'InventedUser/getNicknameList',
    method: 'post',
    data
  })
}
/**
 *  删除虚拟昵称
 * @returns {*}
 */
export const delNickname = data => {
  return axios.request({
    url: 'InventedUser/delNickname',
    method: 'post',
    data
  })
}
/**
 *  获取简介列表
 * @returns {*}
 */
export const getSignatureList = data => {
  return axios.request({
    url: 'VirtualSignature/getSignatureList',
    method: 'post',
    data
  })
}
/**
 *  删除简介
 * @returns {*}
 */
export const delSignature = data => {
  return axios.request({
    url: 'VirtualSignature/delSignature',
    method: 'post',
    data
  })
}
/**
 *  获取虚拟头像列表
 * @returns {*}
 */
export const getAvatarList = data => {
  return axios.request({
    url: 'InventedUser/getAvatarList',
    method: 'post',
    data
  })
}
/**
 *  删除虚拟头像
 * @returns {*}
 */
export const delAvatar = data => {
  return axios.request({
    url: 'InventedUser/delAvatar',
    method: 'post',
    data
  })
}
/**
 *  导入头像excel
 * @returns {*}
 */
export const addAvater = data => {
  return axios.request({
    url: 'InventedUser/importAvatar',
    method: 'post',
    data
  })
}
/**
 *  用户组
 * @returns {*}
 */
export const getUserGroupData = data => {
  return axios.request({
    url: 'AppGameAssessComment/getUserGroupData',
    method: 'get',
    params: data
  })
}
/**
 *  评价组
 * @returns {*}
 */
export const getAssessGroupData = data => {
  return axios.request({
    url: 'Game/getAssessGroupData',
    method: 'get',
    params: data
  })
}
/**
 *  选择用户数据
 * @returns {*}
 */
export const getUserData = data => {
  return axios.request({
    url: 'content/getUserData',
    method: 'post',
    data
  })
}
/**
 *  资讯自动评价
 * @returns {*}
 */
export const autoCommentContent = data => {
  return axios.request({
    url: 'AppGameAssessComment/autoCommentContent',
    method: 'post',
    data
  })
}
/**
 *  资讯手动评价
 * @returns {*}
 */
export const addCommentContent = data => {
  return axios.request({
    url: 'AppGameAssessComment/addCommentContent',
    method: 'post',
    data
  })
}
/**
 *  安利文自动评价
 * @returns {*}
 */
export const autoGameCommentContent = data => {
  return axios.request({
    url: 'AppGameAssessComment/autoGameCommentContent',
    method: 'post',
    data
  })
}
/**
 *  安利文手动评价
 * @returns {*}
 */
export const addGameComment = data => {
  return axios.request({
    url: 'AppGameAssessComment/addGameComment',
    method: 'post',
    data
  })
}
/**
 *  游戏自动评价
 * @returns {*}
 */
export const autoAddAssess = data => {
  return axios.request({
    url: 'Game/autoAddAssess',
    method: 'post',
    data
  })
}
/**
 *  游戏手动
 * @returns {*}
 */
export const addAssess = data => {
  return axios.request({
    url: 'Game/addAssess',
    method: 'post',
    data
  })
}
/**
 *  获取群组列表列表
 * @returns {*}
 */
export const getGroupIndex = data => {
  return axios.request({
    url: 'AssessLibrary/groupIndex',
    method: 'get',
    params: data
  })
}
/**
 *  >评论列表->一键显示|隐藏
 * @returns {*}
 */
export const oneKeySet = data => {
  return axios.request({
    url: 'GameAssess/oneKeySet',
    method: 'post',
    data
  })
}
/**
 *  >评论列表->一键安利|取消安利
 * @returns {*}
 */
export const oneKeyAmway = data => {
  return axios.request({
    url: 'GameAssess/oneKeyAmway',
    method: 'post',
    data
  })
}
/**
 *  获取当前群组下的评价
 * @returns {*}
 */
export const getAssessByGroup = data => {
  return axios.request({
    url: 'AssessLibrary/assessByGroup',
    method: 'get',
    params: data
  })
}
/**
 *  群组排序
 * @returns {*}
 */
export const assessGroupSort = data => {
  return axios.request({
    url: 'AssessLibrary/assessGroupSort',
    method: 'post',
    data
  })
}
/**
 *  群组重命名
 * @returns {*}
 */
export const groupRename = data => {
  return axios.request({
    url: 'AssessLibrary/groupRename',
    method: 'post',
    data
  })
}
/**
 *  添加群组评价
 * @returns {*}
 */
export const groupAssess = data => {
  return axios.request({
    url: 'AssessLibrary/groupAssess',
    method: 'post',
    data
  })
}
/**
 *  导出已使用评价
 * @returns {*}
 */
export const exportGroupAssess = data => {
  return axios.request({
    url: 'AssessLibrary/export',
    method: 'get',
    params: data
  })
}
/**
 *  删除群组
 * @returns {*}
 */
export const delGroupAssess = data => {
  return axios.request({
    url: 'AssessLibrary/delGroupAssess',
    method: 'post',
    data
  })
}
/**
 *  新增群组
 * @returns {*}
 */
export const addGroup = data => {
  return axios.request({
    url: 'AssessLibrary/group',
    method: 'post',
    data
  })
}
/**
 *  获取评价校验码
 * @returns {*}
 */
export const getAssessCode = data => {
  return axios.request({
    url: 'AssessLibrary/addView',
    method: 'get',
    params: data
  })
}
/**
 *  获取评价列表
 * @returns {*}
 */
export const getEvaluateList = data => {
  return axios.request({
    url: 'AssessLibrary/assessIndex',
    method: 'get',
    params: data
  })
}
/**
 *  导入评价
 * @returns {*}
 */
export const importEvaluateExcel = data => {
  return axios.request({
    url: 'AssessLibrary/import',
    method: 'post',
    data
  })
}
/**
 *  批量删除评价
 * @returns {*}
 */
export const delAssess = data => {
  return axios.request({
    url: 'AssessLibrary/delAssess',
    method: 'post',
    data
  })
}
/**
 *  替换游戏数据
 * @returns {*}
 */
export const replaceGameData = data => {
  return axios.request({
    url: 'AppGameLibrary/replaceGameData',
    method: 'post',
    data
  })
}
/**
 *  获取不同平台的数据
 * @returns {*}
 */
export const getSameGameList = data => {
  return axios.request({
    url: 'AppGameLibrary/getSameGameList',
    method: 'get',
    params: data
  })
}
/**
 *  获取评论列表
 * @returns {*}
 */
export const getCommentLists = data => {
  return axios.request({
    url: 'CommentLibrary/getCommentList',
    method: 'get',
    params: data
  })
}
/**
 *  获取评论群组列表
 * @returns {*}
 */
export const getCommentGroupList = data => {
  return axios.request({
    url: 'CommentLibrary/getCommentGroupList',
    method: 'get',
    params: data
  })
}
/**
 *  添加评论群组
 * @returns {*}
 */
export const addCommentGroup = data => {
  return axios.request({
    url: 'CommentLibrary/addCommentGroup',
    method: 'get',
    params: data
  })
}
/**
 *  编辑评论群组
 * @returns {*}
 */
export const editCommentGroup = data => {
  return axios.request({
    url: 'CommentLibrary/editCommentGroup',
    method: 'get',
    params: data
  })
}
/**
 *  删除评论群组
 * @returns {*}
 */
export const delCommentGroup = data => {
  return axios.request({
    url: 'CommentLibrary/delCommentGroup',
    method: 'get',
    params: data
  })
}
/**
 *  评论分组排序
 * @returns {*}
 */
export const commentGroupSort = data => {
  return axios.request({
    url: 'CommentLibrary/commentGroupSort',
    method: 'get',
    params: data
  })
}
/**
 *  删除评论
 * @returns {*}
 */
export const delComments = data => {
  return axios.request({
    url: 'CommentLibrary/delComment',
    method: 'post',
    data
  })
}
/**
 *  导出评论
 * @returns {*}
 */
export const exportCommentList = data => {
  return axios.request({
    url: 'CommentLibrary/exportCommentList',
    method: 'get',
    params: data
  })
}
/**
 *  评论加入群组
 * @returns {*}
 */
export const commentJoinGroup = data => {
  return axios.request({
    url: 'CommentLibrary/commentJoinGroup',
    method: 'get',
    params: data
  })
}
/**
 * 内容库-获取列表
 * @returns {*}
 */
export const contentLibraryList = data => {
  return axios.request({
    url: 'Content/getContentLibrary',
    method: 'get',
    params: data
  })
}

/**
 * 运营-获取发放勋章列表
 * @returns {*}
 */
export const publicMedalList = data => {
  return axios.request({
    url: 'MedalSend/index',
    method: 'get',
    params: data
  })
}
/**
 * 获取游戏一级二级分类列表
 * @returns {*}
 */
export const getGameCategoryList = data => {
  return axios.request({
    url: 'GameCategory/getCategoryLists',
    method: 'get',
    params: data
  })
}
/**
 * 删除游戏分类列表
 * @returns {*}
 */
export const deleteGameCategory = data => {
  return axios.request({
    url: 'GameCategory/categoryDelete',
    method: 'post',
    data
  })
}
/**
 * 添加分类
 * @returns {*}
 */
export const addGameCategory = data => {
  return axios.request({
    url: 'GameCategory/categoryAdd',
    method: 'post',
    data
  })
}
/**
 * 编辑分类
 * @returns {*}
 */
export const editGameCategory = data => {
  return axios.request({
    url: 'GameCategory/categoryEdit',
    method: 'post',
    data
  })
}
/**
 * 获取app分类新增的校验码
 * @returns {*}
 */
export const getGameCheckCode = data => {
  return axios.request({
    url: 'GameCategory/getCheckCode',
    method: 'get',
    params: data
  })
}
/**
 * 获取app分类单条数据详情
 * @returns {*}
 */
export const getGameOneDetail = data => {
  return axios.request({
    url: 'GameCategory/getOneDetail',
    method: 'get',
    params: data
  })
}
/**
 * 对调app分类排序
 * @returns {*}
 */
export const editCateOrder = data => {
  return axios.request({
    url: 'GameCategory/editCateOrder',
    method: 'get',
    params: data
  })
}
/**
 * 编辑分类的热度值
 * @returns {*}
 */
export const editCateHots = data => {
  return axios.request({
    url: 'GameCategory/editCateHots',
    method: 'get',
    params: data
  })
}
/**
 * 分类banner管理列表
 * @returns {*}
 */
export const getIndexCateBanner = data => {
  return axios.request({
    url: 'GameCategory/indexCateBanner',
    method: 'get',
    params: data
  })
}
/**
 * 删除分类banner
 * @returns {*}
 */
export const delGameBanner = data => {
  return axios.request({
    url: 'GameCategory/delBanner',
    method: 'post',
    data
  })
}
/**
 * 更换分类banner
 * @returns {*}
 */
export const editBanner = data => {
  return axios.request({
    url: 'GameCategory/editBanner',
    method: 'post',
    data
  })
}
/**
 * 删除分类banner
 * @returns {*}
 */
export const addBanner = data => {
  return axios.request({
    url: 'GameCategory/addBanner',
    method: 'post',
    data
  })
}
/**
 * 显示隐藏分类
 * @returns {*}
 */
export const editCateStatus = data => {
  return axios.request({
    url: 'GameCategory/editCateStatus',
    method: 'get',
    params: data
  })
}
/**
 * 每日推荐列表
 * @returns {*}
 */
export const dailyRecommendList = data => {
  return axios.request({
    url: 'GameResource/dailyRecommendList',
    method: 'get',
    params: data
  })
}

/**
 * 每日推荐|百科主推（搜索）[添加及修改]
 * @returns {*}
 */

export const searchGameList = data => {
  return axios.request({
    url: 'GameResource/search',
    method: 'get',
    params: data
  })
}
/**
* 每日推荐资源位编号

* @returns {*}
*/
export const getDailyNumber = data => {
  return axios.request({
    url: 'GameResource/dailyNumber',
    method: 'get',
    params: data
  })
}
/**
 * 添加每日推荐
 * @returns {*}
 */
export const addDailyRecommend = data => {
  return axios.request({
    url: 'GameResource/addDailyRecommend',
    method: 'get',
    params: data
  })
}

/**
 * 运营-获取发放勋章列表
 * @returns {*}
 */
export const sendMedalList = data => {
  return axios.request({
    url: 'MedalSend/medalList',
    method: 'get',
    params: data
  })
}
/**
 * 删除百科主推
 * @returns {*}
 */
export const deleteGameWiki = data => {
  return axios.request({
    url: 'GameResource/deleteGameWiki',
    method: 'get',
    params: data
  })
}
/**
 * 添加游戏百科主推
 * @returns {*}
 */
export const addGameWikiRecommend = data => {
  return axios.request({
    url: 'GameResource/addGameWikiRecommend',
    method: 'get',
    params: data
  })
}
/**
 * 修改游戏百科主推
 * @returns {*}
 */
export const saveGameWikiRecommend = data => {
  return axios.request({
    url: 'GameResource/saveGameWikiRecommend',
    method: 'get',
    params: data
  })
}

/**
 * 运营-发放勋章
 * @returns {*}
 */
export const addMedalList = data => {
  return axios.request({
    url: 'MedalSend/add',
    method: 'post',
    data: data
  })
}
/**
 * 百科主推排序
 * @returns {*}
 */
export const gameResourceSort = data => {
  return axios.request({
    url: 'GameResource/sort',
    method: 'get',
    params: data
  })
}
/**
 * 获取模块分类列表
 * @returns {*}
 */
export const getModularList = data => {
  return axios.request({
    url: `modular/getModularList`,
    method: `get`,
    params: data
  })
}

/**
 * 模块调用
 * @returns {*}
 */
export const modularCall = data => {
  return axios.request({
    url: `modular/modularCall`,
    method: `get`,
    params: data
  })
}

/**
 * 获取子模块列表
 * @returns {*}
 */
export const getSubModularList = data => {
  return axios.request({
    url: `modular/getSubModularList`,
    method: `get`,
    params: data
  })
}

/**
 * 子模块排序调整
 * @returns {*}
 */
export const saveSort = data => {
  return axios.request({
    url: `modular/saveSort`,
    method: `get`,
    params: data
  })
}

/**
 * 修改子模块隐藏/显示
 * @returns {*}
 */
export const saveSubModularStatus = data => {
  return axios.request({
    url: `modular/saveSubModularStatus`,
    method: `get`,
    params: {
      sub_modular_id: data
    }
  })
}

/**
 * 获取子模块模板列表
 * @returns {*}
 */
export const getTemplateList = data => {
  return axios.request({
    url: `modular/getTemplateList`,
    method: `get`,
    params: data
  })
}

/**
 * 删除子模块
 * @returns {*}
 */
export const delSubModular = data => {
  return axios.request({
    url: `modular/delSubModular`,
    method: `get`,
    params: data
  })
}

/**
 * 添加子模块
 * @returns {*}
 */
export const addSubModular = data => {
  return axios.request({
    url: `modular/addSubModular`,
    method: `get`,
    params: data
  })
}

/**
 * 编辑子模块
 * @returns {*}
 */
export const modularSaveSubModular = data => {
  return axios.request({
    url: `modular/saveSubModular`,
    method: `get`,
    params: data
  })
}

/**
 * 获取模块下的内容列表 [带分类的 1,2]
 * @returns {*}
 */
export const BannerTempIndexContent = data => {
  return axios.request({
    url: `BannerTemp/index`,
    method: `get`,
    params: {
      page: data.page,
      per_page: data.per_page,
      submod_id: data.submod_id
    }
  })
}

/**
 * 获取模块下的内容列表 [不带分类的 3,4,5]
 * @returns {*}
 */
export const temContentIndexContent = data => {
  return axios.request({
    url: `TemContent/indexContent`,
    method: `post`,
    data
  })
}

/**
 * 批量删除模板banner
 * @returns {*}
 */
export const bannerTemp_del = data => {
  return axios.request({
    url: `BannerTemp/del`,
    method: `post`,
    data
  })
}

/**
 * 新增横图/图标banner的校验码 [游戏列表数据]
 * @returns {*}
 */
export const bannerTemp_addView = data => {
  return axios.request({
    url: `BannerTemp/addView`,
    method: `get`,
    params: data
  })
}

/**
 * 编辑banner模板
 * @returns {*}
 */
export const bannerTempEdit = data => {
  return axios.request({
    url: `BannerTemp/edit`,
    method: `post`,
    data
  })
}

/**
 * 新增横图|图标banner模板
 * @returns {*}
 */
export const bannerTempAdd = data => {
  return axios.request({
    url: `BannerTemp/add`,
    method: `post`,
    data
  })
}

/**
 * 获取模板banner详情[当模块配置的template_id=1 或 2时请求该接口]
 * @returns {*}
 */
export const BannerTempDetail = data => {
  return axios.request({
    url: `BannerTemp/detail`,
    method: `get`,
    params: data
  })
}

/**
 * 显示/隐藏横图|图标banner
 * @returns {*}
 */
export const bannerTempIsShow = data => {
  return axios.request({
    url: `BannerTemp/isShow`,
    method: `post`,
    data
  })
}

/**
 * 修改模板banner排序
 * @returns {*}
 */
export const bannerTempEditSort = data => {
  return axios.request({
    url: `BannerTemp/editSort`,
    method: `post`,
    data
  })
}

/**
 * 获取子模块列表
 * @returns {*}
 */
export const getSubmodular = data => {
  return axios.request({
    url: `BannerTemp/getSubmodular`,
    method: `get`,
    params: {
      game_id: data
    }
  })
}

/**
 * 获取模块一级|二级分类列表
 * @returns {*}
 */
export const TemCategoryIndexCategory = data => {
  return axios.request({
    url: `TemCategory/indexCategory`,
    method: `get`,
    params: data
  })
}

/**
 * 获取模块一级|二级分类列表
 * @returns {*}
 */
export const editCateOrder2 = data => {
  return axios.request({
    url: `TemCategory/editCateOrder`,
    method: `get`,
    params: data
  })
}

/**
 * 编辑模块分类
 * @returns {*}
 */
export const temCategoryEditCate = data => {
  return axios.request({
    url: `TemCategory/editCate`,
    method: `get`,
    params: data
  })
}

/**
 * 编辑模块分类的状态
 * @returns {*}
 */
export const editCateStatus2 = data => {
  return axios.request({
    url: `TemCategory/editCateStatus`,
    method: `get`,
    params: data
  })
}

/**
 * 删除模块分类
 * @returns {*}
 */
export const delCate = data => {
  return axios.request({
    url: `TemCategory/delCate`,
    method: `get`,
    params: data
  })
}

/**
 * 获取添加模块分类校验码
 * @returns {*}
 */
export const temCategoryAddView = data => {
  return axios.request({
    url: `TemCategory/addView`,
    method: `get`,
    params: data
  })
}

/**
 * 添加模块分类 
 * @returns {*}
 */
export const temCategoryAddCate = data => {
  return axios.request({
    url: `TemCategory/addCate`,
    method: `post`,
    data
  })
}

/**
 * 添加模块下的内容
 * @returns {*}
 */
export const temContentAddContent = data => {
  return axios.request({
    url: `TemContent/addContent`,
    method: `post`,
    data: data
  })
}

/**
 * 获取添加模块下的内容的校验码
 * @returns {*}
 */
export const temContentAddView = data => {
  return axios.request({
    url: `TemContent/addView`,
    method: `get`,
    params: data
  })
}

/**
 * 编辑模块下内容的状态
 * @returns {*}
 */
export const temContentEditContentStatus = data => {
  return axios.request({
    url: `TemContent/editContentStatus`,
    method: `get`,
    params: data
  })
}


/**
 * 编辑模块下的内容排序
 * @returns {*}
 */
export const temContentEditContentOrder = data => {
  return axios.request({
    url: `TemContent/editContentOrder`,
    method: `get`,
    params: data
  })
}

/**
 * 获取编辑模块分类校验码
 * @returns {*}
 */
export const temCategoryEditView = data => {
  return axios.request({
    url: `TemCategory/editView`,
    method: `get`,
    params: data
  })
}

/**
 * 获取游戏分类 -- 获取联动模块--分类列表
 * @returns {*}
 */
export const getGameLinkAgeList = data => {
  return axios.request({
    url: 'WikiEntry/getLinkageList',
    method: 'post',
    data: data
  })
}

/**
 * 获取游戏分类 -- 获取内容分类列表
 * @returns {*}
 */
export const getGameContentList = data => {
  return axios.request({
    url: 'WikiEntry/getContentCateList',
    method: 'get'
  })
}

//  * 删除模块下的内容
//  * @returns {*}
//  */
export const temContentDelContent = data => {
  return axios.request({
    url: `TemContent/delContent`,
    method: `get`,
    params: data
  })
}

/**
 * 获取游戏分类 -- 百度词条审核列表
 * @returns {*}
 */
export const getGameCategoryDataList = data => {
  return axios.request({
    url: 'WikiEntry/getList',
    method: 'post',
    data: data
  })
}

/**
 * 获取游戏分类 -- 百度词条显示隐藏
 * @returns {*}
 */
export const getGameEntryStatus = data => {
  return axios.request({
    url: 'WikiEntry/setStatus',
    method: 'post',
    data: data
  })
}

/**
 * 获取游戏分类 -- 删除百度词条
 * @returns {*}
 */
export const getGameEntryDel = data => {
  return axios.request({
    url: 'WikiEntry/del',
    method: 'post',
    data: data

  })
}

/**
 * 获取游戏分类 -- 获取词条详情
 * @returns {*}
 */
export const getGameCitiaoInfo = data => {
  return axios.request({
    url: 'WikiEntry/getInfo',
    method: 'post',
    data: data

  })
}

/**
 * 获取游戏分类 -- 编辑模板1,2发布
 * @returns {*}
 */
export const getEditSubmodular = data => {
  return axios.request({
    url: 'BannerTemp/edit',
    method: 'post',
    data: data
  })
}
/**
 * 获取游戏分类 -- 编辑模板3,4,5发布
 * @returns {*}
 */
export const getEditConten = data => {
  return axios.request({
    url: 'TemContent/editContent',
    method: 'post',
    data: data
  })
}

/**
 * 获取游戏分类 -- 编辑模板1,2获取编辑模块分类校验码

 * @returns {*}
 */
export const getEeitView = data => {
  return axios.request({
    url: 'TemContent/editView',
    method: 'get',
    params: data
  })
}
/*
 * 获取游戏列表[添加图标|横图banner,当jump_type=3时调用]
 * @returns {*}
 */
export const BannerTempGetGameList = data => {
  return axios.request({
    url: `BannerTemp/getGameList`,
    method: `get`,
    params: data
  })
}
/*
 * 获取游戏百科列表[添加图标|横图banner,当jump_type=4时调用]
 * @returns {*}
 */
export const BannerTempGetWikiList = data => {
  return axios.request({
    url: `BannerTemp/getWikiList`,
    method: `get`,
    params: data
  })
}
/*
 * 获取游戏百科词条列表[添加图标|横图banner,当jump_type=5时调用]
 * @returns {*}
 */
export const BannerTempGetWikiEntryList = data => {
  return axios.request({
    url: `BannerTemp/getWikiEntryList`,
    method: `get`,
    params: data
  })
}
/*
 * 获取获取文章|视频列表[添加图标|横图banner,当jump_type=6时调用]
 * @returns {*}
 */
export const BannerTempGetContentList = data => {
  return axios.request({
    url: `BannerTemp/getContentList`,
    method: `get`,
    params: data
  })
}
/*
 *  添加圈子模块banner时,获取帖子列表[当type=8时]
 * @returns {*}
 */
export const BannerTempGetPostList = data => {
  return axios.request({
    url: `CircleBanner/getPostList`,
    method: `get`,
    params: data
  })
}
/**
 * 圈子 -- 分类列表
 * @returns {*}
 */
export const circleColumnList = data => {
  return axios.request({
    url: `Circle/categoryLists`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 分类列表--添加分类
 * @returns {*}
 */
export const addCircle = data => {
  return axios.request({
    url: `Circle/addCategory`,
    method: `post`,
    data: data
  })
}
/*
 * 获取圈子模块列表
 * @returns {*}
 */
export const getCircleModularList = data => {
  return axios.request({
    url: `CircleModular/getList`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 分类列表--修改分类
 * @returns {*}
 */
export const editCircle = data => {
  return axios.request({
    url: `Circle/saveCategory`,
    method: `post`,
    data: data
  })
}
/*
 * 圈子-banner-列表
 * @returns {*}
 */
export const getCircleBannerList = data => {
  return axios.request({
    url: `CircleBanner/getList`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 分类列表--删除分类
 * @returns {*}
 */
export const delCircle = data => {
  return axios.request({
    url: `Circle/deleteCategory`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 分类列表--显示隐藏
 * @returns {*}
 */
export const updateStatus = data => {
  return axios.request({
    url: `Circle/updateCategoryStatus`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 分类列表--排序
 * @returns {*}
 */
export const circleSort = data => {
  return axios.request({
    url: `Circle/sortCategory`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 圈子分类列表筛选下拉
 * @returns {*}
 */
export const circleClassifySelect = data => {
  return axios.request({
    url: `Circle/filterCategoryLists`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 圈子分类列表
 * @returns {*}
 */
export const circleClassifyList = data => {
  return axios.request({
    url: `Circle/subCategoryLists`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 圈子分类列表-- 添加圈子
 * @returns {*}
 */
export const addCircleClassify = data => {
  return axios.request({
    url: `Circle/addSubCategory`,
    method: `post`,
    data: data
  })
}
/*
 * 设置圈子公告
 * @returns {*}
 */
export const setCircleAnnouncement = data => {
  return axios.request({
    url: `CircleAnnouncement/setInfo`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子分类列表-- 修改圈子
 * @returns {*}
 */
export const eddCircleClassify = data => {
  return axios.request({
    url: `Circle/saveSubCategory`,
    method: `post`,
    data: data
  })
}
/*
 * 获取圈子公告
 * @returns {*}
 */
export const getCircleAnnouncement = data => {
  return axios.request({
    url: `CircleAnnouncement/getInfo`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子分类列表-- 获取编辑数据
 * @returns {*}
 */
export const circleClassifyInfo = data => {
  return axios.request({
    url: `Circle/saveSubCategoryView`,
    method: `post`,
    data: data
  })
}
/*
 * 设置圈子模块-模块列表的显示和隐藏
 * @returns {*}
 */
export const setCircleModularStatus = data => {
  return axios.request({
    url: `CircleModular/setStatus`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子分类列表-- 搜索圈子
 * @returns {*}
 */
export const searchCircle = data => {
  return axios.request({
    url: `Circle/subCategorySearch`,
    method: `get`,
    params: data
  })
}

/**
 * 贴子 -- 帖子列表
 * @returns {*}
 */
export const invitationList = data => {
  return axios.request({
    url: `CirclePost/getList`,
    method: `post`,
    data: data
  })
}
/*
 * 圈子-banner-删除
 * @returns {*}
 */
export const deleteCircleBanner = data => {
  return axios.request({
    url: `CircleBanner/del`,
    method: `post`,
    data: data
  })
}

/**
 * 贴子 -- 帖子列表删除
 * @returns {*}
 */
export const invitationListDel = data => {
  return axios.request({
    url: `CirclePost/del`,
    method: `post`,
    data: data
  })
}
/**
 * 贴子 -- 帖子列表通过审核
 * @returns {*}
 */
export const passPostListCheck = data => {
  return axios.request({
    url: `CirclePost/audit`,
    method: `post`,
    data: data
  })
}
/*
 * 圈子-banner-显示和隐藏
 * @returns {*}
 */
export const setCircleBannerStatus = data => {
  return axios.request({
    url: `CircleBanner/setStatus`,
    method: `post`,
    data: data
  })
}

/**
 * 贴子 -- 帖子列表显示隐藏
 * @returns {*}
 */
export const invitationListStatus = data => {
  return axios.request({
    url: `CirclePost/setStatus`,
    method: `post`,
    data: data
  })
}
/*
 * 圈子-banner-编辑详情信息
 * @returns {*}
 */
export const getCircleBannerDetail = data => {
  return axios.request({
    url: `CircleBanner/getEditInfo`,
    method: `post`,
    data: data
  })
}


/**
 * 贴子 -- 帖子列表设置热度值
 * @returns {*}
 */
export const invitationListHotVal = data => {
  return axios.request({
    url: `CirclePost/setHeatValue`,
    method: `post`,
    data: data
  })
}
/*
 * 圈子-banner-新增编辑
 * @returns {*}
 */
export const editCircleBanner = data => {
  return axios.request({
    url: `CircleBanner/create`,
    method: `post`,
    data: data
  })
}

/**
 * 贴子 -- 帖子列表 添加帖子 搜索用户
 * @returns {*}
 */
export const invitationListUser = data => {
  return axios.request({
    url: `CirclePost/searchUser`,
    method: `post`,
    data: data
  })
}
/*
 * 圈子-banner-排序
 * @returns {*}
 */
export const CircleBannerSort = data => {
  return axios.request({
    url: `CircleBanner/setSort`,
    method: `post`,
    data: data
  })
}

/**
 * 贴子 -- 帖子列表 添加帖子 搜索圈子
 * @returns {*}
 */
export const invitationListCircle = data => {
  return axios.request({
    url: `CirclePost/searchCircle`,
    method: `post`,
    data: data
  })
}
/*
 * 获取TAB模块列表
 * @returns {*}
 */
export const getCircleTabModularList = data => {
  return axios.request({
    url: `CircleTabModular/getList`,
    method: `post`,
    data: data
  })
}


/**
 * 贴子 -- 帖子列表 添加帖子 搜索圈子开启列表
 * @returns {*}
 */
export const invitationListCategoryList = data => {
  return axios.request({
    url: `CirclePost/getCircleCategoryList`,
    method: `post`,
    data: data
  })
}
/*
 * 设置圈子模块TAB分类显示和隐藏
 * @returns {*}
 */
export const setCircleTabModularStatus = data => {
  return axios.request({
    url: `CircleTabModular/setStatus`,
    method: `post`,
    data: data
  })
}

/**
 * 贴子 -- 帖子列表 校验码
 * @returns {*}
 */
export const invitationCode = data => {
  return axios.request({
    url: `CheckCode/getCode`,
    method: `get`,
    params: data
  })
}

/**
 * 贴子 -- 帖子列表 校验码
 * @returns {*}
 */
export const invitationCreate = data => {
  return axios.request({
    url: `CirclePost/create`,
    method: `post`,
    data: data
  })
}
/*
 * 新增/编辑圈子模块分类
 * @returns {*}
 */
export const editCircleTabModular = data => {
  return axios.request({
    url: `CircleTabModular/create`,
    method: `post`,
    data: data
  })
}


/**
 * 贴子 -- 帖子列表 编辑详情
 * @returns {*}
 */
export const invitationEditInfo = data => {
  return axios.request({
    url: `CirclePost/getEditInfo`,
    method: `post`,
    data: data
  })
}
/*
 * 删除圈子模块分类
 * @returns {*}
 */
export const delCircleTabModular = data => {
  return axios.request({
    url: `CircleTabModular/del`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子列表 列表
 * @returns {*}
 */
export const circleList = data => {
  return axios.request({
    url: `Circle/lists`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 圈子列表 新增热度值
 * @returns {*}
 */
export const addCircleHot = data => {
  return axios.request({
    url: `Circle/addCircleHot`,
    method: `post`,
    data: data
  })
}
/*
 * 圈子模块分类排序
 * @returns {*}
 */
export const circleTabModularSort = data => {
  return axios.request({
    url: `CircleTabModular/setSort`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子列表 清空热度值
 * @returns {*}
 */
export const clearCircleHot = data => {
  return axios.request({
    url: `Circle/clearCircleHot`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 圈子列表 修改状态
 * @returns {*}
 */
export const circleStatus = data => {
  return axios.request({
    url: `Circle/updateCircleStatus`,
    method: `get`,
    params: data
  })
}

/**
 * 圈子 -- 圈子列表 删除圈子
 * @returns {*}
 */
export const deleteCircle = data => {
  return axios.request({
    url: `Circle/deleteCircle`,
    method: `post`,
    data: data
  })
}
/*
 * 帖子置顶模块-列表
 * @returns {*}
 */
export const getCirclePostModularList = data => {
  return axios.request({
    url: `CirclePostModular/getList`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子列表 添加圈子
 * @returns {*}
 */
export const addCircleData = data => {
  return axios.request({
    url: `Circle/addCircle`,
    method: `post`,
    data: data
  })
}
/*
 * 帖子置顶模块-新增
 * @returns {*}
 */
export const editCirclePostModular = data => {
  return axios.request({
    url: `CirclePostModular/create`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子列表 获取编辑数据
 * @returns {*}
 */
export const CircleInfo = data => {
  return axios.request({
    url: `Circle/saveCircleView`,
    method: `post`,
    data: data
  })
}
/*
 * 帖子置顶模块-删除
 * @returns {*}
 */
export const delCirclePostModular = data => {
  return axios.request({
    url: `CirclePostModular/del`,
    method: `post`,
    data: data
  })
}

/**
 * 圈子 -- 圈子列表 修改数据
 * @returns {*}
 */
export const saveCircle = data => {
  return axios.request({
    url: `Circle/saveCircle`,
    method: `post`,
    data: data
  })
}
/*
 * 帖子置顶模块-置顶
 * @returns {*}
 */
export const setTopcirclePostModular = data => {
  return axios.request({
    url: `CirclePostModular/setTop`,
    method: `post`,
    data: data
  })
}

/*
 * 百科词条审核-搜索游戏
 * @returns {*}
 */
export const wikiSearchGames = data => {
  return axios.request({
    url: `WikiEntry/searchGames`,
    method: `post`,
    data: data
  })
}

/**
 * 内容模块-获取排序值
 * @returns {*}
 */
export const temContentGetSort = data => {
  return axios.request({
    url: `TemContent/getSort`,
    method: `get`,
    params: data
  })
}
