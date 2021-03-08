<template>
  <div>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
		<Button type="primary" @click="addTagClick" style="margin-bottom: 8px;">添加一级分类</Button>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
      :loading="loading"
    />
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="pageParams.total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
      <Modal v-model="addTagModal" width="400" :title="title" footer-hide>
        <Form :model="formData" ref="formData" label-position="left" :label-width="100">
          <FormItem label="一级分类名称" prop="cate_name">
            <Input v-model="formData.cate_name" placeholder="请输入分类名称" maxlength="10" @on-change="submitStatus = false"></Input>
          </FormItem>
          <FormItem label="模板选择">
            <Radio-group v-model="formData.template_id" @on-change="submitStatus = false">
              <Radio :value="3" :label="3" :disabled="radioDisabled">上图下文</Radio>
              <Radio :value="4" :label="4" :disabled="radioDisabled">纯文字</Radio>
            </Radio-group>
          </FormItem>
          <FormItem label="排序" prop="order">
            <input type="text" v-model="formData.order" name="tel" oninput="value=value.replace(/[^\d]/g,'')" maxlength="9" @change="submitStatus = false" style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"/>
            <!-- <InputNumber :min="1" v-model="formData.order" @on-change="submitStatus = false"></InputNumber> -->
          </FormItem>
          <FormItem prop="icon" label="icon：">
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
              :before-upload="handleBeforeUpload"
              type="drag"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
              style="display: inline-block;width:40px;">
              <div style="width: 40px;height:40px;line-height: 40px;">
                <Icon type="ios-cloud-upload-outline" size="20"></Icon>
              </div>
            </Upload>
            <!-- <div>只支持 .jpg 格式</div> -->
          </FormItem>
          <FormItem label="是否显示">
            <i-switch v-model="formData.status" true-color="#19be6b" @on-change="submitStatus = false"/>
          </FormItem>
        </Form>
        <Button type="primary"  style="margin-left: 104px;" @click="handleSubmit('formData')" :disabled="submitStatus" :loading="submitLoadingStatus">提交</Button>
        <p class="warn_text" v-if="isEdit">当模板选择发生变化时，需要先将状态设置为隐藏</p>
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
  </div>
</template>

<script>
import axios from 'axios'
import { VueCropper } from 'vue-cropper'
import SearchForm from '@/components/searchForm'
import { getGameCategoryList, deleteGameCategory, getQiniuToken, editCateStatus, getGameCheckCode, editGameCategory, addGameCategory, getGameOneDetail, editCateOrder } from '@/api/data'

export default {
  components: {
    SearchForm,
    VueCropper
  },
  data () {
    return {
      loading: false,
      title: '添加一级分类',
      addTagModal: false, // 添加一级分类弹窗
      cropperFlag: false, // 图片裁剪弹窗
      isEdit: false, // 区分编辑or新增
      submitStatus: true, // 新增或编辑时提交按钮是否可点击
      submitLoadingStatus: false,
      radioDisabled: true, // 编辑禁止切换上图下文和纯文字
      qiniuToken: '', // Token
      uploadList: [],
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      checkcode: '',
      formData: {
        cate_name: '',
        order: 1,
        status: true,
        template_id: 3, // 模板id
        icon: ''
      },
      addFormData: {
        cate_name: '',
        order: 1,
        status: true,
        template_id: 3, // 模板id
        icon: ''
      },
      tableData: [],
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
        fixedNumber: [1, 1], // 截图框的宽高比例
        autoCropWidth: 40, // 默认生成截图框宽度
        autoCropHeight: 40, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      columns: [
        {
          align: 'center',
          title: '序号',
          key: 'id'
        },
        {
          align: 'center',
          title: '一级分类名称',
          key: 'cate_name'
        },
        {
          title: 'icon',
          align: 'center',
          render: (h, params) => {
            return h('img', {
              attrs: { src: params.row.icon },
              style: { width: '40px', height: '40px', margin: '0 auto' }
            })
          }
        },
        {
          align: 'center',
          title: '含有二级分类',
          render: (h, params) => {
            // return h('div', {}, params.row.son_cate_info.map(i => h('div', {}, i.cate_name)))
            return h('div', {}, params.row.son_cate_text.length > 30 ? params.row.son_cate_text.substr(0, 30) + '...' : params.row.son_cate_text)
          }
        },
        {
          align: 'center',
          title: '模板选择',
          render: (h, params) => {
            if (+params.row.template_id === 3) {
              return h('div', {}, '上图下文')
            } else if (+params.row.template_id === 4) {
              return h('div', {}, '纯文字')
            }
          }
        },
        {
          align: 'center',
          title: '显示/隐藏',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: +params.row.status === 1,
                'true-color': '#19be6b',
                'before-change': () => this.editCateStatus(params.row.id)
              }
            })
          }
        },
        {
          align: 'center',
          title: '添加时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '排序',
          render: (h, params) => {
            // console.log('params', params, this.tableData)
            return h('div', [
              +params.row.status === 1 ? h('div', {}, params.row.order) : '',
              params.index !== 0 ? h(
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
                      let editId = this.tableData[params.index - 1].id
                      this.editCateOrder(params.row.id, editId)
                    }
                  }
                },
                '上移'
              ) : '',
              params.index !== this.tableData.length - 1 ? h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      let editId = this.tableData[params.index + 1].id
                      this.editCateOrder(params.row.id, editId)
                    }
                  }
                },
                '下移'
              ) : ''
            ])
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
                      this.getGameOneDetail(params.row.id)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认要删除此分类吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.deleteGameCategory(params.row.id)
                          console.log(params)
                        }
                      })
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
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
              this.pageParams.page = 1
              this.searchParams = { ...this.searchData }
              this.getGameCategoryList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'keywords',
            label: '关键词查询',
            placeholder: '请输入分类名称'
          }
        ]
      }
    }
  },
  mounted () {
    this.getGameCategoryList()
    this.getqinniuToken()
  },
  methods: {
    // 显示/隐藏 分类
    editCateStatus (id) {
      let data = {
        id: id
      }
      editCateStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('修改成功')
          this.getGameCategoryList()
        }
      }).catch((error) => {
        console.log(error)
      })
    },
    // 上移下移排序
    editCateOrder (id, editId) {
      editCateOrder({ id: id, edit_id: editId }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('排序成功')
          this.getGameCategoryList()
        }
      })
    },
    // 添加一级分类
    addTagClick () {
      this.title = '添加一级分类'
      this.addTagModal = true
      this.isEdit = false
      this.submitStatus = true
      this.radioDisabled = false
      this.formData = { ...this.addFormData }
      this.$refs.upload.fileList = []
      this.uploadList = this.$refs.upload.fileList
    },
    getqinniuToken () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 获取编辑单条数据
    getGameOneDetail (id) {
      this.addTagModal = true
      this.isEdit = true
      this.submitStatus = true
      this.title = '编辑一级分类'
      this.radioDisabled = true
      getGameOneDetail({ id: id }).then(res => {
        if (res.data.code === 200) {
          let tempData = res.data.data
          this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: tempData.icon }]
          this.uploadList = this.$refs.upload.fileList
          this.formData.cate_name = tempData.cate_name
          this.formData.id = tempData.id
          this.formData.icon = tempData.icon
          this.formData.order = tempData.order
          this.formData.template_id = tempData.template_id
          this.formData.pid = tempData.pid
          this.formData.status = tempData.status === 1
        }
      })
    },
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
                this.formData.icon = this.imageBaseUrl + res.data.key
                this.uploadList.push({
                  status: 'finished',
                  url: this.formData.icon
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
        this.option.fixedNumber = [1, 1]
        this.$refs.cropper.refresh()
      } else {
        this.option.fixedNumber = [300, 534]
        this.$refs.cropper.refresh()
      }
      this.cropperFlag = true
      console.log('img:', this.option.img)
    },
    // 图片上传
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
      this.formData.icon = ''
    },
    getGameCategoryList () {
      this.tableData = []
      const data = {
        level: 1,
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      }
      this.loading = true
      getGameCategoryList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.loading = false
            let tempData = res.data.data.data
            let tempArr = []
            tempData.forEach((item) => {
              item.son_cate_text = []
              item.son_cate_info.forEach((i) => {
                item.son_cate_text.push(i.cate_name)
              })
              item.son_cate_text = item.son_cate_text.join(' ')
            })
            this.tableData = tempData
            this.pageParams.page = res.data.data.current_page
            this.pageParams.per_page = res.data.data.per_page
            this.pageParams.total = res.data.data.total
          }
        })
        .catch(err => {
          this.tableData = []
        })
    },
    // 提交新增或编辑分类
    handleSubmit (name) {
      if (!this.formData.cate_name) return this.$Message.warning('请输入一级分类名称')
      if (!this.formData.icon) return this.$Message.warning('请上传icon')
      this.submitLoadingStatus = true
      getGameCheckCode()
        .then(res => {
          if (res.data.code === 200) {
            let paramData = { ...this.formData }
            paramData.checkcode = res.data.data.checkcode
            paramData.status = paramData.status ? 1 : 0
            // 编辑提交
            if (this.isEdit) {
              editGameCategory(paramData)
                .then(res => {
                  this.submitLoadingStatus = false
                  if (res.data.code === 200) {
                    this.$Message.success('编辑成功')
                    this.addTagModal = false
                    this.getGameCategoryList()
                  }
                })
            } else {
              // 新增提交
              paramData.pid = 0
              addGameCategory(paramData)
                .then(res => {
                  this.submitLoadingStatus = false
                  if (res.data.code === 200) {
                    this.$Message.success('添加成功')
                    this.addTagModal = false
                    this.getGameCategoryList()
                  }
                })
            }
          }
        })
    },
    deleteGameCategory (id) {
      deleteGameCategory({ id })
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除分类成功')
            if (this.tableData.length === 1 && this.pageParams.page > 1) {
              this.pageParams.page--
            }
            this.getGameCategoryList()
            // this.tableData = this.tableData.filter(item => item.id !== id)
          }
        })
        .catch(err => {
          this.$Message.error()
        })
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.getGameCategoryList()
    },
    handlePageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.getGameCategoryList()
    }
  }
}
</script>

<style scoped>
.page{
  margin-top: 20px;
  text-align: center;
}
.demo-upload-list{
  display: inline-block;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
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
.warn_text{
  color: #ff9900;
  margin-top: 8px;
}
</style>
