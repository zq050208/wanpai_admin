<template>
  <div>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
    <Card>
      <p slot="title">派对审核</p>
      <Table
        v-if="searchParams.status === 1"
        ref="table"
        border
        :columns="columns"
        :data="tableData"
        @on-selection-change="handleSelectChange"
      />
      <Table
        v-if="searchParams.status === 2"
        ref="table"
        border
        :columns="columns1"
        :data="tableData"
      />

      <Row v-if="searchParams.status === 1" style="margin-top: 20px">
        <Col :span="3">
          <!-- <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll"></Checkbox> -->
          <Button size="small" @click="handleSelectAll">{{ ifSelectAll ? '取消批量操作' : '批量操作' }}</Button>
        </Col>
        <Col :span="10">
          <Button v-if="ifSelectAll" size="small" type="error" style="margin-right: 16px" @click="handleOperate(0)">拒绝</Button>
          <Button v-if="ifSelectAll" size="small" type="primary" @click="handleOperate(1)">通过</Button>
        </Col>
      </Row>
        
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="total" 
        :current="pageParams.page"
        :page-size="pageParams.per_page"
        @on-change="pageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>
   
    <Modal title="派对详情" v-model="detailVisible" width="625">
      <Form label-colon>
        <FormItem label="所属圈子">
          <span>{{ getCircleType(currentParty.circle_type) }}</span>
        </FormItem>
        <FormItem label="派对名称">
          <span>{{ currentParty.name }}</span>
        </FormItem>
        <FormItem label="派对ID">
          <span>{{ currentParty.party_no }}</span>
        </FormItem>
        <FormItem label="派对标签">
          <Tag size="large" v-for="(tag, index) in currentParty.tag_name" :key="index">{{ tag }}</Tag>
        </FormItem>
        <FormItem label="设置派对封面">
          <img style="width: 40%" :src="currentParty.party_img" />
        </FormItem>
        <FormItem label="设置派对背景">
          <img style="width: 40%" :src="currentParty.party_backgroud" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="detailVisible = false">关闭</Button>
      </div>
    </Modal>

    <Modal title="审核" v-model="checkVisible" @on-visible-change="checkVisibleChange">
      <Form ref="checkForm" label-colon :model="checkFormData" :rules="rules">
        <FormItem label="审核结果" required>
          <span>不通过</span>
        </FormItem>
        <FormItem label="选择原因" prop="refuse_reason" required>
          <RadioGroup v-model="checkFormData.refuse_reason" vertical>
            <Radio :label="1">色情相关</Radio>
            <Radio :label="2">政治敏感</Radio>
            <Radio :label="3">违法乱纪</Radio>
        </RadioGroup>
        </FormItem>
        
        <FormItem label="请输入备注（非必填）" prop="refuse_mark">
          <Input v-model="checkFormData.refuse_mark" type="textarea" :rows="5" :maxlength="300" show-word-limit />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="handleCheckSubmit">提交</Button>
      </div>
    </Modal>

    <Modal title="拒绝原因" v-model="refuseVisible">
      <p>{{ currentParty.refuse_reason }} {{ currentParty.refuse_mark }}</p>
    </Modal>
  </div>
</template>

<script>
import { partyAuditList, partyAuditApply, batchCheck, batchRefuse } from '@/api/data'
import SearchForm from '@/components/searchForm'

export default {
  name: 'audit',
  components: {
    SearchForm
  },
  data () {
    return {
      selected: [],
      ifSelectAll: false,

      total: 0,
      tableData: [],
      pageParams: {
        page: 1,
        per_page: 10
      },
      rules: {
        refuse_reason: { required: true, message: '请选择拒绝原因' }
      },

      currentParty: {},
      detailVisible: false,

      refuseVisible: false,

      checkVisible: false,
      checkFormData: {
        refuse_reason: '',
        refuse_mark: ''
      },

      searchData: {
        status: 1,
        key_word: '',
        date: ''
      },
      searchParams: {
        status: 1,
        key_word: '',
        date: ''
      },
      searchForm: {
        actions: [
          {
            text: '搜索',
            type: 'primary',
            handle: () => {
              this.pageParams.page = 1
              this.searchParams = {
                ...this.searchData,
                start_time: this.searchData.date[0] || '',
                end_time: this.searchData.date[1] || ''
              }
              delete this.searchParams.date
              this.partyAuditList()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            prop: 'status',
            options: [
              {
                label: '待审核',
                value: 1
              },
              {
                label: '已审核',
                value: 2
              }
            ]
          },
          {
            name: 'Input',
            prop: 'key_word',
            placeholder: '搜索派对ID或名称',
            label: '查询内容：'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '选择日期：',
            showLeft: false
          }
        ]
      },
      columns: [
        {
          type: 'selection',
          width: 60
        },
        {
          align: 'center',
          title: '派对ID',
          key: 'party_no'
        },
        {
          align: 'center',
          title: '派对名称',
          key: 'name'
        },
        {
          align: 'center',
          title: '派对封面',
          key: 'party_img',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.party_img },
                style: { width: '50px', height: '50px', margin: '0 auto', display: params.row.party_img ? 'block' : 'none' }
              })
            ])
          }
        },
        {
          align: 'center',
          title: '派对管理',
          key: 'user_id',
          render: (h, params) => {
            return h('div', [
                    h('div', params.row.controller_name),
                    h('div', params.row.user_id)
                  ])
          }
        },
        {
          align: 'center',
          title: '派对详情',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.party_img = params.row.party_img
                    this.party_backgroud = params.row.party_backgroud
                    this.tags = params.row.tag_name

                    this.detailVisible = true
                    this.currentParty = {...params.row}
                  }
                }
              }, '查看详情')
            ])
          }
        },
        {
          align: 'center',
          title: '创建时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'default', size: 'small' },
                style: { marginRight: '8px' },
                on: {
                  click: () => {
                    this.checkVisible = true
                    this.currentParty = {...params.row}
                  }
                }
              }, '拒绝'),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '该操作将通过审核',
                      onOk: () => {
                        this.currentParty = {...params.row}
                        this.partyAuditApply(2)
                      }
                    })
                  }
                }
              }, '通过')
            ])
          }
        }
      ],
      columns1: [
        {
          align: 'center',
          title: '派对ID',
          key: 'party_no'
        },
        {
          align: 'center',
          title: '派对名称',
          key: 'name'
        },
        {
          align: 'center',
          title: '派对封面',
          key: 'party_img',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.party_img },
                style: { width: '50px', height: '50px', margin: '0 auto', display: params.row.party_img ? 'block' : 'none' }
              })
            ])
          }
        },
        {
          align: 'center',
          title: '派对管理',
          key: 'user_id',
          render: (h, params) => {
            return h('div', [
                    h('div', params.row.controller_name),
                    h('div', params.row.user_id)
                  ])
          }
        },
        {
          align: 'center',
          title: '派对详情',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.party_img = params.row.party_img
                    this.party_backgroud = params.row.party_backgroud
                    this.tags = params.row.tag_name

                    this.detailVisible = true
                    this.currentParty = {...params.row}
                  }
                }
              }, '查看详情')
            ])
          }
        },
        {
          align: 'center',
          title: '创建时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '审核结果',
          render: (h, params) => {
            let status = ''
            if(params.row.status === 1) {
              status = '审核中'
              return h('div', {}, status)
            } else if(params.row.status === 2) {
              status = '通过'
              return h('div', {}, status)
            } else {
              status = '已拒绝'
              return h('div', [
                h('Button', {
                  style: { color: 'red' },
                  props: { type: 'default', size: 'small' },
                  on: {
                    click: () => {
                      this.currentParty = {...params.row}
                      this.refuseVisible = true
                    }
                  }
                }, status)
              ])
            }
          }
        }
      ]
    }
  },
  mounted () {
    this.partyAuditList()
  },
  methods: {
    handleCheckSubmit() {
      this.$refs.checkForm.validate(valid => {
        if(valid) {
          if(this.ifSelectAll) {
            this.batchRefuse()
          } else {
            this.partyAuditApply(3)
          }
        }
      })
    },
    partyAuditList() {
      const data = {
        ...this.searchParams,
        ...this.pageParams
      }
      partyAuditList(data)
        .then(res => {
          if(res.data.code === 200) {
            this.total = res.data.data.total
            this.tableData = res.data.data.data
          }
        })
    },
    checkVisibleChange(visible) {
      if(!visible) {
        this.$refs.checkForm.resetFields()
      }
    },
    handleOperate(type) {
      if(type === 1) {
        this.$Modal.confirm({
          title: '确定要通过选中的全部派对吗？',
          onOk: () => {
            this.batchCheck({ ids: JSON.stringify(this.selected.map(i => i.id)) })
          }
        })
      } else {
        this.checkVisible = true
      }
    },
    handleSelectAll () {
      if(this.ifSelectAll) this.ifSelectAll = false
      else this.ifSelectAll = true
      this.$refs.table.selectAll(this.ifSelectAll)
    },
    handleSelectChange (selected) {
      this.selected = selected
      if (selected.length > 0) this.ifSelectAll = true
      else this.ifSelectAll = false
      // if (selected.length === this.tableData.length) this.ifSelectAll = true
      // else this.ifSelectAll = false
    },
    getCircleType(type) {
      switch (type) {
        case 1:
          return '游戏'
          break;
        case 2:
          return '娱乐'
          break;
        case 3:
          return '西皮'
          break;
        case 4:
          return '龙门阵'
          break;
        default:
          return ''
          break;
      }
    },
    pageChange (e) { // 分页切换
      this.pageParams.page = e
      this.partyAuditList()
      this.ifSelectAll = false
      this.selected = []
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.partyAuditList()
      this.ifSelectAll = false
      this.selected = []
    },
    batchRefuse() {
      const data = {
        ...this.checkFormData,
        ids: JSON.stringify(this.selected.map(i => i.id))
      }
      batchRefuse(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('操作成功!')
          this.checkVisible = false
          this.partyAuditList()
          this.ifSelectAll = false
          this.pageParams.page = 1
        }
      })
    },
    batchCheck(data) { // 批量审核申请
      batchCheck(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('操作成功!')
          this.partyAuditList()
          this.ifSelectAll = false
          this.pageParams.page = 1
        }
      })
    },
    partyAuditApply (status) { // 审核申请
    // 3拒绝 2通过
      let data = {
        status,
        id: this.currentParty.id,
      }
      if(status === 3) {
        data = {
          ...data,
          ...this.checkFormData
        }
      }
      partyAuditApply(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('操作成功!')
          this.pageParams.page = 1
          this.partyAuditList()
          if(status === 3) {
            this.checkVisible = false
          }
        }
      })
    }
  }
}
</script>

<style>
  .page{
    margin-top: 20px;
    text-align: center;
  }
</style>
