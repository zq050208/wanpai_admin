<template>
  <div>
     <Card>
        <p slot="title">官方通知</p>
        <Button type="primary" @click="addNotice">创建通知</Button>
     </Card>
     <Card>
       <Table border :columns="columns" :data="dataList" ref="table"></Table>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- 弹框 -->
    <Modal v-model="dayFaceModal" :title="mode === 'amend' ? '修改通知' : '创建通知'" :mask-closable="false" @on-cancel="cancel">
      <Form :rules="ruleInline" :model="formInline" ref="formInline">
        <FormItem prop="notice">
          <p>输入通知内容（必填）</p>
            <Input  type="textarea" v-model="formInline.notice" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入通知内容" style="width: 100%" />
        </FormItem>
        <FormItem  prop="url">
          <p>输入跳转链接（选填）</p>
          <Input placeholder="请输入跳转链接"  v-model="formInline.url" />
        </FormItem>
        <FormItem prop="avatar" >
          <p>添加通知图片（选填）</p>
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
            :max-size="2048"
            :on-success="handleSuccess"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        <div>(支持扩展名：jpg，png，大小不超过2M)</div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="cancel">取消</Button>
        <Button type="primary" size="default" @click="confirmClick('formInline')">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getQiniuToken } from '@/api/data.js'
export default {
  data () {
    return {
      dayFaceModal: false,
      uploadList: [],
      qiniuToken: '',
      mode: '',
      total: 1,
      current: 1,
      per_page: 10,
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      formInline: {
        notice: ''
      },
      dataList: [
        {
          id: 1,
          time: '2019-11-29 12:20:00',
          content: '卡卡哒时间久点叫你弟那口家带你飞',
          avatar: 'https://cdn.tinytiger.cn/Fr9pgY-wwQJdCEBuWsvpA0Fd8roJ',
          link: 'https://www.baidu.com',
          isSend: 0
        }
      ],
      columns: [
        {
          title: '创建时间',
          key: 'time',
          align: 'center'
        },
        {
          title: '公告内容',
          key: 'content',
          align: 'center'
        },
        {
          title: '公告图片',
          key: 'avatar',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.avatar },
                style: { width: '100px', height: '100px', margin: '0 auto' }
              })
            ])
          }
        },
        {
          title: '输入链接',
          key: 'link',
          align: 'center'
        },
        {
          title: '发送',
          key: 'send',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: { type: params.row.isSend === 0 ? 'success' : 'default' }
            }, params.row.isSend === 0 ? '立即发送' : '已发送')
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { margin: '0px 20px 0px 0px' },
                on: {
                  click: () => {
                    this.mode = 'amend'
                    this.amendData(params.row.id)
                  }
                }
              }, '修改'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确定删除吗？',
                      onOk: () => {
                        console.log('确定删除')
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      ruleInline: {
        notice: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
        url: [{ required: false, message: '请输入正确的地址', trigger: 'blur', type: 'url' }]
      }
    }
  },
  mounted () {
    this.getQiniu()
  },
  methods: {
    // 创建/修改通知
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.mode === 'amend') {
            console.log('编辑')
          } else {
            console.log('新增')
          }
        }
      })
    },
    // 修改事件
    amendData (ids) {
      this.formInline.id = ids
      this.dayFaceModal = true
    },
    // 取消弹框
    cancel () {
      this.dayFaceModal = false
      this.resetForm()
    },
    // 充值表单
    resetForm () {
      this.$refs.formInline.resetFields()
    },
    // 获取七牛云token
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 创建通知
    addNotice () {
      this.mode = 'set'
      this.dayFaceModal = true
    },
    handlePageChange (page) {
      this.current = page
    },
    handlePageSizeChange (size) {
      this.per_page = size
    },
    // 图片上传
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
      this.formInline.avatar = file.url
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
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
      })
    },
    handleBeforeUpload () {
      const check = this.uploadList.length < 1
      if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
      return check
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formInline.avatar = ''
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
.demo-upload-list{
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
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
