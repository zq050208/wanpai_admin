<template>
  <div>
    <Row type="flex" align="middle" justify="center" style="padding:30px 0">
      <Col :lg="8" :sm="12" :xs="18">
        <Steps :current="0">
          <Step title="选择分类"></Step>
          <Step title="信息受理"></Step>
        </Steps>
      </Col>
    </Row>

    <div class="tip">
      <p class="tip-word"> <Icon type="ios-bookmark-outline" /> 选择消息分类</p>
    </div>

    <Card style="padding: 30px">
      <Row type="flex" align="middle" justify="center">
        <Col :lg="12" :sm="18" :xs="24">
          <Form inline ref="sendForm" :model="formData" :rules="rules" :label-width="100" label-position="right">
            <FormItem prop="app_id">
              <Select size="large" v-model="formData.app_id" placeholder="选择产品端">
                <Option value="1">APP-小虎Hoo</Option>
                <Option value="2">小程序-分子派对</Option>
              </Select>
            </FormItem>
            <FormItem prop="type">
              <Select size="large" v-model="formData.type" placeholder="选择消息分类">
                <Option value="1">文字消息</Option>
                <Option value="2">活动消息</Option>
                <Option v-if="formData.app_id === '1'" value="3">内容推荐</Option>
              </Select>
            </FormItem>
            <Row style="margin-top: 20px">
              <FormItem>
                <Button type="primary" @click="handleSubmit">下一步，维护消息信息</Button>
              </FormItem>
            </Row>
          </Form>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      formData: {
        type: null,
        app_id: null
      },
      rules: {
        app_id: [
          { required: true, message: '请选择产品端' }
        ],
        type: [
          { required: true, message: '请选择消息分类' }
        ]
      },
    }
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    handleSubmit() {
      this.$refs.sendForm.validate(valid => {
        if(valid) {
          this.closeTag(this.$route)
          this.$router.push({ path: `/operation/station_letter/send?type=${this.formData.type}&app_id=${this.formData.app_id}` })
        }
      })
    }
  }
}
</script>

<style scoped>
  .tip {
    position: relative;
    width: 180px;
    height: 40px;
    margin: 40px 0;
    background-color: darkgrey;
    display: inline-block;
  }
  .tip-word {
    font-size: 18px;
    line-height: 40px;
    color: #fff;
    font-weight: 600;
  }
  .ivu-icon-ios-bookmark-outline {
    font-size: 24px;
  }
  .tip::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    line-height: 40px;
    border-left: 20px solid darkgrey;
    border-top: 20px solid transparent;
    border-bottom: 20px solid transparent;
    top: 0;
    left: 180px;
  }
</style>