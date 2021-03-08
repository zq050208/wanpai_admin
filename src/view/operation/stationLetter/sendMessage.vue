<template>
  <div>
    <Row type="flex" align="middle" justify="center" style="padding: 30px 0">
      <Col :lg="8" :sm="12" :xs="18">
        <Steps :current="1">
          <Step title="选择分类"></Step>
          <Step title="完善消息内容"></Step>
        </Steps>
      </Col>
    </Row>
    <Card>
      <p slot="title">发送站内信</p>
      <Row type="flex" align="middle" justify="center">
        <Col :lg="12" :sm="18" :xs="24">
          <Form ref="sendForm" :model="formData" :rules="rules" :label-width="160" label-position="right">
            <FormItem label="产品端：" prop="title">
              <span style="color: #2d8cf0">{{ formData.app_id === 1 ? 'APP-小虎Hoo' : '小程序-分子派对' }}</span>
            </FormItem>

            <FormItem label="消息标题：" prop="title">
              <Input v-model="formData.title" />
            </FormItem>

            <FormItem label="关联作品：" prop="content_id" v-if="formData.type === 3" required>
              <Button style="overflow: hidden" long @click="modalVisible = true">{{ selectContent.title }}</Button>
            </FormItem>

            <FormItem v-if="formData.type === 1" label="文字内容：" prop="msg" required>
              <Input
                v-model="formData.msg"
                type="textarea"
                :rows="6"
              />
            </FormItem>

            <FormItem prop="relationType" v-if="formData.type === 1">
              <div slot="label"><span style="color: red">（选填）</span>关联跳转方式：</div>
              <RadioGroup v-model="formData.relationType">
                <Radio label="party_no" v-if="formData.app_id === 2">关联房间号</Radio>
                <Radio label="relation_url">关联URL</Radio>
              </RadioGroup>
            </FormItem>

            <FormItem prop="relationType" v-if="formData.type === 2" label="关联跳转方式：" required>
              <RadioGroup v-model="formData.relationType">
                <Radio label="party_no" v-if="formData.app_id === 2">关联房间号</Radio>
                <Radio label="relation_url">关联URL</Radio>
              </RadioGroup>
            </FormItem>

            <FormItem v-if="formData.relationType === 'party_no'" prop="party_no">
              <Input
                v-model="formData.party_no"
              />
            </FormItem>

            <FormItem v-if="formData.relationType === 'relation_url'" prop="relation_url">
              <Input
                v-model="formData.relation_url"
                type="url"
              />
            </FormItem>

            <!-- <FormItem prop="relation_url" v-if="formData.type === 1 || (formData.type === 2 && formData.app_id === 2)">
              <div slot="label"><span style="color: red">（选填）</span>关联URL：</div>
              <Input
                v-model="formData.relation_url"
                type="url"
              />
            </FormItem>

            <FormItem prop="relation_url" v-if="formData.type === 2 && formData.app_id !== 2" label="关联URL：" required>
              <Input
                v-model="formData.relation_url"
                type="url"
              />
            </FormItem>

            <FormItem prop="party_no" v-if="formData.app_id === 2">
              <div slot="label"><span style="color: red">（选填）</span>关联房间号：</div>
              <Input v-model="formData.party_no" />
            </FormItem> -->

            <FormItem label="发送对象：" prop="receive_user" required>
              <Row type="flex" justify="space-between">
                <Col :span="20">
                  <Input
                    placeholder="输入用户手机号，多个号码请用回车隔开"
                    v-model="phones"
                    type="textarea"
                    :rows="6"
                    maxlength="400"
                  />
                </Col>
                <Col>
                  <Checkbox v-model="formData.receive_user" true-value="0" false-value="1">全部</Checkbox>
                </Col>
              </Row>
            </FormItem>

            <FormItem label="发送时间：" prop="send_type" required>
              <Row type="flex" justify="space-between">
                <Col :span="20">
                  <DatePicker
                    :value="formData.send_time"
                    confirm
                    type="datetime"
                    format="yyyy-MM-dd HH:mm:ss"
                    @on-change="handleDateChange"
                  />
                </Col>
                <Col>
                  <Checkbox v-model="formData.send_type" :true-value="1" :false-value="0">即时</Checkbox>
                </Col>
              </Row>
            </FormItem>

            <FormItem v-if="formData.type !== 1" label="" prop="img_url">
              <h2>相关图片</h2>
              <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
                <template v-if="item.status === 'finished'">
                  <img :src="item.url" >
                  <div class="demo-upload-list-cover">
                    <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
                  </div>
                </template>
                <template v-else>
                  <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                </template>
              </div>
              <Upload
                ref="upload"
                :show-upload-list="false"
                :format="['jpg','jpeg','png']"
                type="drag"
                action="//upload-z2.qiniu.com"
                :data="{ token: qiniuToken }"
                :on-format-error="handleFormatError"
                :before-upload="handleBeforeUpload"
                :on-success="handleSuccess"
                style="display: inline-block; width: 58px;"
              >
                <div style="width: 58px;height:58px;line-height: 58px;">
                  <Icon type="ios-cloud-upload-outline" size="20"></Icon>
                </div>
              </Upload>
            </FormItem>

            <FormItem label="" prop="is_syn" v-if="formData.app_id === 1">
              <Checkbox v-model="formData.is_syn" true-value="1" false-value="0">是否同步APP推送</Checkbox>
            </FormItem>

            <FormItem>
              <Button type="primary" size="large" :loading="submitLoading" @click="handleSubmit">提交</Button>
            </FormItem>
          </Form>
        </Col>
      </Row>
      <RelationModal
        :tableData="modalTableData"
        :visible="modalVisible"
        @showModal="showModal"
        @hideModal="hideModal"
        @selectContentChange="selectContentChange"
        @getRelationContent="getRelationContent"
      />
    </Card>
  </div>
</template>

<script>
const baseImgUrl = 'https://cdn.tinytiger.cn/'

import { getQiniuToken, getStationLetterCode, sendStationLetter, getRelationContent } from '@/api/data'
import RelationModal from './relationContentModal.vue'
import { mapMutations } from 'vuex'

export default {
  components: {
    RelationModal
  },
  data() {
    const validateUser = (rule, value, callback) => {
      if(this.formData.receive_user === '1') {
        if(!this.phones) {
          callback(new Error('请输入'))
        }
      }
      callback()
    }
    const validateTime = (rule, value, callback) => {
      if(this.formData.send_type === 0) {
        if(!this.formData.send_time) {
          callback(new Error('请选择发送时间'))
        }
      }
      callback()
    }
    const validateUrl = (rule, value, callback) => {
      if(this.formData.type === 2) {
        if(!value) {
          callback(new Error('请输入关联的URL'))
        }
      }
      callback()
    }
    const validatePartyNum = (rule, value, callback) => {
      if(this.formData.type === 2) {
        if(!value) {
          callback(new Error('请输入关联的房间号'))
        }
      } 
      callback()
    }
    return {
      qiniuToken: '',
      uploadList: [],
      submitLoading: false,
      
      phones: '',
      formData: {
        type: null,
        app_id: null,
        title: '',
        msg: '',
        receive_user: '',
        is_syn: 0,
        send_time: '',
        send_type: 1,
        receive_user: '1',
        img_url: '',
        content_id: '',
        relation_url: '',
        party_no: '',

        relationType: '',
      },

      modalTableData: [],
      modalVisible: false,
      selectContent: {},
      rules: {
        title: [
          { required: true, message: '请输入消息标题' },
          { type: 'string', max: 15, message: '请输入不超过15个字符' }
        ],
        msg: [
          { required: true, message: '请输入文字内容' }
        ],
        receive_user: [
          { required: true, message: '请输入发送对象' },
          { validator: validateUser, trigger: 'change' }
        ],
        send_type: [
          { required: true, message: '请选择时间' },
          { validator: validateTime, trigger: 'change' }
        ],
        relation_url: [
          { validator: validateUrl, trigger: 'blur, change' },
          { type: 'url', message: '请输入正确的URL' }
        ],
        content_id: [
          { required: true, message: '请选择关联作品' }
        ],
        party_no: { validator: validatePartyNum }
      }
    }
  },
  mounted() {
    const { query } = this.$route
    if(query.type && query.app_id) {
      this.formData.type = Number(query.type)
      this.formData.app_id = Number(query.app_id)
      if(Number(query.app_id) === 1) {
        if(Number(query.type) === 2) this.formData.relationType = 'relation_url'
      } else {
        this.formData.relationType = 'party_no'
      }
    } else {
      this.$router.push({ path: '/operation/station_letter/type' })
    }
    if(query.type === '3') this.getRelationContent()
    this.getQiniu()
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    getStationLetterCode() {
      return new Promise((resolve, reject) => {
        getStationLetterCode()
          .then(res => {
            if(res.data.code === 200) {
              resolve(res.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    sendStationLetter(data) {
      sendStationLetter(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('发送成功')
            this.closeTag(this.$route)
            this.$router.push({path: '/operation/station_letter'})
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    getRelationContent(data) {
      getRelationContent(data)
        .then(res => {
          if(res.data.code === 200) {
            this.modalTableData = res.data.data
          }
        })
    },
    handleBeforeUpload (file) {
      this.uploadList = []
      return true
    },
    handleSuccess(response, file, fileList) {
      this.formData.img_url = baseImgUrl + response.key
      this.uploadList.push({
        status: 'finished',
        url: this.formData.img_url
      })
    },
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleRemove(file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formData.img_url = ''
    },
    handleDateChange(date) {
      if(date) {
        this.formData.send_type = 0
      } else {
        this.formData.send_type = 1
      }
      this.formData.send_time = date
    },
    showModal() {
      this.modalVisible = true
    },
    hideModal() {
      this.modalVisible = false
    },
    selectContentChange(selectContent) {
      this.selectContent = selectContent
      this.formData.content_id = selectContent.id
    },
    handleSubmit() {
      this.$refs.sendForm.validate(valid => {
        if(valid) {
          const data = {...this.formData}
          if (!this.formData.img_url && this.formData.type !== 1) {
            this.$Notice.warning({
              title: '请上传图片',
            })
            return
          }
          if(this.formData.receive_user === '1') {
            data.receive_user = JSON.stringify(this.phones.split('\n'))
          }
          // if(this.formData.type === 1) {
          //   if(this.formData.relation_url && this.formData.party_no) {
          //     this.$Modal.error({
          //       title: '关联URL和关联房间号只能填写一个',
          //     })
          //     return
          //   }
          // }
          // if(this.formData.type === 2) {
          //   if(this.formData.app_id === 2) {
          //     if(this.formData.relation_url && this.formData.party_no) {
          //       this.$Modal.error({
          //         title: '关联URL和关联房间号只能填写一个',
          //       })
          //       return
          //     }
          //     if(!this.formData.relation_url && !this.formData.party_no) {
          //       this.$Modal.error({
          //         title: '关联URL和关联房间号必须填写一个',
          //       })
          //       return
          //     }
          //   }
          // }
          if(this.formData.type === 3) {
            if(this.selectContent && this.selectContent.id) {
              this.formData.content_id = this.selectContent.id
              data.content_id = this.selectContent.id
            } else {
              this.$Notice.warning({
                title: '请选择关联作品',
              })
              return
            }
          }
          this.submitLoading = true
          this.getStationLetterCode()
            .then(res => {
              data.checkcode = res.data.checkcode
              this.sendStationLetter(data)
            })
            .catch(() => {
              this.submitLoading = false
            })
        }
      })
    }
  }
}
</script>

<style scoped>
  .demo-upload-list{
    display: inline-block;
    width: 105px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin: 0px 4px;
  }
  .demo-upload-list img{
    width: 100%;
    height: 100%;
  }
  .demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.6);
  }
  .demo-upload-list:hover .demo-upload-list-cover{
    display: block;
  }
  .demo-upload-list-cover i{
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>