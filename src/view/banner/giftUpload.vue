<template>
  <div>
    <Card>
       <p slot="title">礼物上传</p>
       <Button type="primary" @click="addBanner">新增礼物</Button>
    </Card>
    <Card>
      <Table border ref="selection" :columns="columns" :data="tableData"></Table>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- modal弹框 -->
    <Modal v-model="isShowModal" :title="mode === 'add' ? '新增礼物' : '编辑礼物'" :mask-closable="false" @on-cancel="cancleClick">
      <Form ref="formInline" :model="formInline" :label-width="120" :rules="ruleInline" >
        <FormItem label="排序权重：" prop="sort">
          <Input type="number"  placeholder="请输入排序权重" v-model="formInline.sort" />
          <p style="display: flex;justify-content: flex-end">数字越大排序越靠前</p>
        </FormItem>
        <FormItem label="礼物状态：" prop="is_show">
          <Select v-model="formInline.is_show">
            <Option :value="item.id" v-for="item in isShowstatus" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem  prop="name" label="礼物名称:">
          <Input placeholder="请输入礼物名称" v-model="formInline.name" />
        </FormItem>
        <FormItem   label="礼物价格:" prop="price">
          <Input placeholder="请输入礼物价格" v-model="formInline.price" type="number" style="width: 250px" />　P币
        </FormItem>
        <FormItem   label="礼物单位:" prop="unit">
          <Input placeholder="请输入礼物单位" v-model="formInline.unit" style="width: 250px" />　例：个/颗/只
        </FormItem>
        <FormItem prop="image" label="礼物图片：">
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
          <div>只支持 .jpg 格式</div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="cancleClick">取消</Button>
        <Button type="primary" size="default" @click="confirmClick('formInline')">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getQiniuToken, getGifDatatList, geteditIsShow, getDelGift, getaddView, editGift, getAddGift, geteditView } from '@/api/data.js'
export default {
  data () {
    return {
      mode: '',
      isShowModal: false,
      total: 1,
      current: 1,
      per_page: 10,
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      qiniuToken: '',
      formInline: {
        sort: '',
        is_show: 1,
        name: '',
        price: null,
        image: '',
        unit: ''
      },
      uploadList: [],
      isShowstatus: [],
      tableData: [],
      columns: [
        {
          title: '排序',
          key: 'sort',
          align: 'center'
        },
        {
          title: '礼物名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '礼物图片',
          key: 'image',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.image },
                style: { width: '80px', height: '80px', margin: '0 auto' }
              })
            ])
          }
        },
        {
          title: '价格/p币',
          key: 'price',
          align: 'center'
        },
        {
          title: '赠送数量',
          key: 'num',
          align: 'center'
        },
        {
          title: '礼物单位',
          key: 'unit',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: params.row.is_show === 1 ? 'success' : 'default', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: params.row.is_show === 1 ? '确定下架？' : '确定上架？',
                      onOk: () => {
                        this.getGifteditIsShow(params.row.id, params.row.is_show)
                      }
                    })
                  }
                }
              }, params.row.is_show === 1 ? '下架' : '上架'),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { margin: '0px 10px 0px 10px' },
                on: {
                  click: () => {
                    this.amendBanner(params.row.id)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确认删除吗？',
                      onOk: () => {
                        this.deleteGiftContent(params.row.id)
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
        sort: [{ required: true, message: '请输入排序权重' }],
        is_show: [{ required: true, message: '请选择礼物状态' }],
        name: [{ required: true, message: '请输入礼物名称' }],
        price: [{ required: true, message: '请输入礼物价格' }],
        unit: [{ required: true, message: '请输入礼物单位' }],
        image: [{ required: true, message: '请上传礼物图片' }]
      }
    }
  },
  mounted () {
    this.getQiniu()
    this.getDatatList()
  },
  methods: {
    // 获取礼物列表
    getDatatList () {
      var data = {
        page: this.current,
        per_page: this.per_page
      }
      getGifDatatList(data).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
        }
      })
    },
    // 礼物上下架
    getGifteditIsShow (ids, status) {
      var data = {
        id: ids,
        is_show: status === 1 ? 0 : 1
      }
      geteditIsShow(data).then(res => {
        if (res.data.code === 200) {
          this.current = 1
          this.getDatatList()
        }
      })
    },
    // 删除礼物
    deleteGiftContent (ids) {
      getDelGift({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.getDatatList()
        }
      })
    },
    // 确定事件
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.mode === 'amend') {
            editGift(this.formInline).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('编辑成功')
                this.isShowModal = false
                this.$refs.formInline.resetFields()
                this.current = 1
                this.getDatatList()
                this.$refs.upload.fileList = []
                this.formInline.image = ''
              }
            })
          } else {
            getAddGift(this.formInline).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('新增成功')
                this.isShowModal = false
                this.$refs.formInline.resetFields()
                this.current = 1
                this.getDatatList()
                this.$refs.upload.fileList = []
                this.formInline.image = ''
              }
            })
          }
        }
      })
    },
    // 取消事件
    cancleClick () {
      this.isShowModal = false
      this.formInline.image = ''
      this.$refs.upload.fileList = []
      this.$refs.formInline.resetFields()
    },
    // 上传新banner
    addBanner () {
      this.mode = 'add'
      this.isShowModal = true
      this.uploadList = []
      getaddView().then(res => {
        if (res.data.code === 200) {
          this.formInline.checkcode = res.data.data.checkcode
          this.isShowstatus = res.data.data.gift_is_show
        }
      })
    },
    // 修改礼物
    amendBanner (ids) {
      this.mode = 'amend'
      this.isShowModal = true
      this.uploadList = []
      geteditView({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.isShowstatus = res.data.data.gift_is_show
          this.formInline.checkcode = res.data.data.checkcode
          this.formInline.sort = res.data.data.info.sort
          this.formInline.is_show = res.data.data.info.is_show
          this.formInline.name = res.data.data.info.name
          this.formInline.price = res.data.data.info.price
          this.formInline.unit = res.data.data.info.unit
          this.formInline.id = res.data.data.info.id
          this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: res.data.data.info.image }]
          this.uploadList = this.$refs.upload.fileList
          this.formInline.image = this.uploadList[0].url
          console.log(this.formInline)
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
    // 分页相关
    handlePageChange (page) {
      this.current = page
      this.per_page = 10
      this.getDatatList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.current = 1
      this.getDatatList()
    },
    // 图片上传
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
      this.formInline.image = file.url
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
      this.formInline.image = ''
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
