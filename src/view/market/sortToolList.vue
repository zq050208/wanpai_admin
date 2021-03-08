<template>
<div>
    <Button style="margin-bottom: 20px" type="primary" @click="addClick">添加分类</Button>
    <Card>
      <Table
      border
      ref="table"
      :data="tableData"
      :columns="columns"
    />
    <Page
      class="page"
      show-total
      show-sizer
      show-elevator
      :total="total"
      :current="currentPage"
      :page-size="per_page"
      :page-size-opts="[10, 20, 30, 50]"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
    </Card>
    <Modal v-model="isShowModal" :title="mode === 'add' ? '添加道具分类' : '编辑道具分类'" :mask-closable="false" @on-cancel="cancleClick">
      <Form ref="formInline" :model="formInline" :label-width="120" :rules="ruleInline">
        <FormItem label="商品类型:" prop="name">
          <Input v-model="formInline.name" placeholder="请输入商品类型" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="default" @click="cancleClick" >取消</Button>
        <Button type="primary"  @click="confirmClick('formInline')">发布</Button>
      </div>
    </Modal>
</div>
</template>
<script>
import { getShopToolCateList, getShopCheckCode, addShopToolCate, editShopToolCate, delShopToolCate } from '@/api/data'
export default {
  data () {
    return {
      tableData: [],
      total: 1,
      currentPage: 1,
      per_page: 10,
      isShowModal: false,
      mode: '',
      formInline: {
        name: ''
      },
      columns: [
        {
          title: '道具分类',
          key: 'name',
          align: 'center'
        },
        {
          title: '分类下道具数量',
          key: 'num',
          align: 'center'
        },
        {
          title: '销售量',
          key: 'sale_num',
          align: 'center'
        },
        {
          title: '创建时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary' },
                style: { margin: '0px 20px 0px 0px' },
                on: {
                  click: () => {
                    this.amendCate(params.row.id, params.row.name)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'error' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确认删除吗？',
                      onOk: () => {
                        if (params.row.is_deleted === 0) this.deletClick(params.row.id)
                      }
                    })
                  }
                }
              }, params.row.is_deleted === 0 ? '删除' : '已删除')
            ])
          }
        }
      ],
      ruleInline: {
        name: [{ required: true, message: '请输入商品类型' }]
      }
    }
  },
  mounted () { this.getDataList() },
  methods: {
    getDataList () {
      var data = {
        page: this.currentPage,
        per_page: this.per_page
      }
      getShopToolCateList(data).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data
          this.total = res.data.data.total
          this.currentPage = res.data.data.current_page
        }
      })
    },
    addClick () {
      this.isShowModal = true
      this.mode = 'add'
      this.formInline.name = ''
    },
    // 获取校验码
    getCode () {
      return new Promise((resolve, reject) => {
        getShopCheckCode()
          .then(res => {
            if (res.data.code === 200) {
              resolve(res.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 编辑
    amendCate (id, name) {
      this.isShowModal = true
      this.mode = 'amend'
      this.formInline.id = id
      this.formInline.name = name
    },
    // 删除
    deletClick (ids) {
      this.getCode().then(res => {
        var data = {
          id: ids,
          checkcode: res.data.checkcode
        }
        delShopToolCate(data).then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            this.getDataList()
          }
        })
      })
    },
    // 发布事件
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.getCode().then(res => {
            if (this.mode === 'add') {
              var data = {
                checkcode: res.data.checkcode,
                name: this.formInline.name
              }
              addShopToolCate(data).then(res => {
                if (res.data.code === 200) {
                  this.$Message.success('添加成功')
                  this.isShowModal = false
                  this.getDataList()
                  this.$refs.formInline.resetFields()
                }
              })
            } else {
              var obj = {
                checkcode: res.data.checkcode,
                name: this.formInline.name,
                id: this.formInline.id
              }
              editShopToolCate(obj).then(res => {
                if (res.data.code === 200) {
                  this.$Message.success('编辑成功')
                  this.isShowModal = false
                  this.getDataList()
                  this.$refs.formInline.resetFields()
                }
              })
            }
          })
        }
      })
    },
    // 取消事件
    cancleClick () {
      this.isShowModal = false
      this.$refs.formInline.resetFields()
    },
    handlePageChange (page) {
      this.currentPage = page
      this.getDataList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.currentPage = 1
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
</style>
