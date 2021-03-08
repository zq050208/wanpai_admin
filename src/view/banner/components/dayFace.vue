<template>
  <div>
    <Card>
      <Button type="primary" style="margin-bottom:50px" @click="addDayFace">上传新门面</Button>
       <Table border :columns="columns" :data="dataList" ref="table"></Table>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <Modal v-model="dayFaceModal" :mask-closable="false" @on-cancel="cancel">
      <p slot="header" style="text-align:center">上传新门面</p>
      <Form :rules="ruleInline" :model="formInline" ref="formInline">
        <FormItem label="展示时间：" prop="time">
           <DatePicker type="date" placeholder="请选择展示时间" :value="formInline.time" format="yyyy-MM-dd" @on-change="timeChange"></DatePicker>
        </FormItem>
        <FormItem label="上传门面图:" prop="img_url">
          <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" >
              <div class="demo-upload-list-cover" style="line-height: 200px;">
                <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload 
          v-show="uploadList.length < 1"
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
            style="display: inline-block;width:150px;height:200px">
            <div style="width:150px;height:198px;line-height: 200px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        <div>只支持.jpg 格式</div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="cancel">取消</Button>
        <Button type="primary" size="default" @click="confirmClick('formInline')">确定</Button>
      </div>
    </Modal>
    <!-- 图片裁剪 -->
      <modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
        <div class="cropper" >
          <VueCropper
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
            :full="option.full"
            :fixed="option.fixed"
            :fixedNumber="option.fixedNumber"
            :centerBox="option.centerBox"
          />
        </div>
    </modal>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'
import axios from 'axios'
import { getQiniuToken, getIndexDailyFacade, getDelDailyFacade, getDailyindexAddCode, getDailyindexAdd } from '@/api/data.js'
export default {
  components: { VueCropper },
  data () {
    return {
      total: 1,
      current: 1,
      per_page: 10,
      dayFaceModal: false,
      cropperFlag: false,
      uploadList: [],
      qiniuToken: '',
      formInline: {
        time: '',
        img_url: ''
      },
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      dataList: [],
      columns: [
        {
          title: '序号',
          key: 'index',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.index + 1)
          }
        },
        {
          title: '开启时间',
          key: 'create_time',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, this.returnTime(params.row.date))
          }
        },
        {
          title: '图片',
          key: 'url',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.img_url },
                style: { width: '100px', height: '100px', margin: '0 auto' }
              })
            ])
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, pramas) => {
            return h('Button', {
              props: { type: 'error', size: 'default' },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: '提示',
                    content: '确定删除吗？',
                    onOk: () => {
                      this.deleteClick(pramas.row.id)
                    }
                  })
                }
              }
            }, '删除')
          }
        }
      ],
      ruleInline: {
        time: [{ required: true, message: '请选择展示时间' }],
        img_url: [{ required: true, message: '请上传门面图' }]
      },
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 317, // 默认生成截图框宽度
        autoCropHeight: 368, // 默认生成截图框高度
        full: true,     //是否输出原图比例的截图	
        fixed: true,    //是否开启截图框宽高固定比例	
        fixedNumber: [317, 368],  //截图框的宽高比例
        fixedBox: false,  // 固定截图框大小 不允许改变
        centerBox: true,  // 截图框是否被限制在图片里面
      }
    }
  },
  mounted () {
    this.getQiniu()
    this.getDataList()
  },
  methods: {
    // 获取列表
    getDataList () {
      var obj = {
        page: this.current,
        per_page: this.per_page
      }
      getIndexDailyFacade(obj).then(res => {
        if (res.data.code === 200) {
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
          this.dataList = res.data.data.data
        }
      })
    },
    // 删除事件
    deleteClick (ids) {
      getDelDailyFacade({ facade_id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.getDataList()
        }
      })
    },
    // 获取七牛云token
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 新增门面确定事件
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.getDeldailyCode().then(res => {
            if (res.code === 200) {
              this.formInline.checkcode = res.data.checkcode
              getDailyindexAdd(this.formInline).then(res => {
                if (res.data.code === 200) {
                  if (res.data.data.code === 30003) {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '是否覆盖原图?',
                      onCancel: () => {
                        this.formInline.is_cover = 0
                        this.dayFaceModal = false
                        this.cancel()
                      }
                    })
                    this.formInline.is_cover = 1
                  } else {
                    this.$Message.success('上传新门面成功')
                    this.cancel()
                    this.current = 1
                    this.getDataList()
                    this.formInline.is_cover = 0
                  }
                }
              })
            }
          })
        }
      })
    },
    // 获取校验码
    getDeldailyCode () {
      return new Promise((resolve, reject) => {
        getDailyindexAddCode().then(res => {
          if (res.data.code === 200) {
            resolve(res.data)
          }
        })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 取消事件
    cancel () {
      this.dayFaceModal = false
      this.$refs.formInline.resetFields()
      this.uploadList = []
      this.$refs.upload.fileList = []
    },
    // 新增门面
    addDayFace () {
      this.dayFaceModal = true
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      if (month < 10) {
        month = '0' + month
      }
      if (day < 10) {
        day = '0' + day
      }
      this.formInline.time = String(year + '-' + month + '-' + day)
    },
    timeChange (date) {
      this.formInline.time = date
    },
    //   page 改变
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    // size改变
    handlePageSizeChange (size) {
      this.per_page = size
      this.getDataList()
    },
    // // 图片上传
    // handleSuccess (res, file) {
    //   file.url = this.imageBaseUrl + res.key
    //   this.uploadList = this.$refs.upload.fileList
    //   this.formInline.img_url = res.key
    // },
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
              this.formInline.img_url = this.imageBaseUrl + res.data.key
              this.uploadList.push({
                status: 'finished',
                url: this.formInline.img_url
              })
            } else {
              that.$Message.error('上传失败')
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
      // const check = this.uploadList.length < 1
      // if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
      this.getPic(file)
      return false
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formInline.img_url = ''
    },
    returnTime (time) {
      var times = String(time).substring(0, 4) + '-' + String(time).substring(4, 6) + '-' + String(time).substring(6, 8)
      return times
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
.ivu-upload{
    width: 150px;
    height: 200px;
}
 .demo-upload-list{
    display: inline-block;
    width: 150px;
    height: 200px;
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
  .cropper{
    width: 400px;
    height: 400px;
  }
</style>
