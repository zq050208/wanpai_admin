import axios from '@/libs/api.request'

/***
 * 登录
 * @param userName 用户名
 * @param password 密码
 * @param token
 * @returns {*}
 */
export const login = ({ userName, password, token }) => {
  const data = {
    username: userName,
    password: password,
    checkcode: token
  }
  return axios.request({
    url: 'Login/doLogin',
    data,
    method: 'post'
  })
}
/***
 * 退出登录
 * @returns {*}
 */
export const logout = () => {
  return axios.request({
    url: 'Login/doLogout',
    method: 'post'
  })
}
