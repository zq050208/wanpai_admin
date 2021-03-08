<template>
  <Card>
    <Button class="add" @click="add">添加</Button>
    <!-- <Row style="margin-bottom: 20px" >
        <SearchForm :searchForm="formData" :searchData="searchData" />
    </Row> -->
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
    <Modal v-model="addTagVisble" :title="isTextAdd" :scrollable='true' width="400" @on-visible-change = creatMassge >
      <Form ref="modeVue" :model="modeVue" :label-width="100" :rules="ruleInline" inline class='centent'>
        <div class='yan'>
          <span style="color:#F04844;margin-bottom:15px">*</span>
          <FormItem label="分组名称：" style=" width:100%" >
            <Input type="text" v-model="modeVue.name" :maxlength="10" ></Input>
          </FormItem>
        </div>
        <!-- prop="count"  -->
        <div class='yan'>
          <span style="color:#F04844;margin-bottom:15px">*</span>
          <FormItem label="绑定游戏："  style=" width:100%" >
            <Select
              v-model="model15"
              prefix="ios-search"
              style="width:200px"
              :clearable = "true"
              :filterable = 'true'
              @on-change='SelectValue'
              @on-open-change='down'
              @on-query-change='changeQuery'
              v-if="addTagVisble"
            >
              <Option style=" width:100%" v-for="item in cityList" :value="item.name+`,`+item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
        </div>
        <div>
          <FormItem  >
            <div style=" width:258px">
              <Tag v-for="(item, index) in count" :key="index" :v-model="item.name" :name="index" closable @on-close="delGame">{{item.name}}</Tag>
            </div>
          </FormItem>
        </div>
      </Form>
      <div slot="footer" style="display: flex;justify-content: center">
          <Button type="success" @click="commitTag(isAdd)" >提交</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import {
  editUserAdminStatus,
  GameMetricsGameList, // 获取分组的数据列表
  GameMetricsCode, // 获取校验码
  GameMetricsAddGroup, // 添加
  GameMetricsEditGroup, // 编辑
  GameMetricsGroupGameList, // 获取游戏列表
  GameMetricsDetailGroup, // 获取游戏详情
  GameMetricsDelGroup // 删除
} from '@/api/data'
// import SearchForm from '../../../components/searchForm'
export default {
  components: {
    // SearchForm
  },
  data () {
    return {
      isTextAdd:'',
      isAdd: true,
      arryGameId: [],
      searchParams: {
        keywords: ''
      },
      pageParams1: {
        page: 1,
        per_page: 10
      },
      isClickText: true, // 控制初始文字
      getUserMassger: [],
      addData: {
        checkcode: '', // 校验码 (必填)
        name: '', // 群组名称 最多10个字符
        game_ids: JSON // 游戏id (必填) [1,2,3]
      }, // 编辑时的参数
      editData: {
        id: '', // 用户id (必填)
        name: '', // 群组名称 最多10个字符
        game_ids: JSON // 游戏id (必填) [1,2,3]
      },
      model15: '', // 游戏名称搜索下拉用的
      cityList: [
      ], // 游戏名称下拉选项数组
      count: [],
      switch1: false,
      formDynamic: {
      },
      modeVue: {
        keywords: '',
        name: ''
      },
      searchGameName: {
        search: ''
      },
      addTagVisble: false, // 控制弹窗
      submitLoading: false,
      type: 1,
      mode: '',
      modalVisible: false,
      searchData: {
        keywords: '',
        start_time: '', // 开始时间
        end_time: '', // 结束时间
        date: '',
        tag: ''
      },
      tableData: [],
      columns: [
        {
          align: 'center',
          title: '分组名称',
          key: 'name',
          width: '200'
        },
        {
          align: 'center',
          title: '包含游戏',
          render: (h, params) => {
            let text = ''
            params.row.withGame.forEach((item, index) => {
              // eslint-disable-next-line no-return-assign
              return text += `${item.name}、`
            })
            return h('div', [
              h(
                'span',
                {},
                text
              )
            ])
          }
        },
        {
          align: 'center',
          title: '操作',
          width: '200',
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
                      // this.searchData = { ...params.row }
                      this.edit(params.row)
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
                        title: '确认要删除吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.GameMetricsDelGroup(params.row.id)
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
      ruleInline: {
        count: [{ required: true, message: '请输入游戏名称', type: 'array', min: 1, }],
        name: [{ required: true, message: '请输入游戏名称' }]
      }
    }
  },
  mounted () {
    this.GameMetricsGameList()
  },
  methods: {
    creatMassge (value) {
      if (!value) {
        this.getUserMassger = []
        this.addData = {}
        this.count = []
        this.cityList = []
      } else {
        this.GameMetricsCode()
      }
    },
    // 获取校验码
    GameMetricsCode () {
      GameMetricsCode().then(res => {
        this.addData.checkcode = res.data.data.checkcode
      })
    },
    // 模糊查询调用
    changeQuery (value) {
      this.GameMetricsGroupGameList(value)
    },
    // 选中值
    SelectValue (item) {
      if (item) {
        const value = item.split(',')[0]
        const gameId = parseInt(item.split(',')[1])
        const obj = {
          name: value,
          id: gameId
        }
        const isIn = this.isInArray(this.count, obj.name)
        if (isIn) {
          return this.$Message.error('游戏名称已存在')
        } else {
          this.count.push(obj)
        }
      }
    },
    // 筛选有没有重复的游戏名称
    isInArray (arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (value === arr[i].name) {
          return true
        }
      }
      return false
    },
    // 下拉出来时触发
    down (value) {
      if (value) {
        this.GameMetricsGroupGameList()
      }
    },
    // 获取游戏数据
    GameMetricsGroupGameList (value) {
      this.cityList = []
      const data = {
        ...this.pageParams,
        search: value
      }
      GameMetricsGroupGameList(data).then(res => {
        res.data.data.data.forEach((item, index) => {
          this.cityList.push(item)
        })
      })
    },
    // 删除绑定游戏
    delGame (e, value) {
      this.count.splice(value, 1)
    },
    // 提交添加
    commitTag (value) {
      this.arryGameId = []
      this.count.forEach((item, index) => {
        return this.arryGameId.push(item.id)
      })
      this.addData.game_ids = JSON.stringify(this.arryGameId)
      this.addData.name = this.modeVue.name
      this.editData.game_ids = JSON.stringify(this.arryGameId)
      this.editData.name = this.modeVue.name
      if (value) {
        // 添加
        const data = {
          ...this.addData
        }
        GameMetricsAddGroup(data).then(res => {
          if (res.data.code === 200) {
            this.addTagVisble = false
            this.GameMetricsGameList()
            this.isAdd = true
          }
        })
      } else {
        // 修改
        const data = {
          ...this.editData
        }
        GameMetricsEditGroup(data).then(res => {
          if (res.data.code === 200) {
            this.addTagVisble = false
            this.GameMetricsGameList()
            this.isAdd = true
          }
        })
      }
    },
    // 获取管理人员列表
    GameMetricsGameList () {
      const params = { ...this.searchData }
      const { date } = this.searchData
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...params
      }
      GameMetricsGameList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.pageParams.total = res.data.data.total
            if(res.data.data.data.length === 0){
              if(this.pageParams.page!== 1){
                this.pageParams.page = this.pageParams.page-1
                this.GameMetricsGameList()
              }
            }else{
              return
            }
          }
        })
    },
    // 账号状态修改
    handleSwitchChange (data) {
      this.editUserAdminStatus(data)
    },
    // 修改账号状态
    editUserAdminStatus (item) {
      const data = {
        user_id: item.user_id,
        status: item.status === 0 ? 1 : 0
      }
      editUserAdminStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('修改成功')
          this.GameMetricsGameList()
        }
      })
    },
    // 添加管理列表
    add () {
      this.isTextAdd = '添加'
      this.modeVue.name = ''
      this.addTagVisble = true
      this.isAdd = true
    },
    // 编辑当前游戏信息
    edit (massge) {
      this.isTextAdd = '编辑'
      this.isAdd = false
      this.modeVue.name = massge.name
      this.editData.id = massge.id
      const data = {
        id: massge.id
      }
      GameMetricsDetailGroup(data).then(res => {
        if (res.data.code === 200) {
          const newArry = []
          res.data.data.withGame.map((item, index) => {
            newArry.push(item)
          })
          this.count = newArry
          this.addTagVisble = true
        }
      })
    },
    // 删除
    GameMetricsDelGroup (id) {
      const data = {
        id: id
      }
      this.submitLoading = true
      GameMetricsDelGroup(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            this.GameMetricsGameList()
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.GameMetricsGameList()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.GameMetricsGameList()
    }
  }
}
</script>

<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
  /* : ; */
}
.add {
  margin-bottom: 10px;
  background-color: #2d8cf0;
  border-color: #2d8cf0;
  color: #fff;
}
.centent{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.yan {
  display: flex;
  /* justify-content: center; */
  align-items: center;
}
</style>
