<template>
  <div>
    <AccountList v-on:add="getNewAccount('formInline')" ref='list' v-on:update="getChangeAccount"></AccountList>
    <Modal v-model="isShowModal" :mask-closable="false" :title="title ? '添加成员' : '编辑成员'">
      <Form :label-width="120"  ref="formInline" :model="formInline" :rules="ruleInline">
        <FormItem label="账号：" prop="username">
          <Input type="text" v-model="formInline.username" placeholder="请输入账号" />
        </FormItem>
        <FormItem label="姓名：" prop="nickname">
          <Input type="text" v-model="formInline.nickname" placeholder="请输入姓名" />
        </FormItem>
        <FormItem label="联系方式：" prop="mobile">
          <Input type="text" v-model="formInline.mobile" placeholder="请输入联系方式" />
        </FormItem>
        <FormItem label="企业邮箱：" prop="email">
          <Input type="text" v-model="formInline.email" placeholder="请输入企业邮箱" />
        </FormItem>
        <FormItem label="所属角色" prop="role_id">
          <Select v-model="formInline.role_id" placeholder="选择所属角色后默认继承角色权限">
            <Option :value="item.id" v-for="item in role_list" :key="item.id" :label="item.role_name"></Option>
          </Select>
        </FormItem>
        <FormItem label="是否修改密码:" v-if="!title">
          <RadioGroup v-model="status" @on-change="radioChange">
            <Radio :label="0" >否</Radio>
            <Radio :label="1" >是</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="登录密码：" prop="password" v-if="status === 1">
          <Input type="password" :password="true" v-model="formInline.password" placeholder="请输入密码" />
        </FormItem>
        <FormItem label="确认密码：" prop="confirm_password" v-if="status === 1">
          <Input type="password" :password="true" v-model="formInline.confirm_password" placeholder="请再次输入密码" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit('formInline')">提交</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getRoleList, addUser, getSaveView, userSave, getEditAccountCode, getAddAccountCode } from '@/api/data'
import AccountList from './components/account-list/account-list'
export default {
  name: 'add-account',
  components: { AccountList },
  data () {
    const pwdCheckValidate = (rule, value, callback) => {
      if (this.formInline.password !== value) {
        callback(new Error('两次密码输入不一致'))
      } else {
        callback()
      }
    }
    return {
      isShowModal: false,
      data: {},
      role_list: [],
      title: false,
      status: 0,
      current_password: '',
      isNewPass: 1,
      formInline: {
        checkcode: '',
        username: '',
        nickname: '',
        mobile: '',
        password: '',
        confirm_password: '',
        role_id: '',
        email: ''
      },
      ruleInline: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入联系方式', trigger: 'blur' }
        ],
        role_id: [
          { required: true, message: '请选择角色', trigger: 'change', type: 'number' }
        ],
        password: [
          { required: true, min: 6, message: '请输入至少6位数密码', trigger: 'blur' }
        ],
        confirm_password: [
          { required: true, validator: pwdCheckValidate, trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {

  },
  methods: {
    radioChange (e) {
      if (e === 0) {
        this.formInline.password = this.current_password
        this.formInline.confirm_password = this.current_password
      } else {
        this.formInline.password = ''
        this.formInline.confirm_password = ''
      }
    },
    getChangeAccount (id) { // 获取修改弹窗
      this.status = 0
      this.title = false
      getSaveView({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.role_list = res.data.data.role_list
          this.current_password = res.data.data.info.password
          this.formInline = {
            checkcode: res.data.data.checkcode,
            id: res.data.data.info.id,
            username: res.data.data.info.username,
            nickname: res.data.data.info.nickname,
            mobile: res.data.data.info.mobile,
            role_id: res.data.data.info.role_id,
            password: res.data.data.info.password,
            confirm_password: res.data.data.info.password,
            email: res.data.data.info.email
          }
          this.isShowModal = true
        }
      })
    },
    getNewAccount (name) { // 获取新建弹窗
      this.formInline = {
        checkcode: '',
        username: '',
        nickname: '',
        mobile: '',
        password: '',
        confirm_password: '',
        role_id: ''
      }
      this.getAccountCode()
      this.status = 1
      this.title = true
    },
    async getAccountCode () { // 新建校验码
      await getAddAccountCode().then(res => {
        if (res.data.code === 200) {
          this.formInline.checkcode = res.data.data.checkcode
          this.role_list = res.data.data.role_list
          this.isShowModal = true
        }
      })
    },
    addAccount () {
      addUser(this.formInline).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.cancel()
          this.$refs.list.getAccountRecord()
        }
      })
    },
    updateAccount () {
      userSave(this.formInline).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.cancel()
          this.$refs.list.getAccountRecord()
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.title) { // 新增
            this.addAccount()
          } else { // 编辑
            this.updateAccount()
          }
        }
      })
    },
    cancel () {
      this.isShowModal = false
    }
  }
}

</script>
<style scoped>
.add {
  margin-top: 32px;
}

</style>
