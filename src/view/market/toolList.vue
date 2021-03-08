<template>
  <div>
    <SearchForm title="筛选数据" :searchForm="searchForm" :searchData="searchData" />

    <div style="margin-bottom: 20px">
      <Button @click="handleAdd">添加道具</Button>
    </div>

    <Table
      border
      :data="tableData"
      :columns="columns"
    />

     <Page
      class="page"
      show-elevator
      show-sizer show-total
      :total="total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />

    <Modal
      :title="mode === 'add' ? '添加道具' : '编辑道具'"
      v-model="visible"
      footer-hide
      @on-visible-change="modalVisibleChange"
    >
      <Form ref="form" :label-width="120" :model="formData" :rules="rules">
        <FormItem label="第三方编号：" prop="code">
          <Input v-model="formData.code" placeholder="请输入第三方编号" />
        </FormItem>
        <FormItem label="商品类型：" prop="cate_id">
          <Select v-model="formData.cate_id">
            <Option v-for="opt in shopCate" :key="opt.id" :value="opt.id">{{opt.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="商品名称：" prop="name" required>
          <Input v-model="formData.name" placeholder="请输入商品名称（最多可输入8个字）" />
        </FormItem>
        <FormItem label="商品价格：" prop="price">
          <Input type="number" v-model="formData.price" />
        </FormItem>

        <FormItem label="封面:" prop="image">
          <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" >
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemoveImg"></Icon>
              </div>
            </template>
          </div>
          <Upload
            ref="upload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            :format="['jpg','jpeg', 'png']"
            :on-format-error="handleFormatError"
            :before-upload="handleBeforeUpload"
            :on-success="handleImgSuccess"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
          <div>点击封面图重新上传，支持上传jpg/png/jpeg格式，宽高比1.77</div>
        </FormItem>

        <FormItem>
          <Button @click="handleCancel" style="margin-right: 16px">取消</Button>
          <Button @click="handleSubmit" type="primary">发布</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
import { getQiniuToken, getToolCheckCode, getShopCate, getToolList, addShopTool, editShopTool, delTool, updateToolStatus } from '@/api/data'

const baseImgUrl = 'https://cdn.tinytiger.cn/'

export default {
  components: { SearchForm },
  data () {
    const checkName = (rule, value, callback) => {
      if (!value) return new Error('请输入商品名称')
      if (value.length > 8) return new Error('最多输入8个字')
      callback()
    }
    return {
      checkcode: '',
      qiniuToken: '',
      uploadList: [],

      mode: 'add',
      visible: false,
      formData: {
        code: '',
        cate_id: '',
        name: '',
        price: ''
      },
      rules: {
        code: { required: true, message: '请输入第三方编号' },
        cate_id: { required: true, message: '请选择商品类型' },
        name: { validator: checkName },
        price: { required: true, message: '请输入商品价格' }
      },
      shopCate: [],
      tableData: [],
      total: 1,
      pageParams: {
        page: 1,
        per_page: 10
      },

      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = {
                ...this.searchData,
                cate_id: this.searchData.cate_id === -1 ? '' : this.searchData.cate_id
              }
              this.pageParams.page = 1
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            label: '商品类型：',
            prop: 'cate_id',
            options: []
          },
          {
            name: 'Input',
            label: '关键词查询：',
            prop: 'keywords',
            placeholder: '请输入商品名称或产品编号'
          },
          {
            name: 'Select',
            label: '商品状态：',
            prop: 'status',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '上架',
                value: 1
              },
              {
                label: '下架',
                value: 2
              }
            ]
          }
        ]
      },
      searchParams: {
        cate_id: '',
        status: 0,
        keywords: ''
      },
      searchData: {
        cate_id: -1,
        status: 0,
        keywords: ''
      },
      columns: [
        {
          title: '产品编号',
          key: 'id',
          align: 'center'
        },
        {
          title: '第三方编号',
          key: 'code',
          align: 'center'
        },
        {
          title: '商品类型',
          key: 'cate_name',
          align: 'center'
        },
        {
          title: '商品名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '商品图片',
          key: 'image',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.image },
                style: { width: '100px', height: '100px', margin: '0 auto' }
              })
            ])
          }
        },
        {
          title: '商品价格',
          key: 'price',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.price + ' H币')
          }
        },
        {
          title: '销量',
          key: 'sales',
          align: 'center'
        },
        {
          title: '上传时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '库存',
          key: 'stock',
          align: 'center'
        },
        {
          align: 'center',
          title: '上/下架',
          key: 'status',
          width: '90px',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: params.row.status === 1,
                'before-change': () => this.updateToolStatus(params.row)
              }
            })
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
                    this.mode = 'edit'
                    this.visible = true
                    let id
                    this.shopCate.forEach(item => {
                      if (item.name === params.row.cate_name) {
                        id = item.id
                      }
                    })
                    this.formData = {
                      ...params.row,
                      cate_id: id
                    }
                    this.uploadList = [{
                      status: 'finished',
                      url: params.row.image
                    }]
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确定通过删除吗？',
                      onOk: () => {
                        this.delTool({ id: params.row.id })
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getShopCate()
    this.getDataList()
    this.getQiniu()
  },
  methods: {
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.formData.image) {
            this.$Modal.error({
              title: '请上传图片'
            })
            return
          }
          if (this.mode === 'add') this.addShopTool()
          else this.editShopTool()
        }
      })
    },
    handleAdd () {
      this.mode = 'add'
      this.visible = true
    },
    handleCancel () {
      this.visible = false
    },
    handleFormatError (file) {
      this.$Modal.error({
        title: '文件格式不正确',
        content: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleRemoveImg () {
      this.uploadList = []
      this.formData.image = ''
    },
    handleBeforeUpload () {
      this.uploadList = []
    },
    handleImgSuccess (response) {
      const imgUrl = baseImgUrl + response.key
      this.uploadList.push({
        status: 'finished',
        url: imgUrl
      })
      this.formData.image = imgUrl
    },
    modalVisibleChange (visible) {
      if (visible) {
        this.getToolCheckCode()
        if(this.mode === 'add') {
          this.formData.cate_id = this.shopCate[0].id
        }
      } else {
        this.$refs.form.resetFields()
        this.uploadList = []
      }
    },
    // 获取七牛token
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 获取校验码
    getToolCheckCode () {
      getToolCheckCode().then(res => {
        if (res.data.code === 200) {
          this.checkcode = res.data.data.checkcode
        }
      })
    },
    // 道具列表
    getDataList () {
      const data = {
        ...this.pageParams,
        ...this.searchParams
      }
      getToolList(data).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data
          this.total = res.data.data.total
        }
      })
    },
    // 添加道具
    addShopTool () {
      const data = {
        checkcode: this.checkcode,
        ...this.formData
      }
      addShopTool(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('添加成功')
          this.visible = false
          this.getDataList()
        }
      })
    },
    // 编辑道具
    editShopTool () {
      const data = {
        checkcode: this.checkcode,
        ...this.formData
      }
      editShopTool(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('编辑成功')
          this.visible = false
          this.getDataList()
        }
      })
    },
    // 删除道具
    delTool (data) {
      delTool(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.pageParams.page = 1
          this.getDataList()
        }
      })
    },
    // 商品类型
    getShopCate () {
      getShopCate().then(res => {
        if (res.data.code === 200) {
          this.shopCate = res.data.data
          const options = res.data.data.map(item => {
            return {
              label: item.name,
              value: item.id
            }
          })
          options.unshift({
            label: '全部',
            value: -1
          })
          this.searchForm.components[0].options = options
        }
      })
    },
    // 道具上/下架
    updateToolStatus (item) {
      const data = {
        id: item.id,
        type: item.status === 1 ? 2 : 1
      }
      updateToolStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('操作成功')
          this.getDataList()
        }
      })
    },
    // 页码改变
    handlePageChange (page) {
      this.pageParams.page = page
      this.getDataList()
    },
    // size改变
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.getDataList()
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
