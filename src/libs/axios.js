import axios from 'axios'
import Cookies from 'js-cookie'
import {
  hasKey
} from '@/libs/tools'
import {
  getToken
} from '@/libs/util'
import {
  Message,
  Modal
} from 'view-design'
import router from '@/router'

var flag = true

class HttpRequest {
  constructor(baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig() {
    var config = {
      baseURL: this.baseUrl,
      headers: {}
    }
    var token = getToken()
    if (token && token !== 'undefined') config.headers = {
      token: token
    }
    return config
  }
  destroy(url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors(instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const {
        data,
        status
      } = res
      if (res.data.code === 10000) {
        console.log(1111)
        this.backToLogin()
      } else if (res.data.code !== 200) {
        // 跳转登录页
        if (res.data.code === 10027) {
          this.backToLogin()
        } else if (hasKey(res.data.data, 'redirect_url')) {
          this.backToLogin()
        } else {
          if (res.config.url.indexOf('TemCategory/indexCategory') == -1) {
            Message.error({
              content: res.data.msg,
              duration: 3,
              closable: true
            })
          }

        }
      }
      return {
        data,
        status
      }
    }, error => {
      this.destroy(url)
      let errorInfo = error.response
      if (!errorInfo) {
        const {
          request: {
            statusText,
            status
          },
          config
        } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: {
            responseURL: config.url
          }
        }
      }
      return Promise.reject(error)
    })
  }
  request(options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
  backToLogin() {
    Cookies.remove('wanpai_token')
    if (flag) {
      flag = false
      Modal.error({
        title: '登录超时',
        content: '登录信息超时,请重新登录',
        okText: '重新登录',
        onOk: () => {
          flag = true
          router.replace({
            path: 'login'
          })
        }
      })
    }
  }
}
export default HttpRequest
