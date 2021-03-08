import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter, 
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead
} from '@/libs/util'
import { saveErrorLogger, mainList } from '@/api/data'
import router from '@/router'
import routers from '@/router/routers'
import config from '@/config'
import { hasKey } from '@/libs/tools'
const _ = require('lodash')
const { homeName } = config

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: {},
    local: localRead('local'),
    errorList: [],
    hasReadErrorPage: false,
    menuRspList: [],
    contentData:{},
    modular_id:''
  },
  getters: {
    // menuList: (state, getters, rootState) => getMenuByRouter(routers),
    menuList: (state, getters, rootState) => getMenuByRouter(state.menuRspList),
    errorCount: state => state.errorList.length
  },
  mutations: {
    setModular_id(state,data){
      state.modular_id = data
    },
    setContentData(state,data){
      state.contentData = data
    },
    setMenuRspList (state, list) {
      // state.menuRspList = routers
      state.menuRspList = list
      state.hasInfo = true
    },
    setBreadCrumb (state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
    },
    setHomeRoute (state, routes) {
      state.homeRoute = getHomeRoute(routes, homeName)
    },
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else tagList = getTagNavListFromLocalstorage() || []
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex >= 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      closePage(state, route)
    },
    addTag (state, { route, type = 'unshift' }) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') state.tagNavList.push(router)
        else {
          if (router.name === homeName) state.tagNavList.unshift(router)
          else state.tagNavList.splice(1, 0, router)
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal (state, lang) {
      localSave('local', lang)
      state.local = lang
    },
    addError (state, error) {
      state.errorList.push(error)
    },
    setHasReadErrorLoggerStatus (state, status = true) {
      state.hasReadErrorPage = status
    }
  },
  actions: {
    getMenuData ({ commit, rootState }, params) {
      mainList(params).then(res => {
        if (res.data.code === 200) {
          var list = res.data.data.children
          var dynamicMenu = (obj, arr) => {
            if (obj.length) {
              obj.filter(item => arr.some(args => {
                if (item.name === args.meta.title) {
                  if (item.is_menu === 1) {
                    args.sort = item.sort
                    args.meta.hideInMenu = false
                  }
                  if (hasKey(item, 'children') && hasKey(args, 'children')) {
            
                    item.children.filter(d => args.children.filter(v => {
                      if (d.name === v.meta.title && d.is_menu === 1) {
                        v.sort = d.sort
                        v.meta.hideInMenu = false
                      }
                    }))
                  }
                }
              }))
            }
          }
          dynamicMenu(list, routers)
          let newRouters = _.sortBy(routers, function (o) {
            if (o.children) o.children = _.sortBy(o.children, (d) => { return -d.sort })
            return -o.sort
          })
          commit('setMenuRspList', newRouters)
        }
      }).catch(e => {
        console.log(e)
      })
    },
    addErrorLog ({ commit, rootState }, info) {
      if (!window.location.href.includes('error_logger_page')) commit('setHasReadErrorLoggerStatus', false)
      const { user: { token, userId, userName } } = rootState
      let data = {
        ...info,
        time: Date.parse(new Date()),
        token,
        userId,
        userName
      }
      saveErrorLogger(info).then(() => {
        commit('addError', data)
      })
    }
  }
}
