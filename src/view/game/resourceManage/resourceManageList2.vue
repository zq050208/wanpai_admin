<template>
  <div>
		<Button type="primary" style="margin-bottom: 8px;"  @click="addPlanClick">新增</Button>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
    />
    <Modal v-model="addPlanModal" width="600" :title="title" footer-hide>
      <Form :model="formData" ref="formData" label-position="left" :label-width="100">
        <FormItem label="选择游戏" prop="game_name">
          <Input v-model="formData.game_name" search enter-button placeholder="请输入游戏名称、游戏id" @on-search="searchGameList" style="width: 240px" />
          <div class="search_result" v-show="showSearchResult">
            <p v-show="searchedGameList.length > 0" v-for="(item, index) in searchedGameList" :key="index" @click="checkedGame(item)">{{item.name}}</p>
            <p v-show="searchedGameList.length === 0">暂无数据</p>
          </div>
        </FormItem>
        <FormItem label="设置计划时间">
          <Row>
            <Col span="8">
              <FormItem prop="startTime">
                  <DatePicker type="datetime" placeholder="开始时间" format="yyyy-MM-dd HH:mm:ss" :options="optionsSt" v-model="formData.startTime" :disabled="formData.isLong" @on-ok="submitStatus = false"></DatePicker>
              </FormItem>
            </Col>
            <Col span="2" style="text-align: center">到</Col>
            <Col span="8">
              <FormItem prop="endTime">
                  <DatePicker type="datetime" placeholder="结束时间" format="yyyy-MM-dd HH:mm:ss" :options="optionsSt" v-model="formData.endTime" :disabled="formData.isLong" @on-ok="submitStatus = false"></DatePicker>
              </FormItem>
            </Col>
            <Col span="5">
              <FormItem prop="isLong">
                <Checkbox v-model="formData.isLong" style="margin-left: 8px;" @on-change="checkedIsLong">长期</Checkbox>
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="排序" prop="number">
          <input type="text" v-model="formData.number" name="tel" oninput="value=value.replace(/[^\d]/g,'')" maxlength="9" @change="submitStatus = false" style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"/>
          <!-- <InputNumber v-model="formData.number" :min="1" @on-change="submitStatus = false" style="width: 180px;" placeholder="请输入排序（排序输入空隙大一些，以便日后维护）"></InputNumber> -->
        </FormItem>
      </Form>
      <Button type="primary"  style="margin-left: 104px;" @click="handleSubmit('formData')" :disabled="submitStatus" :loading="submitLoadingStatus">提交</Button>
    </Modal>
  </div>
</template>

<script>
import { formateDate } from '@/directive/tool.js'
import { gameWikiRecommendList, searchGameList, deleteGameWiki, addGameWikiRecommend, saveGameWikiRecommend, gameResourceSort, getRecommend } from '@/api/data'
export default {
  components: {},
  data () {
    return {
      addPlanModal: false, // 添加计划弹窗
      title: '新增',
      isEdit: false, // 新增与修改状态
      tableData: [],
      showSearchResult: false,
      searchedGameList: [],
      submitStatus: true, // 提交按钮的状态
      submitLoadingStatus: false,
      editId: 0, // 修改时需要提交的id
      optionsSt: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      },
      formData: {
        game_name: '',
        game_id: '',
        number: 1, // 排序
        startTime: '',
        endTime: '',
        isLong: false
      },
      addFormData: {
        game_name: '',
        game_id: '',
        number: 1, // 排序
        startTime: '',
        endTime: '',
        isLong: false
      },
      columns: [
        {
          align: 'center',
          title: '排序',
          key: 'number'
        },
        {
          align: 'center',
          title: '主推百科的游戏名称',
          key: 'game_name'
        },
        {
          align: 'center',
          title: '时间',
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
          title: '排序',
          render: (h, params) => {
            // console.log('params', params, this.tableData)
            return h('div', [
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
                      this.gameResourceSort(params.row.id, 1)
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
                      this.gameResourceSort(params.row.id, 2)
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
                          this.deleteGameWiki(params.row.id)
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
    getInitDataList () {
      gameWikiRecommendList().then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data
        }
      })
    },
    // 排序
    gameResourceSort (id, type) {
      gameResourceSort({ id: id, sort_type: type }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('排序成功')
          this.getInitDataList()
        }
      })
    },
    addPlanClick () {
      this.addPlanModal = true
      this.isEdit = false
      this.submitStatus = true
      this.showSearchResult = false
      this.submitLoadingStatus = false
      this.title = '新增'
      this.formData = { ...this.addFormData }
    },
    editListData (paramsData) {
      this.title = '修改'
      this.addPlanModal = true
      this.isEdit = true
      this.submitStatus = true
      this.showSearchResult = false
      this.submitLoadingStatus = false
      getRecommend({ id: paramsData.id, resource_type: 2 }).then(res => {
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
    checkedIsLong (value) {
      this.submitStatus = false
    },
    // 删除
    deleteGameWiki (id) {
      deleteGameWiki({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.getInitDataList()
        }
      })
    },
    // 选中搜索游戏列表
    checkedGame (item) {
      this.formData.game_name = item.name
      this.formData.game_id = item.id
      this.showSearchResult = false
      this.submitStatus = false
    },
    handleSubmit () {
      // let tempFormData = JSON.parse(JSON.stringify(this.formData))
      const { game_id, game_name, number, isLong, startTime, endTime } = this.formData
      let is_long, st, et
      if (startTime) st = formateDate(startTime)
      if (endTime) et = formateDate(endTime)
      if (!game_name) return this.$Message.warning('请输入游戏名称或者id')
      if (!isLong && !startTime && !endTime) return this.$Message.warning('请设置时间计划')
      is_long = isLong ? 1 : 0
      if (startTime && endTime && new Date(endTime).getTime() <= new Date(startTime).getTime()) {
        return this.$Message.warning('结束时间不能小于等于开始时间')
      }
      this.submitLoadingStatus = true
      let paramData = {
        game_id: game_id,
        number: number,
        start_time: is_long ? '' : st,
        end_time: is_long ? '' : et,
        is_long: is_long
      }
      // isEdit true 修改 false 新增
      if (this.isEdit) {
        paramData.id = this.editId
        saveGameWikiRecommend(paramData).then(res => {
          this.submitLoadingStatus = false
          if (res.data.code === 200) {
            this.$Message.success('修改成功')
            this.addPlanModal = false
            this.getInitDataList()
          }
        })
      } else {
        addGameWikiRecommend(paramData).then(res => {
          this.submitLoadingStatus = false
          if (res.data.code === 200) {
            this.$Message.success('添加成功')
            this.addPlanModal = false
            this.getInitDataList()
          }
        })
      }
    },
    // 搜索游戏名称
    searchGameList (value) {
      if (!value) return this.$Message.warning('请输入游戏名称或者id')
      searchGameList({ keyword: value, resource_type: 2 }).then(res => {
        if (res.data.code === 200) {
          this.showSearchResult = true
          this.searchedGameList = res.data.data
        }
      })
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
    border: 1px solid #eeeeee;
    p{
      height: 25px;
      line-height: 25px;
      border-bottom: 1px solid #eeeeee;
      padding-left: 10px;
      cursor: pointer;
      &:hover{
        background: #eeeeee;
      }
    }
  }
</style>
