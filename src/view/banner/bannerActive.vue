<template>
  <div>
    <Card>
       <p slot="title">banner活动</p>
       <Button type="primary" @click="addBanner">上传banner</Button>
    </Card>
    <Card>
      <Table border ref="selection" :columns="columns" :data="tableData" ></Table>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- modal弹框 -->
    <Modal v-model="isShowModal" :title="mode === 'add' ? '上传新banner' : '修改banner'" :mask-closable="false" @on-cancel="cancel">
      <Form ref="formInline" :model="formInline" :label-width="130" :rules="ruleInline">
        <FormItem label="排序权重：" prop="sort">
          <Input type="number" placeholder="请输入排序权重" v-model="formInline.sort" />
          <p style="display: flex;justify-content: flex-end">数字越大排序越靠前</p>
        </FormItem>
        <FormItem label="显示状态：" prop="status">
          <Select v-model="formInline.status">
            <Option :value="item.id" v-for="item in isShowstatus" :key="item.id" :label="item.value"></Option>
          </Select>
        </FormItem>
        <FormItem  prop="url" label="输入跳转链接:">
          <Input placeholder="请输入跳转链接" v-model="formInline.url"  />
        </FormItem>
        <FormItem prop="banner" label="上传banner图：">
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
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:170px;">
            <div style="width: 170px;height:98px;line-height: 98px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="cancel">取消</Button>
        <Button type="primary" size="default" @click="confirmClick('formInline')">确定</Button>
      </div>
    </Modal>
    <!-- 裁剪弹框 -->
    <Modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
      <div class="cropper" >
        <vueCropper
        ref="cropper"
        :img="option.img"
        :outputSize="option.outputSize"
        :outputType="option.outputType"
        :info="option.info"
        :canScale="option.canScale"
        :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :fixedBox="option.fixedBox"
        >
        </vueCropper>
      </div>
    </Modal>
  </div>
</template>
<script>
import { VueCropper } from 'vue-cropper'
import { getQiniuToken } from '@/api/data.js'
import axios from 'axios'
export default {
  components: { VueCropper },
  data () {
    return {
      mode: '',
      isShowModal: false,
      cropperFlag: false,
      total: 1,
      current: 1,
      per_page: 10,
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      qiniuToken: '',
      formInline: {
        sort: null,
        status: 0,
        url: '',
        banner: ''
      },
      uploadList: [],
      isShowstatus: [{ id: 0, value: '显示' }, { id: 1, value: '未显示' }],
      tableData: [
        {
          creat_time: '2017-12-10 10:10:00',
          sort: 1,
          image: 'https://cdn.tinytiger.cn/Fr9pgY-wwQJdCEBuWsvpA0Fd8roJ',
          link: 'https://www.baidu.com',
          status: 1
        }
      ],
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 375, // 默认生成截图框宽度
        autoCropHeight: 213, // 默认生成截图框高度
        fixedBox: false // 固定截图框大小 不允许改变
      },
      columns: [
        {
          title: '创建时间',
          key: 'creat_time',
          align: 'center'
        },
        {
          title: '排序',
          key: 'sort',
          align: 'center'
        },
        {
          title: '图片',
          key: 'image',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.image },
                style: { width: '120px', height: '100px', margin: '0 auto' }
              })
            ])
          }
        },
        {
          title: '跳转链接',
          key: 'link',
          align: 'center'
        },
        {
          title: 'banner状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            if (params.row.status === 1) return h('div', {}, '显示')
            else return h('div', {}, '未显示')
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
                    this.amendBanner()
                  }
                }
              }, '修改'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    console.log('删除')
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      ruleInline: {
        sort: [{ required: true, message: '请输入排序权重' }],
        status: [{ required: true, message: '请选择显示状态' }],
        url: [{ required: true, message: '请输入跳转链接' }],
        banner: [{ required: true, message: '请上传banner图' }]
      }
    }
  },
  mounted () {
    this.getQiniu()
  },
  methods: {
    // 确定事件
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          console.log(this.formInline)
        }
      })
    },
    // 取消弹框
    cancel () {
      this.isShowModal = false
      this.$refs.formInline.resetFields()
    },
    // 上传新banner
    addBanner () {
      this.mode = 'add'
      this.isShowModal = true
    },
    // 修改banner
    amendBanner () {
      this.mode = 'amend',
      this.isShowModal = true
    },
    // 获取七牛云token
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 分页相关
    handlePageChange (page) {
      this.current = page
    },
    handlePageSizeChange (size) {
      this.per_page = size
    },
    onCubeImg () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              this.formInline.banner = this.imageBaseUrl + res.data.key
              this.uploadList.push({
                status: 'finished',
                url: this.formInline.banner
              })
            } else {
              that.$message.error('上传失败')
            }
          })
      })
      this.option.img = ''
      this.cropperFlag = false
    },
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob (urlData) {
      let bytes = window.atob(urlData.split(',')[1])// 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length)
      let ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    },
    // 拿到需要截图图片
    getPic (file) {
      var reader = new FileReader()
      reader.onload = e => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
      }
      reader.readAsDataURL(file)
      this.cropperFlag = true
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
    handleBeforeUpload (file) {
      this.uploadList = []
      this.getPic(file)
      return false
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formInline.banner = ''
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
  width: 170px;
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
.cropper{
  width: 400px;
  height: 400px;
}
</style>
