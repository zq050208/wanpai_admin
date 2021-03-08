<template>
  <div>
    <Button style="margin-bottom: 24px" type="primary" @click="addModal = true">添加派对</Button>
    <Card>
      <Form inline>
        <FormItem>
          <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll">全选</Checkbox>
        </FormItem>
        <FormItem>
          <Button @click="handleDeleteAll" :disabled="selected.length === 0">批量删除</Button>
        </FormItem>
        <FormItem>
          <Button @click="dateModal = true">设置日期</Button>
        </FormItem>
      </Form>
      <Table
        border
        ref="table"
        :columns="columns"
        :data="tableData"
        @on-selection-change="handleSelectChange"
      />

      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :total="total"
        :current="current"
        :page-size="per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>
    <Modal v-model="addModal" :title="'新增派对'" :mask-closable="false">
      <Form ref="partyForm" :model="partyFormData"　:rules="partyRules" :label-width="120">
        <FormItem label="派对ID：" prop="party_no">
          <Input placeholder="请输入派对ID" v-model="partyFormData.party_no" />
          <div>输入多个请用,隔开</div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="addModal = false">取消</Button>
        <Button type="primary" size="default" @click="handleAddPartySubmit">确定</Button>
      </div>
    </Modal>

    <Modal v-model="dateModal" :title="'设置日期'" :mask-closable="false">
      <Form ref="dateForm" :model="dateFormData"　:rules="dateRules" :label-width="120">
        <FormItem label="开始时间：" prop="start_time">
          <DatePicker :value="dateFormData.start_time" @on-change="handleStartDateChange" format="yyyy-MM-dd HH:mm" type="datetime" placeholder="选择开始时间" style="width: 200px"></DatePicker>
        </FormItem>
        <FormItem label="结束时间：" prop="end_time">
          <DatePicker :value="dateFormData.end_time" @on-change="handleEndDateChange" format="yyyy-MM-dd HH:mm" type="datetime" placeholder="选择结束时间" style="width: 200px"></DatePicker>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="dateModal = false">取消</Button>
        <Button type="primary" size="default" @click="handleEditDateSubmit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { getPartySuperPopularity, addPartySuperPopularity, delPartySuperPopularity, getPartySuperPopularityTime, editPartySuperPopularityTime } from '@/api/data'

export default {
  data () {
    return {
      selected: [],
      ifSelectAll: false,
      addModal: false,
      dateModal: false,
      total: 1,
      current: 1,
      per_page: 10,
      partyFormData: {
        party_no: ''
      },
      dateFormData: {
        start_time: '',
        end_time: ''
      },
      partyRules: {
        party_no: { required: true, message: '请输入派对ID' }
      },
      dateRules: {
        start_time: { required: true, message: '请输入开始时间' },
        end_time: { required: true, message: '请输入结束时间' },
      },
      tableData: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '派对编号',
          key: 'party_no',
          align: 'center'
        },
        {
          title: '创建时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '派对名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确认删除吗？',
                      onOk: () => {
                        this.delPartySuperPopularity({ids: JSON.stringify([params.row.id])})
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
    this.getPartySuperPopularity()
    this.getPartySuperPopularityTime()
  },
  methods: {
    handleAddPartySubmit () {
      this.$refs.partyForm.validate(valid => {
        if (valid) {
          this.addPartySuperPopularity()
        }
      })
    },
    handleEditDateSubmit () {
      this.$refs.dateForm.validate(valid => {
        if (valid) {
          this.editPartySuperPopularityTime()
        }
      })
    },
    handleStartDateChange(date) {
      this.dateFormData.start_time = date
    },
    handleEndDateChange(date) {
      this.dateFormData.end_time = date
    },
    handleSelectAll () {
      this.$refs.table.selectAll(this.ifSelectAll)
    },
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要删除选中的全部内容吗？',
        onOk: () => {
          this.delPartySuperPopularity({
            ids: JSON.stringify(this.selected.map(i => i.id))
          })
        }
      })
    },
    handleSelectChange (selected) {
      this.selected = selected
      if (selected.length === this.tableData.length) {
        this.ifSelectAll = true
      } else {
        this.ifSelectAll = false
      }
    },
    editPartySuperPopularityTime() {
      editPartySuperPopularityTime({...this.dateFormData}).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('修改日期成功')
          this.getPartySuperPopularityTime()
          this.dateModal = false
        }
      })
    },
    getPartySuperPopularityTime() {
      getPartySuperPopularityTime().then(res => {
        if(res.data.code === 200) {
          this.dateFormData.start_time = res.data.data.start_time
          this.dateFormData.end_time = res.data.data.end_time
        }
      })
    },
    addPartySuperPopularity () {
      const data = {
        party_no: JSON.stringify(this.partyFormData.party_no.split(','))
      }
      addPartySuperPopularity(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('添加成功')
          this.getPartySuperPopularity()
          this.addModal = false
        }
      })
    },
    delPartySuperPopularity (data) {
      delPartySuperPopularity(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.getPartySuperPopularity()
          this.ifSelectAll = false
        }
      })
    },
    getPartySuperPopularity () {
      var obj = {
        page: this.current,
        per_page: this.per_page
      }
      getPartySuperPopularity(obj).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.per_page = 10
      this.getPartySuperPopularity()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.current = 1
      this.getPartySuperPopularity()
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
