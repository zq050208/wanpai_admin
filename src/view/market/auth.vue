<template>
  <div style="margin: 50px 0 0 50px">
    <Row type="flex" justify="start">
      <Form ref="form" :label-width="140" :model="formData" :rules="rules">
        <FormItem label="权限开关密码：" prop="password">
          <Input v-model="formData.password" placeholder="请输入密码" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit">更新</Button>
        </FormItem>
      </Form>
    </Row>
  </div>
</template>

<script>
import { setShopPassword } from '@/api/data'

export default {
  data () {
    return {
      rules: {
        password: { required: true, message: '请输入密码' }
      },
      formData: {
        password: ''
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          setShopPassword(this.formData).then(res => {
            if (res.data.code === 200) {
              this.$Message.success(res.data.msg)
              this.$refs.form.resetFields()
            }
          })
        }
      })
    }
  }
}
</script>
