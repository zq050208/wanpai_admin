<template>
  <div style="margin-top:100px">
    <Form :label-width="600" :rules="ruleInline" :model="formInline" style="margin: 0 auto " ref='formInline'>
      <FormItem label="旧密码：" prop="password">
        <Input type="password" style="width:250px" v-model="formInline.password" />
      </FormItem>
      <FormItem label="新密码：" prop="newPassword">
        <Input type="password" style="width:250px" v-model="formInline.newPassword" />
      </FormItem>
      <FormItem label="再一次输入新密码：" prop="confirmPassword">
        <Input type="password" style="width:250px" v-model="formInline.confirmPassword" />
      </FormItem>
      <FormItem style="margin-top:50px;">
        <Button type="primary" @click="confirmModification('formInline')" style="margin-left: 80px;">确定修改</Button>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import { revampPassword } from '@/api/data.js'
export default {
  data () {
    const pwdCheckValidate = (rule, value, callback) => {
      if (this.formInline.newPassword !== '' && value === '') {
        callback(new Error('确认密码不能为空'))
      } else if (this.formInline.newPassword !== value) {
        callback(new Error('两次密码输入不一致'))
      } else {
        callback()
      }
    }
    return {
      formInline: {
        password: '',
        newPassword: '',
        confirmPassword: ''
      },
      ruleInline: {
        password: [{ required: true, message: '请输入至少6位数旧密码', trigger: 'blur', min: 6 }],
        newPassword: [{ required: true, message: '请输入至少8位数新密码', trigger: 'blur', min: 8 }],
        confirmPassword: [{ required: true, validator: pwdCheckValidate, message: '两次密码输入不一致', trigger: 'blur', min: 8 }]
      }
    }
  },
  methods: {
    confirmModification (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          revampPassword(this.formInline).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('修改成功')
              this.resertFrom()
            }
          })
        }
      })
    },
    // 清空数据
    resertFrom () {
      this.$refs.formInline.resetFields()
    }
  }
}
</script>
