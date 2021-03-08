<template>
    <div>
      <Card>
        <SearchForm title="筛选数据" :searchForm="searchForm" :searchData="searchData" />
      </Card>
      <Form inline style="padding: 20px 0">
        <FormItem>
          <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll">全选</Checkbox>
        </FormItem>
        <FormItem>
          <Button @click="handleDeleteAll" :disabled="selected.length === 0">批量通过</Button>
        </FormItem>
    </Form>
    <Table border ref="selection" :columns="columns" :data="tableData" @on-selection-change="handleSelectChange"></Table>
     <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
     <!-- 未通过弹窗 -->
     <Modal v-model="noPassModal" :mask-closable="false" @on-cancel="resetForm">
      <p slot="header" style="text-align:center">审核未通过</p>
      <Form ref='noPassData' :model="noPassData" :rules="rules">
        <FormItem label="未通过原因：" prop="prohibit_reason">
          <Select style="width: 280px" v-model='noPassData.prohibit_reason'>
            <Option :value="item.id" v-for="item in prohibit_reason" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <div style="margin-bottom: 20px"><span style="margin-right:10px">封禁该用户</span> <span>{{`“${nickName}”`}}</span></div>
        <p style="color:#cccccf; padding-bottom:10px">可不填，则默认不封禁该用户</p>
        <FormItem label="封禁类型：" prop="prohibit_type">
          <Select style="width: 280px"  v-model='noPassData.prohibit_type'>
            <Option :value="item.id" v-for="item in prohibit_type" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁时长：" prop="prohibit_hour" >
          <Input v-model="noPassData.prohibit_hour" style="width:200px" type="number" /> 小时
        </FormItem>
      </Form>
        <div slot="footer">
            <Button type="default" size="default" @click="concleClick">取消</Button>
            <Button type="primary" size="default" @click="confirmSubmit('noPassData')">确定</Button>
        </div>
     </Modal>
    </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { operationImageList, imageListCheckcode, rejectImageApply, passImageApply } from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    return {
      ifSelectAll: false,
      noPassModal: false,
      selected: [],
      tableData: [],
      prohibit_reason: [],
      prohibit_type: [],
      noPassData: {
        prohibit_reason: null
      },
      checkcode: '',
      nickName: '',
      total: 1,
      current: 1,
      per_page: 10,
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = { ...this.searchData }
              this.current = 1
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            label: '应用名称：',
            prop: 'app_id',
            options: [
              {
                label: '小虎Hoo',
                value: 1
              },
              {
                label: '小程序-分子派对',
                value: 2
              }
            ]
          },
          {
            name: 'Select',
            label: '图片类型：',
            prop: 'type',
            placeholder: '请选择图片类型',
            options: [
              {
                label: '个人头像',
                value: '1'
              },
              {
                label: '主页背景',
                value: '2'
              }
            ]
          },
          {
            name: 'Input',
            label: '上传用户：',
            prop: 'nickname',
            placeholder: '请输入用户昵称'
          }
        ]
      },
      searchParams: {
        app_id: 1,
        type: '',
        nickname: ''
      },
      searchData: {
        app_id: 1,
        type: '',
        nickname: ''
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '图片',
          key: 'avatar',
          align: 'center',
          render: (h, params) => {
            return h('viewer',
              {
                props: { images: [{ img: params.row.avatar ? params.row.avatar : 'http://cdn.tinytiger.cn/user/user2.jpg' }] },
                style: { width: '100px', height: '100px',  margin: '0 auto' }
              },
              [
                h('img', {
                  attrs: { src: params.row.avatar ? params.row.avatar : 'http://cdn.tinytiger.cn/user/user2.jpg' },
                  style: { width: '100px', height: '100px',  margin: '0 auto' }
                })
              ])
          }
        },
        {
          title: '应用名称',
          key: 'app_id',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.app_id === 1 ? '小虎Hoo' : '小程序-分子派对')
          }
        },
        {
          title: '图片类型',
          key: 'type',
          align: 'center',
          render: (h, params) => {
            if (params.row.type === 1) return h('div', {}, '头像')
            else return h('div', {}, '背景图')
          }
        },
        {
          title: '上传用户',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '上传时间',
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
                props: { type: 'primary', size: 'small' },
                style: { margin: '0px 20px 0px 0px' },
                on: {
                  click: () => {
                    this.getCheckout(params.row.app_id)
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确定通过 ' + '“' + params.row.nickname + '”' + ' 吗？',
                      onOk: () => {
                        this.passInmage([params.row.id])
                      }
                    })
                  }
                }
              }, '通过'),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.getCheckout(params.row.app_id)
                    this.nickName = params.row.nickname
                    this.noPassClick(params.row.id)
                  }
                }
              }, '不通过')
            ])
          }
        }
      ],
      rules: {
        prohibit_reason: [{ required: true, message: '请选择封禁原因' }]
      }
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    // 获取数据
    getDataList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      operationImageList(obj).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
        }
      })
    },
    // 获取校验码
    getCheckout (ids) {
      imageListCheckcode({ app_id: ids }).then(res => {
        if (res.data.code === 200) {
          this.checkcode = res.data.data.checkcode
          this.noPassData.checkcode = res.data.data.checkcode
          this.prohibit_reason = res.data.data.prohibit_reason
          this.prohibit_type = res.data.data.prohibit_type
        }
      })
    },
    // 不通过弹窗
    noPassClick (ids) {
      this.noPassModal = true
      this.noPassData.id = ids
    },
    // 审核未通过
    confirmSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.noPassData.prohibit_type && !this.noPassData.prohibit_hour) {
            this.$Message.error('请输入封禁时长！')
          } else if (this.noPassData.prohibit_hour && !this.noPassData.prohibit_type) {
            this.$Message.error('请选择封禁类型！')
          } else {
            rejectImageApply(this.noPassData).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('提交成功')
                this.noPassModal = false
                this.resetForm()
                this.current = 1
                this.getDataList()
              }
            })
          }
        }
      })
    },
    // 取消事件
    concleClick () {
      this.noPassModal = false
      this.resetForm()
    },
    // 通过事件
    passInmage (id) {
      let imgIds
      if (id) {
        imgIds = id
      } else {
        imgIds = this.selected.map(item => (item.id))
      }
      var obj = {
        checkcode: this.checkcode,
        ids: JSON.stringify(imgIds)
      }
      passImageApply(obj).then(res => {
        if (res.data.code === 200) {
          if (this.ifSelectAll) {
            this.ifSelectAll = false
          }
          this.$Message.success('通过成功')
          this.current = 1
          this.getDataList()
        }
      })
    },
    // 重置表单
    resetForm () { this.$refs.noPassData.resetFields() },
    //  全选
    handleSelectAll () {
      this.$refs.selection.selectAll(this.ifSelectAll)
    },
    // 批量通过
    handleDeleteAll () {
      this.getCheckout(this.searchParams.app_id)
      this.$Modal.confirm({
        title: '确定要批量通过选中的全部内容吗?',
        onOk: () => {
          this.passInmage()
        }
      })
    },
    // 选择框改变
    handleSelectChange (selected) {
      this.selected = selected
      if (selected.length === this.tableData.length) {
        this.ifSelectAll = true
      } else {
        this.ifSelectAll = false
      }
    },
    // 页码改变
    handlePageChange (page) {
      this.ifSelectAll = false
      this.current = page
      this.getDataList()
    },
    // size改变
    handlePageSizeChange (size) {
      this.per_page = size
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
