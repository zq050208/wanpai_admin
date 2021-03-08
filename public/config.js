/**
 * branchPath： DEVELOP:开发  RELEASE：预发 MASTER：正式
 * @type {number}
 */
const branchPath = {
  DEVELOP: 'http://192.168.1.241/wanpai_admin/public/index.php/',
  RELEASE: 'http://wanpai_admin.titipa.cn/xhdj/wanpai_admin/public/index.php/',
  MASTER: 'http://wanpai_admin.tinytiger.cn/xhdj/wanpai_admin/public/index.php/'
}
const server = {
  BASE_URL: branchPath.DEVELOP
}
