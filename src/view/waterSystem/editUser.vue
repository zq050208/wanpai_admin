<template>
  <Card>
    <template slot="title">编辑</template>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="12" :sm="18" :xs="24">
      <Form
        :model="userFormData"
        :label-width="150"
        label-position="right"
      >
        <FormItem label="昵称：" prop="user_id">
          <Input v-model="userFormData.nickname" type="text" />
        </FormItem>
        <FormItem label="设置登录密码：" prop="password">
          <Input v-model="userFormData.password" type="text" />
        </FormItem>
        <FormItem label="再次输入密码：" prop="confirm_password">
          <Input v-model="userFormData.confirm_password" type="text" />
        </FormItem>
        <FormItem label="简介：" prop="resume">
          <Input v-model="userFormData.resume" type="text" />
        </FormItem>
        <FormItem label="性别:" prop="gender">
          <Select v-model="userFormData.gender">
            <Option :value="1" :key="1" label="男"></Option>
            <Option :value="2" :key="2" label="女"></Option>
          </Select>
        </FormItem>
        <FormItem label="城市：">
          <Cascader style="width:200px" :data="cityList" v-model="city"  @on-change="handleCascader"></Cascader>
        </FormItem>
        <FormItem label="年龄：" prop="age">
          <Input v-model="userFormData.age" type="text" />
        </FormItem>

        <FormItem label="头像：" prop="image">
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
            :max-size="1024"
            :on-success="handleSuccess"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="width: 100px"
          >
            <div style="padding: 5px; box-sizing: content-box">
              <Icon type="md-add-circle" size="52" style="color: #3399ff" />
            </div>
          </Upload>
        </FormItem>

        <FormItem>
          <Button type="primary" size="large" @click="handleSubmit">提交</Button>
        </FormItem>
      </Form>
      </Col>
    </Row>

  </Card>
</template>

<script>
import { getEditUserData, getQiniuToken, getAreaList, editUser } from '@/api/data'
import { mapMutations } from 'vuex'
export default {
  name: 'editUser',
  watch: {
    '$route' (to, from) {
      if(to.meta.title === from.meta.title && to.query.id !== from.query.id) {
        this.getEditUserData(to.query.id)
      }
    }
  },
  data () {
    return {
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      territory: 'random',
      city: [],
      cityList: [], // 城市数据
      uploadList: [],
      qiniuToken: '',
      userFormData: {
        user_id: '',
        password: '',
        confirm_password: '',
        gender: 0,
        avatar: '',
        nickname: '',
        age: '',
        resume: '',
        city_id: 0
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    init () {
      this.getQiniuToken()
      this.getAreaList()
      this.userFormData.user_id = this.$route.query.id
    },
    async getQiniuToken () {
      await getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    /**
     * 城市数据获取过滤
     */
    getAreaList () {
      getAreaList().then(res => {
        let listStr = JSON.stringify(res.data.data)
        listStr = listStr.replace(/city_list/g, "children")
        listStr = listStr.replace(/short_name/g, "label")
        listStr = listStr.replace(/province_code/g, "value")
        listStr = listStr.replace(/city_id/g, "value")
        this.cityList = JSON.parse(listStr)
        if (this.userFormData.user_id) this.getEditUserData(this.userFormData.user_id)
      })
    },
    getEditUserData (id) {
      getEditUserData({ user_id: id }).then(res => {
        if (res.data.code === 200) {
          this.userFormData = {
            ...this.userFormData,
            ...res.data.data.user_info
          }
          this.uploadList = [{ url: res.data.data.user_info.avatar, status: 'finished'}]
          this.userFormData.confirm_password = res.data.data.user_info.password
          let str = String(res.data.data.user_info.city_id)
          this.city = [`${str.substring(0,2)}0000`, String(res.data.data.user_info.city_id)]
        }
      })
    },
    editUser () {
      editUser(this.userFormData).then(res => {
        if (res.data.code === 200) {
          this.$Message.info('成功')
          this.closeTag(this.$route)
          this.$router.push({ path: '/waterSystem/waterUserList' })
        }
      })
    },
    handleCascader (value, selectedData) {
      this.userFormData.city_id = value[1]
    },
    handleSubmit () {
      this.editUser()
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.userFormData.avatar = ''
    },
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
      this.userFormData.avatar = file.url
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 1M。'
      })
    },
    handleBeforeUpload () {
      const check = this.uploadList.length < 1
      if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
      return check
    }
  }
}
</script>

<style scoped>
.demo-upload-list{
  display: inline-block;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0,0,0,.2);
  margin-right: 4px;
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