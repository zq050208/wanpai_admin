<template>
  <div>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
		<Button type="primary" @click="addTagClick">添加二级分类</Button>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
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
    <Modal v-model="addHotModal" width="400" title="新增热度值" footer-hide>
      <Form :model="hotFormData" ref="hotFormData" label-position="left" :label-width="120">
          <FormItem label="所属一级分类：">
            {{hotFormData.parent_cate_name}}
          </FormItem>
          <FormItem label="二级分类名称：">
            {{hotFormData.cate_name}}
          </FormItem>
          <FormItem label="热度值：">
            <span style="color:#D9001B;">{{hotFormData.hots}}</span> + {{hotFormData.click_num + hotFormData.game_num * 10}} = {{Number(hotFormData.hots) + Number(hotFormData.click_num + hotFormData.game_num * 10)}}
          </FormItem>
          <FormItem label="新增热度值" prop="hots">
            <input type="text" v-model="hotFormData.hots" name="tel" oninput="value=value.replace(/[^\d]/g,'')" maxlength="9" style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"/>
            <!-- <InputNumber :min="1" v-model="hotFormData.click_num"></InputNumber> -->
          </FormItem>
        </Form>
        <Button type="primary"  style="margin-left: 104px;" @click="handleHotSubmit('hotFormData')">提交</Button>
    </Modal>
      <Modal v-model="addTagModal" width="500" :title="title" footer-hide>
        <Form :model="formData" ref="formData" label-position="left" :label-width="120">
          <FormItem label="所属一级分类" prop="pid">
            <Select v-model="formData.pid" style="width:240px" filterable @on-change="selectChange" :disabled="selectDisabled">
              <Option v-for="item in firstCateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="二级分类名称" prop="cate_name">
            <Input v-model="formData.cate_name" placeholder="请输入分类名称" maxlength="10" style="width: 240px" @on-change="submitStatus = false"></Input>
          </FormItem>
          <FormItem label="配图：" prop="icon" v-show="formData.template_id === 3">
            <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
              <template v-if="item.status === 'finished'">
                <img :src="item.url" style="width: 240px;height:180px;line-height: 180px;margin-right:10px" >
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
              style="display: inline-block;width:240px;">
              <div style="width:240px; height:180px; display:flex; flex-direction: column;justify-content: center; align-items: center">
                <Icon type="ios-cloud-upload-outline" size="20"></Icon>
              </div>
            </Upload>
          </FormItem>
          <FormItem label="是否显示">
            <i-switch v-model="formData.status" true-color="#19be6b" @on-change="submitStatus = false"/>
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
import { getGameCategoryList, deleteGameCategory, getQiniuToken, getGameCheckCode, editCateStatus, editGameCategory, addGameCategory, getGameOneDetail, editCateHots } from '@/api/data'
import { getTagNavListFromLocalstorage } from '@/libs/util'
export default {
  components: {
    SearchForm,
    VueCropper
  },
  data () {
    return {
      title: '添加二级分类',
      addTagModal: false, // 添加一级分类弹窗
      cropperFlag: false, // 图片裁剪弹窗
      viewImg: false, // 放大缩略图
      imgUrl: '', // 放大banner图地址
      addHotModal: false, // 新增热度值弹窗
      submitStatus: true, // 新增或编辑时提交按钮是否可点击
      submitLoadingStatus: false,
      isEdit: false, // 区分编辑or新增
      selectDisabled: false,
      qiniuToken: '', // Token
      uploadList: [],
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      checkcode: '', // 提交编辑新增时需要的checkcode
      firstCateList: [], // 一级分类名称列表
      originalFirstCateList: [],
      hotFormData: {
        id: 0,
        parent_cate_name: '',
        cate_name: '',
        click_num: 0,
        game_num: 0,
        hots: 0
      },
      formData: {
        pid: 0,
        cate_name: '',
        status: true,
        icon: '',
        template_id: 3
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
        fixedNumber: [240, 180], // 截图框的宽高比例
        autoCropWidth: 240, // 默认生成截图框宽度
        autoCropHeight: 180, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      addFormData: {
        pid: 0,
        cate_name: '',
        status: true,
        icon: ''
      },
      tableData: [],
      columns: [
        {
          align: 'center',
          title: '序号',
          key: 'id'
        },
        {
          align: 'center',
          title: '二级分类名称',
          key: 'cate_name'
        },
        {
          align: 'center',
          title: '所属一级分类',
          key: 'parent_cate_name'
        },
        {
          align: 'center',
          title: '包含游戏数',
          key: 'game_num'
        },
        {
          title: '是否配图',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              params.row.parent_name.template_id !== 4 ? h(
                'img',
                {
                  attrs: { src: params.row.icon },
                  style: { width: '50px', height: '50px', margin: '0 auto' },
                  on: {
                    click: () => {
                      this.viewImg = true
                      this.imgUrl = params.row.icon
                    }
                  }
                }
              ) : h('div', {}, '无')
            ])
          }
        },
        {
          align: 'center',
          title: '热度值',
          render: (h, params) => {
            return h('div', [
              h(
                'span',
                {
                  style: {
                    color: '#D9001B'
                  }
                }, params.row.hots + '+'),
              h(
                'span',
                {
                  style: {
                    color: '#515a6e'
                  }
                }, params.row.click_num + params.row.game_num * 10 + '='),
              h(
                'span',
                {
                  style: {
                    color: '#515a6e'
                  }
                }, params.row.hots + (params.row.click_num + params.row.game_num * 10)),
              h('div', [
                h('span', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    'color': '#2D8CF0',
                    'margin-right': '8px',
                    'cursor': 'pointer'
                  },
                  on: {
                    click: () => {
                      this.addHotModal = true
                      console.log('params', params)
                      let hotData = params.row
                      this.hotFormData.parent_cate_name = hotData.parent_cate_name
                      this.hotFormData.cate_name = hotData.cate_name
                      this.hotFormData.click_num = hotData.click_num
                      this.hotFormData.hots = hotData.hots
                      this.hotFormData.game_num = hotData.game_num
                      this.hotFormData.id = hotData.id
                    }
                  }
                }, '新增热度值'),
                params.row.hots !== 0 ? h('span', {
                  style: {
                    'color': '#ED4014',
                    'cursor': 'pointer'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认清空热度值吗？',
                        onOk: () => {
                          editCateHots({ id: params.row.id, hots: 0 }).then(res => {
                            if (res.data.code === 200) {
                              this.$Message.success('已清空热度值')
                              this.getGameCategoryList()
                            }
                          })
                        }
                      })
                    }
                  }
                }, '清空新增') : ''
              ])
            ])
          }
        },
        {
          align: 'center',
          title: '显示/隐藏',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: params.row.status === 1,
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
                        }
                      })
                    }
                  }
                },
                '删除'
              ),
              h(
                'Button',
                {
                  props: {
                    type: params.row.cate_banner_num === 0 ? 'default' : 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin-top': '8px'
                  },
                  on: {
                    click: () => {
                      let tagList = getTagNavListFromLocalstorage() || []
                      let flag = true
                      if (tagList.length) {
                        tagList.forEach(item => {
                          if (item.name === 'bannerManage') {
                            flag = false
                          }
                        })
                      }
                      if (flag) {
                        this.$router.push({ path: `bannerManage?cate_id=${params.row.id}&cate_name=${params.row.cate_name}` })
                      } else {
                        this.$Modal.error({ content: '已有banner管理页面正在编辑，请关闭后再编辑当前banner', title: '提示' })
                      }
                      // this.$router.push({ path: `bannerManage?cate_id=${params.row.id}&cate_name=${params.row.cate_name}` })
                    }
                  }
                },
                'banner管理'
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
        keywords: '',
        cate_id: 0
      },
      searchData: {
        keywords: '',
        cate_id: 0
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
            name: 'Select',
            label: '筛选一级分类',
            prop: 'cate_id',
            options: []
          },
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
  created () {
    this.getFirstCateList()
    this.getGameCategoryList()
    this.getqinniuToken()
  },
  mounted () {
  },
  methods: {
    selectChange (value) {
      this.submitStatus = false
      this.formData.pid = value
      // tamplate_id为4（纯文字模板）时不显示是否配图
      let tempData = this.originalFirstCateList.filter((item, index) => {
        return item.id === value
      })
      this.formData.template_id = tempData[0].template_id
      this.uploadList = this.$refs.upload.fileList
      this.uploadList = []
    },
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
    // 添加二级分类
    addTagClick () {
      this.getFirstCateList()
      this.title = '添加二级分类'
      this.addTagModal = true
      this.isEdit = false
      this.submitStatus = true
      this.selectDisabled = false
      this.formData = { ...this.addFormData }
      this.$refs.upload.fileList = []
      this.uploadList = this.$refs.upload.fileList
      this.formData.pid = this.firstCateList[0].value
      this.formData.template_id = this.firstCateList[0].template_id
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
      this.title = '修改二级分类'
      this.selectDisabled = true
      getGameOneDetail({ id: id }).then(res => {
        if (res.data.code === 200) {
          let tempData = res.data.data
          this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: tempData.icon }]
          this.uploadList = this.$refs.upload.fileList
          this.formData.cate_name = tempData.cate_name
          this.formData.id = tempData.id
          this.formData.icon = tempData.icon
          this.formData.pid = tempData.pid
          this.formData.template_id = tempData.template_id
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
        this.option.fixedNumber = [240, 180]
        this.option.autoCropWidth = 240
        this.option.autoCropHeight = 180
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
      this.formData.icon = ''
    },
    // 获取一级分类名称list
    getFirstCateList () {
      getGameCategoryList({ level: 0 }).then(res => {
        if (res.data.code === 200) {
          this.originalFirstCateList = res.data.data
          const firstCateList = res.data.data.map(item => {
            return {
              label: item.cate_name,
              value: item.id,
              template_id: item.template_id
            }
          })
          this.firstCateList = firstCateList
          let tempFirstCateList = firstCateList.concat()
          tempFirstCateList.unshift({
            label: '全部',
            value: 0
          })
          this.searchForm.components[0].options = tempFirstCateList
        }
      })
    },
    // 获取二级分类列表
    getGameCategoryList () {
      this.tableData = []
      const data = {
        level: 2,
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      }
      getGameCategoryList(data)
        .then(res => {
          if (res.data.code === 200) {
            let tableData = res.data.data.data
            tableData.forEach(item => {
              item.parent_cate_name = item.parent_name.cate_name
            })
            this.tableData = tableData
            this.pageParams.total = res.data.data.total
          }
        })
        .catch(err => {
          this.tableData = []
        })
    },
    // 提交新增或编辑热度值
    handleHotSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let paramsData = { ...this.hotFormData }
          editCateHots({ id: paramsData.id, hots: paramsData.hots }).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('编辑成功')
              this.addHotModal = false
              this.getGameCategoryList()
            }
          })
        }
      })
    },
    // 提交新增或编辑分类
    handleSubmit (name) {
      // 新增分类
      if (!this.formData.pid) return this.$Message.warning('请选择所属一级分类')
      if (!this.formData.cate_name) return this.$Message.warning('请输入二级分类名称')
      if (this.formData.template_id === 3 && !this.formData.icon) return this.$Message.warning('上图下文模板请上传配图')
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
  .ivu-modal-wrap{
    position: absolute;
    top: 0;
    left: 0;
  }
.demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 240px;
    height: 180px;
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
