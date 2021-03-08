<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip">输入用户名和密码</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
import { getLoginCode } from '@/api/data'
import store from '@/store'

export default {
  components: {
    LoginForm
  },
  mounted () {
    if (store.state.app.hasInfo) window.location.reload()
  },
  methods: {
    ...mapActions([
      'handleLogin'
    ]), 
    handleSubmit ({ userName, password }) {
      getLoginCode().then(res => {
        var token = res.data.data.checkcode
        this.handleLogin({ userName, password, token }).then(res => {
          this.$router.push({
            name: this.$config.homeName
          })
        })
      })
    }
  }
}
</script>

<style>

</style>
