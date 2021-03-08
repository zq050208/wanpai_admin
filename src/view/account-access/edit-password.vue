<template>
  <Card>
    <p slot="title">修改密码</p>
    <Form ref="formInline" :model="formInline" :rules="ruleInline" inline >
      <FormItem label="旧密码：" prop="old_password">
        <Input type="text" v-model="formInline.old_password" placeholder="请输入旧密码" />
      </FormItem>
      <FormItem label="新密码：" prop="new_password">
        <Input type="text" v-model="formInline.new_password" placeholder="请输入新密码" />
      </FormItem>
      <FormItem class="add">
        <Button  type="primary" @click="handleSubmit('formInline')">修改</Button>
      </FormItem>
    </Form>
  </Card>
</template>

<script>
import { getEditPasswordCode, getEditPassword } from '@/api/data'
export default {
  name: 'edit-password',
  data () {
    return {
      formInline: {
        old_password: '',
        new_password: ''
      },
      ruleInline: {
        old_password: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        new_password: [
          { required: true, message: '请输入新密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getCode () {
      getEditPasswordCode().then(res => {
        if (res.data.code === 200) {
          this.editPassword(res.data.data.token)
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    editPassword (token) {
      let obj = { old_password: this.formInline.old_password, new_password: this.formInline.new_password, token: token }
      getEditPassword(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.msg)
          this.formInline = { old_password: '', new_password: '' }
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.getCode()
        } else {
          this.$Message.error('Fail!')
        }
      })
    }
  }

}
</script>

<style scoped>
  .add{
    margin-top: 32px;
  }
</style>
