<template>
  <Card>
    <Button class="add" @click="add">添加</Button>
    <Row style="margin-bottom: 20px" >
        <SearchForm :searchForm="formData" :searchData="searchData" />
    </Row>
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
    <Modal v-model="addTagVisble" :title=titleText :scrollable='true' width="400" @on-visible-change = creatMassge >
      <Form ref="modeVue" :model="modeVue" :label-width="100" :rules="ruleInline" inline>
        <FormItem prop="phone" label="手机号：" style=" width:100%" >
          <!--  -->
          <Input type="text" v-model="modeVue.phone" :disabled="isINput" ></Input>
        </FormItem>
        <FormItem label="关联用户：" style=" width:100%" >
          <!-- <Button type="success" long  @click="getUser">{{getUserMassger.length===0? isClickText?'点击获取用户':'暂无用户':getUserMassger[0].nickname}}</Button> -->
          <Button type="success" long  @click="getUser">{{getUserMassger.length===0? isClickText?'点击获取用户':userInfoMsg:getUserMassger[0].nickname}}</Button>
        </FormItem>
        <!-- <div style=" width:100% paddingLeft:30%"> -->
          <Select
            v-model="model15"
            prefix="ios-search"
            style="width:200px"
            :clearable = "true"
            :filterable = 'true'
            @on-change='SelectValue'
            @on-open-change='down'
            remote
            :remote-method="OrignchangeQuery"
            @on-query-change='changeQuery'
            v-if="addTagVisble"
          >
            <Option style=" width:100%" v-for="item in cityList" :value="item.name+`,`+item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        <!-- </div> -->
        <div>
          <FormItem prop="keywords" label="绑定游戏：" >
            <div style=" width:100%">
              <Tag v-for="(item, index) in count" :key="index" :v-model="item.name" :name="index" closable @on-close="delGame">{{item.name}}</Tag>
            </div>
          </FormItem>
        </div>
        <!-- <FormItem  label="账号状态：" >
          <i-switch  @on-change="change" :value='editData.status === 0 ? false:true' />
        </FormItem> -->
      </Form>
      <div>
        <span>账号状态：</span>
        <i-switch  @on-change="change" :value='editData.status === 0 ? false:true' />
      </div>
      <div slot="footer" style="display: flex;justify-content: center">
          <Button type="success" @click="commitTag(isAdd)" >提交</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import {
  delUserAdmin,
  indexUserAdmin,
  editUserAdminStatus,
  getUser,
  getGameList,
  addUserAdmin,
  getCheckCodeBai,
  editUserAdmin
} from '@/api/data'
import SearchForm from '../../components/searchForm'
import { debounce } from "@/libs/util";
export default {
  name:'managementList',
  components: {
    SearchForm
  },
  data () {
    return {
      titleText:"",
      userInfoMsg:'',
      isINput:true,
      keyteaxt:'',
      isAdd: true,
      arryGameId: [],
      searchParams: {
        keywords: ''
      },
      pageParams1: {
        page: 1,
        per_page: 10
      },
      isClickText: '点击获取用户', // 控制初始文字
      getUserMassger: [],
      editData: {
        checkcode: '', // 校验码 (必填)
        user_id: null, // 用户id (必填)
        status: 0, // 账号是否开启 (必填) 0:否 1:是
        game_id: JSON // 游戏id (必填) [1,2,3]
      }, // 编辑时的参数
      model15: '', // 游戏名称搜索下拉用的
      cityList: [
        {
          name: '全部游戏',
          id: -1
        }
      ], // 游戏名称下拉选项数组
      count: [],
      switch1: false,
      formDynamic: {
      },
      modeVue: {
        keywords: '',
        phone: ''
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
        date: ''
      },
      formData: {
        actions: [
          {
            text: '查询',
            type: 'default',
            handle: () => {
              this.pageParams.page = 1
              this.searchParams = {
                ...this.searchData
              }
              this.indexUserAdmin()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            label: '关键词查询：',
            prop: 'keywords',
            placeholder: '输入账号/昵称/手机号搜索/游戏名称',
            style: 'width:250px'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '申请时间：'
          }
        ]
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
          title: '手机号',
          key: 'username'
        },
        {
          align: 'center',
          title: '关联用户昵称',
          key: 'nickname'
        },
        {
          align: 'center',
          title: '绑定游戏',
          // key: 'user_admin_game',
          render: (h, params) => {
            let text = ''
            // console.log(params.row.user_admin_game)
            params.row.user_admin_game.forEach((item, index) => {
              // eslint-disable-next-line no-return-assign
              return text += `${item.name}、`
            })
            // console.log('zi',text)
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
          title: '添加时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '最后登录时间',
          key: 'login_time'
        },
        {
          align: 'center',
          title: '账号状态',
          key: 'status',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                'true-color': 'rgb(26,188,156)',
                value: params.row.status === 1,
                'before-change': () => this.handleSwitchChange(params.row)
              }
            })
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
                '修改'
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
                          this.delUserAdmin(params.row.user_id)
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
        keywords: [{ required: true, message: '请输入游戏名称' }],
        phone: [{ required: true, message: '请输入手机号' }]
      }
    }
  },
  mounted () {
    this.indexUserAdmin()
  },
  methods: {
    creatMassge (value) {
      if (!value) {
        this.getUserMassger = []
        this.editData = {}
        this.count = []
        this.editData.status = 0
        // this.arryGameId = []
        this.cityList = []
      } else {
        this.getCheckCodeBai()
      }
    },
    // 获取校验码
    getCheckCodeBai () {
      getCheckCodeBai().then(res => {
        this.editData.checkcode = res.data.data.checkcode
      })
    },
    // 模糊查询调用
    changeQuery (value) {
      // this.getGameList(value)
      this.keyteaxt = value
    },
    OrignchangeQuery: debounce(function() {
      // let data = {
      //   keywords: this.userKeywords
      // };
      this.cityList=[]
      const data = {
        keywords: this.keyteaxt
      }
      getGameList(data).then(res => {
        this.cityList.push({
          name: '全部游戏',
          id: -1
        })
        // console.log(res.data.data.data)
        res.data.data.data.forEach((item, index) => {
          if (item.wiki_status === 1) {
            this.cityList.push(item)
          } else {
            return false
          }
        })
      })
    }, 500),
    // 选中是触发
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
        this.getGameList()
      }
    },
    // 获取游戏数据
    getGameList (value) {
      this.cityList = []
      const data = {
        // ...this.pageParams,
        keywords: value
      }
      getGameList(data).then(res => {
        this.cityList.push({
          name: '全部游戏',
          id: -1
        })
        // console.log(res.data.data.data)
        res.data.data.data.forEach((item, index) => {
          if (item.wiki_status === 1) {
            this.cityList.push(item)
          } else {
            return false
          }
        })
      })
    },
    // 点击获取用户名字
    getUser () {
      if (!this.modeVue.phone) {
        return false
      }
      this.isClickText = false
      // this.editData.user_id = ''
      
      const data = {
        mobile: this.modeVue.phone
      }
      getUser(data).then(res => {

            // this.getUserMassger = res.data.data
            // this.editData.user_id = res.data.data[0].user_id
            // this.isClickText = true
            // if(res.data.data.length===0){
            //   this.isClickText = false
            // }   

            if (res.data.data && res.data.data[0]) {
              this.editData.user_id = res.data.data[0].user_id
            }else {
              this.$Message.error(res.data.msg)
            }
            this.getUserMassger = res.data.data
            this.userInfoMsg = res.data.msg
            this.isClickText = true

      })
    },
    // 删除绑定游戏
    delGame (e, value) {
      // console.log('删除标签',value)
      // const index = this.count.indexOf(value)
      this.count.splice(value, 1)
    },
    // 控制游戏状态
    change (e) {
      if (e) {
        this.editData.status = 1
      } else {
        this.editData.status = 0
      }
    },
    // 提交添加
    commitTag (value) {
      this.arryGameId = []
      this.count.forEach((item, index) => {
        return this.arryGameId.push(item.id)
      })
      this.editData.game_id = JSON.stringify(this.arryGameId)
      const data = {
        ...this.editData
      }
      if (value) {
        // 添加
        addUserAdmin(data).then(res => {
          if (res.data.code === 200) {
            this.addTagVisble = false
            this.indexUserAdmin()
            this.editData.status = 0
            this.isAdd = true
            this.editData = {}
          }
        })
      } else {
        // 修改
        editUserAdmin(data).then(res => {
          // console.log(res)
          if (res.data.code === 200) {
            this.addTagVisble = false
            this.indexUserAdmin()
            this.editData.status = 0
            this.isAdd = true
            this.editData = {}
          }
        })
      }
    },
    // 获取管理人员列表
    indexUserAdmin () {
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
      indexUserAdmin(data)
        .then(res => {
          if (res.data.code === 200) {
            // console.log('请求会来的列表数据', res.data.data.data)
            this.tableData = res.data.data.data
            this.pageParams.total = res.data.data.total
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
          this.indexUserAdmin()
        }
      })
    },
    // this.editData.status = 0
    // 添加管理列表
    add () {
      this.titleText= "新增"
      this.modeVue.phone = ''
      this.$refs.modeVue.resetFields()
      this.addTagVisble = true
      this.isAdd = true
      this.isINput=false
    },
    // 编辑当前游戏信息
    edit (massge) {
      this.titleText = "编辑"
      this.isAdd = false
      this.isINput = true
      console.log('sadasdsa',this.isINput )
      this.editData.status = massge.status
      this.modeVue.phone = massge.username
      const newArry = []
      massge.user_admin_game.map((item, index) => {
        newArry.push(item)
      })
      this.count = newArry
      this.addTagVisble = true
    },
    // 删除
    delUserAdmin (id) {
      const data = {
        user_id: id
      }
      this.submitLoading = true
      delUserAdmin(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            this.indexUserAdmin()
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.indexUserAdmin()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.indexUserAdmin()
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
}
</style>