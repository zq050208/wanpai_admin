import { login, logout } from '@/api/user'
import { setToken, getToken, setUserName } from '@/libs/util'
import { Message } from 'view-design'
import store from '@/store'

export default {
  state: {
    userName: '',
    userId: '',
    avatarImgPath: '',
    token: getToken(),
    access: '',
    hasGetInfo: false,
    unreadCount: 0,
    messageUnreadList: [],
    messageReadedList: [],
    messageTrashList: [],
    messageContentStore: {},
    circleModuleLists: [],
    gameCheckPage: 1,
    uploadImgList: []
  },
  mutations: {
    setUserName (state, name) {
      state.userName = name
      setUserName(name)
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    }
  },
  getters: {
    // messageUnreadCount: state => state.messageUnreadList.length,
    // messageReadedCount: state => state.messageReadedList.length,
    // messageTrashCount: state => state.messageTrashList.length
  },
  actions: {
    // 登录
    handleLogin ({ commit }, { userName, password, token }) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password,
          token 
        }).then(res => {
          var data = res.data
          if (data.code === 200) {
            commit('setToken', data.data.token)
            commit('setUserName', data.data.user_name)
            store.state.app.hasInfo = false
            resolve(data)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout().then(res => {
          if (res.data.code === 200 || res.data.code === 10008) {
            commit('setToken', '')
            commit('setUserName', '')
            resolve(res)
          } else {
            Message.error(res.data.msg)
          }
        }).catch(err => {
          Message.error(err)
          reject(err)
        })
      })
    }
  }
}
