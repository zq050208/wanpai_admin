<template>
  <div>
    <Card :bordered="false">
        <p slot="title">{{secCateName}}</p>
				<Button type="primary" @click="uploadBanner" :disabled="tableData.length >= 5" style="margin-bottom: 8px;">上传Banner</Button>
        <Table
        border
        stripe
        :data="tableData"
        :columns="columns"
        />
    </Card>
      <Modal v-model="changeBannerModal" width="600" :title="isEdit ? '更换banner' : '上传banner'" footer-hide>
        <Form :model="formData" ref="formData" label-position="left" :label-width="100">
          <FormItem label="选择游戏" prop="game_id">
            <Select v-model="formData.game_id" style="width:200px" filterable @on-change="submitStatus = false">
              <Option v-for="item in gameNameList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <!-- <FormItem prop="img_url" label="banner图：">
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
              style="display: inline-block;width:710px;">
              <div style="width: 58px;height:58px;line-height: 58px;">
                <Icon type="ios-cloud-upload-outline" size="20"></Icon>
              </div>
            </Upload>
          </FormItem> -->
          <FormItem label="banner图：" prop="img_url">
            <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
              <template v-if="item.status === 'finished'">
                <img :src="item.url" style="width: 335px;height:144px;line-height: 144px;margin-right:10px" >
                <div class="demo-upload-list-cover">
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
              :before-upload="handleBeforeUpload"
              type="drag"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
              style="display: inline-block;width:335px;">
              <div style="width:335px; height:144px; display:flex; flex-direction: column;justify-content: center; align-items: center">
                <Icon type="ios-cloud-upload-outline" size="20"></Icon>
              </div>
            </Upload>
          </FormItem>
        </Form>
        <Button type="primary"  style="margin-left: 104px;" @click="handleSubmit('formData')" :disabled="submitStatus" :loading="submitLoadingStatus">提交</Button>
      </Modal>
      <!-- 图片裁剪弹窗 -->
      <modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
        <div class="cropper">
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
            :fixed="option.fixed"
            :fixedNumber="option.fixedNumber"
            :full="option.full"
            :centerBox="option.centerBox"
          />
        </div>
      </modal>
      <!-- 查看配图放大版 -->
      <modal v-model="viewImg" width="400" footer-hide :closable="false">
        <img :src="imgUrl" alt="" style="width: 100%;">
      </modal>
  </div>
</template>

<script>
import axios from 'axios'
import { VueCropper } from 'vue-cropper'
import SearchForm from '@/components/searchForm'
import { getIndexCateBanner, delGameBanner, getGameList, addBanner, getQiniuToken, editBanner } from '@/api/data'

export default {
  components: {
    SearchForm,
    VueCropper
  },
  data () {
    return {
      changeBannerModal: false, // 添加一级分类弹窗
      gameNameList: [], // 游戏名称列表
      submitStatus: true,
      isEdit: false,
      submitLoadingStatus: false,
      cropperFlag: false, // 裁剪图片弹窗
      qiniuToken: '', // Token
      uploadList: [],
      viewImg: false,
      imgUrl: '',
      secCateName: this.$route.query.cate_name,
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      formData: {
        game_id: 0,
        cate_id: 0,
        img_url: ''
      },
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg || png', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, // 是否输出原图比例的截图
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [335, 144], // 截图框的宽高比例
        autoCropWidth: 335, // 默认生成截图框宽度
        autoCropHeight: 144, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      addFormData: {
        game_id: 0,
        cate_id: 0,
        img_url: ''
      },
      tableData: [],
      ruleInline: {
        game_id: [
          { required: true, message: '请选择游戏名称', trigger: 'change' }
        ],
        img_url: [
          { required: true, message: '请上传banner图' }
        ]
      },
      columns: [
        {
          align: 'center',
          title: '编号',
          render: (h, params) => {
            return h('div', {}, params.index + 1)
          }
        },
        {
          align: 'center',
          title: '游戏名',
          key: 'game_name'
        },
        {
          title: 'banner图',
          align: 'center',
          render: (h, params) => {
            return h('img', {
              attrs: { src: params.row.img_url },
              style: { width: '50px', height: '50px', margin: '0 auto' },
              on: {
                click: () => {
                  this.viewImg = true
                  this.imgUrl = params.row.img_url
                }
              }
            })
          }
        },
        {
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin-right': '8px'
                  },
                  on: {
                    click: () => {
                      this.getGameList()
                      this.isEdit = true
                      this.changeBannerModal = true
                      this.submitStatus = true
                      let tempData = params.row
                      this.formData.cate_id = tempData.id
                      this.formData.game_id = tempData.game_id
                      this.formData.img_url = tempData.img_url
                      this.formData.id = tempData.id
                      this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: tempData.img_url }]
          						this.uploadList = this.$refs.upload.fileList
                    }
                  }
                },
                '更换'
              ),
              params.row.img_url ? h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确定清空该内容吗？',
                        onOk: () => {
                          this.delGameBanner(params.row.id)
                        }
                      })
                    }
                  }
                },
                '删除'
              ) : h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {

                    }
                  }
                },
                '上传'
              )
            ])
          }
        }
      ],
      searchParams: {
        keywords: ''
      },
      searchData: {
        keywords: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
            //   this.pageParams.page = 1
              this.searchParams = { ...this.searchData }
              // this.getGameCategoryList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'keywords',
            label: '关键词查询：',
            placeholder: '请输入分类名称'
          }
        ]
      }
    }
  },
  mounted () {
    this.getIndexCateBanner()
    this.getqinniuToken()
  },
  methods: {
    getqinniuToken () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 图片上传
    onCubeImg () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        this.getqinniuToken()
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              if (this.option.type === 'hdfile') {
                this.formData.img_url = this.imageBaseUrl + res.data.key
                this.uploadList.push({
                  status: 'finished',
                  url: this.formData.img_url
                })
              }
            } else {
              that.$Message.error('上传失败')
            }
          })
      })
      this.option.img = ''
      this.cropperFlag = false
      this.submitStatus = false
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
    getPic (file, type) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.$Modal.error({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg或者png 格式的图片。'
        })
        return false
      }
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
      if (type === 'cover') {
        this.option.fixedNumber = [335, 144]
        this.option.autoCropWidth = 335
        this.option.autoCropHeight = 144
        this.$refs.cropper.refresh()
      }
      this.cropperFlag = true
    },
    handleBeforeUpload (file) {
      this.uploadList = []
      this.option.type = 'hdfile'
      this.getPic(file, 'cover')
      return false
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formData.img_url = ''
    },
    uploadBanner () {
      this.getGameList()
      this.formData = { ...this.addFormData }
      this.isEdit = false
      this.changeBannerModal = true
      this.submitStatus = true
      this.$refs.upload.fileList = []
      this.uploadList = this.$refs.upload.fileList
      this.submitLoadingStatus = false
    },
    getIndexCateBanner () {
      let cate_id = this.$route.query.cate_id
      getIndexCateBanner({ cate_id: cate_id })
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data
            this.tableData.forEach(item => {
              item.game_name = item.game_info.name
            })
          }
        })
        .catch(err => {
          this.tableData = []
        })
    },
    getGameList () {
      getGameList({ cate_id: this.$route.query.cate_id, per_page: 1000, is_simple: 1 }).then(res => {
        if (res.data.code === 200) {
          const gameList = res.data.data.data.map(item => {
            return {
              label: item.name,
              value: item.id
            }
          })
          this.gameNameList = gameList
        }
      })
    },
    // 提交新增或编辑分类
    handleSubmit (name) {
      if (!this.formData.game_id) return this.$Message.warning('请选择游戏')
      if (!this.formData.img_url) return this.$Message.warning('请上传Banner图')
      let paramsData = { ...this.formData }
      paramsData.cate_id = Number(this.$route.query.cate_id)
      this.submitLoadingStatus = true
      if (this.isEdit) {
        editBanner(paramsData).then(res => {
          if (res.data.code === 200) {
            this.$Message.success('更换成功')
            this.changeBannerModal = false
            this.getIndexCateBanner()
          } else {
            this.submitLoadingStatus = false
          }
        })
      } else {
        addBanner(paramsData).then(res => {
          if (res.data.code === 200) {
            this.$Message.success('上传成功')
            this.changeBannerModal = false
            this.getIndexCateBanner()
          } else {
            this.submitLoadingStatus = false
          }
        })
      }
    },
    delGameBanner (id) {
      delGameBanner({ id })
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            this.getIndexCateBanner()
          }
        })
        .catch(err => {
          this.$Message.error()
        })
    }
  }
}
</script>

<style scoped>
  .page{
    margin-top: 20px;
    text-align: center;
  }
  .demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 335px;
    height: 144px;
    background: rgba(0,0,0,.6);
}
.demo-upload-list:hover .demo-upload-list-cover{
    display: block;
}
.demo-upload-list-cover i{
    display: block;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 70px auto;
}
.cropper{
  width: 400px;
  height: 400px;
}
</style>
