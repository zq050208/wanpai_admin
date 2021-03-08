<template>
  <div>
		<Button type="primary" style="margin-bottom: 8px;"  @click="addPlanClick">添加计划</Button>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
    />
    <Modal v-model="addPlanModal" width="600" :title="title" footer-hide>
      <Form :model="formData" ref="formData" label-position="left" :label-width="100">
        <FormItem label="选择资源位" prop="number">
          <Select v-model="formData.number" style="width:240px" filterable @on-change="submitStatus = false">
            <Option v-for="item in dailyNumberList" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem label="选择游戏" prop="game_name">
          <Input v-model="formData.game_name" enter-button search placeholder="请输入游戏名称、游戏id" @on-search="searchGameList" style="width: 240px" />
          <div class="search_result" v-show="showSearchResult">
            <p v-show="searchedGameList.length > 0" v-for="(item, index) in searchedGameList" :key="index" @click="checkedGame(item)">{{item.name}}</p>
            <p v-show="searchedGameList.length === 0">暂无数据</p>
          </div>
        </FormItem>
        <FormItem label="设置计划时间">
          <Row>
            <Col span="8">
                <FormItem prop="startTime">
                    <DatePicker type="datetime" placeholder="开始时间" :options="optionsSt" v-model="formData.startTime" :disabled="formData.isLong" @on-ok="submitStatus = false"></DatePicker>
                </FormItem>
            </Col>
            <Col span="2" style="text-align: center">到</Col>
            <Col span="8">
                <FormItem prop="endTime">
                    <DatePicker type="datetime" placeholder="结束时间" :options="optionsSt" v-model="formData.endTime" :disabled="formData.isLong" @on-ok="submitStatus = false"></DatePicker>
                </FormItem>
            </Col>
            <Col span="5">
                <FormItem prop="isLong">
                    <Checkbox v-model="formData.isLong" style="margin-left: 8px;" @on-change="checkedIsLong">长期</Checkbox>
                </FormItem>
            </Col>
          </Row>
      </FormItem>
      </Form>
      <Button type="primary"  style="margin-left: 104px;" @click="handleSubmit('formData')" :disabled="submitStatus" :loading="submitLoadingStatus">提交</Button>
    </Modal>
    <Modal v-model="recommendPlanModal" width="600" :title="planTitle" footer-hide>
      <Table
        border
        stripe
        :data="planTableData"
        :columns="planColumns"
        max-height="400"
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
    </Modal>
  </div>
</template>

<script>
import { formateDate } from '@/directive/tool.js'
import { dailyRecommendList, getRecommend, searchGameList, getDailyNumber, dailyPlan, addDailyRecommend, saveDailyRecommend, deleteDaily } from '@/api/data'
export default {
  components: {},
  data () {
    return {
      title: '每日推荐-3的计划',
      planTitle: '',
      addPlanModal: false, // 添加计划弹窗
      recommendPlanModal: false, // 查看计划
      isEdit: false, // 添加或修改状态
      submitStatus: false, // 提交按钮状态
      submitLoadingStatus: false, // 提交按钮loading状态
      tableData: [],
      planTableData: [],
      searchedGameList: [], // 游戏名称列表
      dailyNumberList: [], // 每日推荐资源位编号
      showSearchResult: false,
      number: 0, // 查看计划需要的number
      optionsSt: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      },
      formData: {
        game_name: '',
        game_id: '',
        number: 1,
        startTime: '',
        endTime: '',
        isLong: false
      },
      addFormData: {
        game_name: '',
        game_id: '',
        number: 1,
        startTime: '',
        endTime: '',
        isLong: false
      },
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      columns: [
        {
          align: 'center',
          title: '编号',
          key: 'number'
        },
        {
          align: 'center',
          title: '游戏名称',
          render: (h, params) => {
            return h('div', [
              params.row.is_click === 0 ? h('span', {}, '') : h('span', {}, params.row.game_name)
            ])
          }
        },
        {
          align: 'center',
          title: '展示计划',
          render: (h, params) => {
            return h('div', [
              params.row.is_click === 1 && h('div', [
                params.row.show_plan === 1 ? h('span',
                  {}, '长期计划')
                  : [h('span', {}, params.row.start_time + '到'), h('span', {}, params.row.end_time)]
              ]),
              params.row.is_click === 0 && h('div', {}, ' 线上无计划')
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
                    disabled: params.row.is_click === 0,
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.getPlanDetail(params.row.number)
                    }
                  }
                },
                '查看计划'
              )
            ])
          }
        }
      ],
      planColumns: [
        {
          align: 'center',
          title: '序号',
          key: 'id'
        },
        {
          align: 'center',
          title: '游戏名称',
          key: 'name'
        },
        {
          align: 'center',
          title: '时间段',
          render: (h, params) => {
            return h('div', [
              params.row.show_plan === 1 ? h('span',
                {}, '长期计划')
                : [h('span', {}, params.row.start_time + '到'), h('span', {}, params.row.end_time)]
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
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    'margin-right': '8px'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认要删除此分类吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.deleteDaily(params.row.id)
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
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.isEdit = true
                      this.getDailyNumber()
                      this.editListData(params.row)
                    }
                  }
                },
                '修改'
              )
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getInitDataList()
  },
  methods: {
    // 每日推荐数据
    getInitDataList () {
      dailyRecommendList().then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data
        }
      })
    },
    getDailyNumber () {
      getDailyNumber().then(res => {
        if (res.data.code === 200) {
          this.dailyNumberList = res.data.data.number
        }
      })
    },
    // 查看计划
    getPlanDetail (number) {
      this.number = number
      this.recommendPlanModal = true
      this.planTitle = '每日推荐-' + number + '的计划'
      let paramData = {
        number: number,
        page: this.pageParams.page,
        per_page: this.pageParams.per_page
      }
      dailyPlan(paramData).then(res => {
        if (res.data.code === 200) {
          this.planTableData = res.data.data.data
          this.pageParams.page = res.data.data.current_page
          this.pageParams.per_page = res.data.data.per_page
          this.pageParams.total = res.data.data.total
        }
      })
    },
    checkedIsLong () {
      this.submitStatus = false
    },
    // 修改
    editListData (paramsData) {
      this.title = '修改计划'
      this.addPlanModal = true
      this.isEdit = true
      this.submitStatus = true
      this.showSearchResult = false
      this.submitLoadingStatus = false
      getRecommend({ id: paramsData.id, resource_type: 1 }).then(res => {
        if (res.data.code === 200) {
          let tempData = res.data.data
          this.formData.game_name = tempData.name
          this.formData.game_id = tempData.objid
          this.formData.number = tempData.number
          this.editId = tempData.id
          if (tempData.show_plan === 1) {
            this.formData.isLong = true
            this.formData.startTime = ''
            this.formData.endTime = ''
          } else {
            this.formData.isLong = false
            this.formData.startTime = tempData.start_time
            this.formData.endTime = tempData.end_time
          }
        }
      })
    },
    // 删除每日推荐
    deleteDaily (id) {
      deleteDaily({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          if (this.planTableData.length === 1 && this.pageParams.page > 1) {
            this.pageParams.page--
          }
          this.getPlanDetail(this.number)
          this.getInitDataList()
        }
      })
    },
    searchGameList (value) {
      if (!value) return this.$Message.warning('请输入游戏名称或者id')
      searchGameList({ keyword: value, resource_type: 1 }).then(res => {
        if (res.data.code === 200) {
          this.showSearchResult = true
          this.searchedGameList = res.data.data
        }
      }).catch(err => {
        this.searchedGameList = []
      })
    },
    // 添加计划
    addPlanClick () {
      this.addPlanModal = true
      this.isEdit = false
      this.submitStatus = true
      this.showSearchResult = false
      this.submitLoadingStatus = false
      this.title = '添加计划'
      this.formData = { ...this.addFormData }
      this.getDailyNumber()
    },
    checkedGame (item) {
      this.formData.game_name = item.name
      this.formData.game_id = item.id
      this.showSearchResult = false
      this.submitStatus = false
    },
    handleSubmit (name) {
      const { game_id, game_name, number, startTime, endTime, isLong } = this.formData
      if (!game_name) return this.$Message.warning('请输入游戏名称或者id')
      if (!isLong && !startTime && !endTime) return this.$Message.warning('请设置时间计划')
      let st, et, is_long
      if (startTime) st = formateDate(startTime)
      if (endTime) et = formateDate(endTime)
      is_long = isLong ? 1 : 0
      if (!is_long && (!startTime || !endTime)) return this.$Message.warning('请填写开始时间和结束时间')
      if (startTime && endTime && new Date(endTime).getTime() < new Date(startTime).getTime()) {
        return this.$Message.warning('结束时间不能小于开始时间')
      }
      this.submitLoadingStatus = true
      let paramData = {
        game_id: game_id,
        number: number,
        start_time: is_long ? '' : st,
        end_time: is_long ? '' : et,
        is_long: is_long
      }
      if (this.isEdit) {
        paramData.id = this.editId
        saveDailyRecommend(paramData).then(res => {
          this.submitLoadingStatus = false
          if (res.data.code === 200) {
            this.$Message.success('修改成功')
            this.addPlanModal = false
            this.recommendPlanModal = false
            this.getInitDataList()
          }
        })
      } else {
        addDailyRecommend(paramData).then(res => {
          this.submitLoadingStatus = false
          if (res.data.code === 200) {
            this.$Message.success('添加成功')
            this.addPlanModal = false
            this.getInitDataList()
          }
        })
      }
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.getPlanDetail(this.number)
    },
    handlePageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.getPlanDetail(this.number)
    }
  }
}
</script>

<style lang="less" scoped>
  .page{
    margin-top: 20px;
    text-align: center;
  }
  .search_result{
    width: 240px;
    max-height: 300px;
    margin-top: 10px;
    // overflow-y: scroll;
    padding-left: 10px;
    border: 1px solid #eeeeee;
    p{
      height: 25px;
      line-height: 25px;
      border-bottom: 1px solid #eeeeee;
    }
  }
</style>
