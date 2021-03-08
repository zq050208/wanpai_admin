<template>
  <Card>
    <Button type="dashed" class="add" @click="add">添加</Button>
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
    <Modal v-model="addTagVisble"  :title="addText"  :scrollable='true' width="450" @on-visible-change = creatMassge >
      <Form ref="modeVue" :model="modeVue" :label-width="100" :rules="ruleInline" inline class='centent'>
        <FormItem prop="phone" label="手机号：" style=" width:100%" >
          <Input type="tel" v-model="modeVue.phone"  :disabled="isINput"></Input>
        </FormItem>
        <FormItem label="关联用户：" style=" width:100%" >
          <Button type="success" long  @click="getUser">
            {{!getUserMassger.nickname
            ?( isClickText?'点击获取用户':(userInfoMsg?userInfoMsg:'用户不存在'))
            :(getUserMassger.nickname)}}
          </Button>
        </FormItem>
        <!-- <div style=" width:100% paddingLeft:30%"> -->
          <Select
            v-model="model15"
            placeholder='请输入搜索圈子'
            prefix="ios-search"
            style="width:406px"
            :clearable = "true"
            :filterable = 'true'
            @on-change='SelectValue'
            @on-open-change='down'
            @on-query-change='changeQuery'
            v-if="addTagVisble"
          >
            <Option style=" width:100%" v-for="item in cityList" :value="item.name+`,`+item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        <!-- </div> -->
          <FormItem prop="keywords" label="绑定圈子：" style="width:400px">
            <div style=" width: 100%;">
              <Tag v-for="(item, index) in count" :key="index" :v-model="item.name" :name="index" closable @on-close="delGame">{{item.name}}</Tag>
            </div>
          </FormItem>
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
  getCircleAdminList, // 获取圈子管理员列表数据
  searchCircleList, // 搜素圈子
  circleGetUserInfo, // 根据手机号获取信息
  addChangeCircleAdmin, // 添加、编辑接口
  GameMetricsAdminCheckCode, // 获取校验码
  getCircleEditInfo, // 获取编辑初始化数据
  circleAdminDel, // 删除
  circleAdminSetStatus // 修改状态
} from '@/api/data'
import SearchForm from '../../components/searchForm'
export default {
  components: {
    SearchForm
  },
  data () {
    return {
      isINput:false,
      userInfoMsg: '', // 存放点击获取用户信息的提示
      isAdd: true,
      addText:'添加',
      arryGameId: [],
      searchParams: {
        keywords: ''
      },
      pageParams1: {
        page: 1,
        per_page: 10
      },
      isClickText: true, // 控制初始文字
      getUserMassger: {},
      editData: {
        checkcode: '', // 校验码 (必填)
        user_id: null, // 用户id (必填)
        status: 0, // 账号是否开启 (必填) 0:否 1:是
        // game_id: JSON // 游戏id (必填) [1,2,3]
        circle_ids: [], // 圈子id
        is_all_circle: 0, // 0默认1全部圈子
        id: '' // 编辑时必填
      },
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
              this.getCircleAdminList()
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
          title: '绑定圈子',
          key: 'circle_name'
          // render: (h, params) => {
          //   let text = ''
          //   params.row.circle_name.forEach((item, index) => {
          //     return text += `${item.name}、`
          //   })
          //   return h('div', [
          //     h(
          //       'span',
          //       {},
          //       text
          //     )
          //   ])
          // }
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
                          this.circleAdminDel(params.row.id)
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
    this.getCircleAdminList()
  },
  methods: {
    creatMassge (value) {
      if (!value) {
        this.getUserMassger = {}
        this.editData = {}
        this.count = []
        this.editData.status = 0
        // this.arryGameId = []
        this.cityList = []
      } else {
        this.GameMetricsAdminCheckCode()
      }
    },
    // 获取校验码
    GameMetricsAdminCheckCode () {
      GameMetricsAdminCheckCode().then(res => {
        this.editData.checkcode = res.data.data.checkcode
      })
    },
    // 模糊查询调用
    changeQuery (value) {
      // if(value.length>=10){
      //   return this.$Message.error('最多输入10个字符')
      // }
      this.searchCircle(value)
    },
    // 选中时触发
    SelectValue (item) {
      if (item) {
        const value = item.split(',')[0]
        const gameId = parseInt(item.split(',')[1])
        if(value.length>20){
          return false
        }
        let obj = {}
        let goOn = true
        if (gameId !== -1) {
          this.count.forEach(item => {
            if(item.id===-1){
              return goOn = false
            }
          })
          if(goOn){
            obj = {
              name: value,
              id: gameId
            }
            goOn = true
          }else{
            return false
          }
         
        } else {
          // 代表全部
          this.count = []
          this.editData.is_all_circle = 1
          obj = {
            name: '所有圈子',
            id: -1
          }
        }
        const isIn = this.isInArray(this.count, obj.id)
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
        if (value === arr[i].id) {
          return true
        }
      }
      return false
    },
    // 下拉出来时触发
    down (value) {
      if (value) {
        this.searchCircle()
      }
    },
    // 搜索圈子
    searchCircle (value) {
    
      this.cityList = []
      const data = {
        // ...this.pageParams,
        num:20,
        kw: value
      }
      searchCircleList(data).then(res => {
        this.cityList.push({
          name: '所有圈子',
          id: -1
        })
        res.data.data.forEach((item, index) => {
          // if (item.wiki_status === 1) {
          this.cityList.push(item)
          // } else {
          //   return false
          // }
        })
      })
    },
    // 点击获取用户名字
    getUser () {
      if (!this.modeVue.phone) {
        return false
      }
      const data = {
        mobile: this.modeVue.phone
      }
      circleGetUserInfo(data).then(res => {
        if (res.data.code === 200) {
          this.getUserMassger = res.data.data
          this.editData.user_id =this.editData.user_id?this.editData.user_id:res.data.data.user_id
          this.isClickText = true
          if( res.data.data.length===0){
            this.isClickText = false
          }
        } else {
          this.userInfoMsg = res.data.msg
        }
      })
    },
    // 删除绑定游戏
    delGame (e, value) {
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

    // 获取编辑初始化数据
    getCircleEditInfo (value) {
      const data = {
        id: value
      }
      getCircleEditInfo(data).then(res => {
        if (res.data.code === 200) {
          this.count = res.data.data.circle_list
          this.editData.user_id = res.data.data.user_id
        }
      })
    },
    // 提交添加
    commitTag (value) {
      this.arryGameId = []
      this.count.forEach((item, index) => {
        if (item.id === -1) {
          return this.editData.is_all_circle = 1
        } else {
          return this.arryGameId.push(item.id)
        }
      })
      // this.editData.circle_ids = JSON.stringify(this.arryGameId)
      this.editData.circle_ids = this.arryGameId
      //如果选择了，全选this.editData.is_all_circle = 1，那么circle_ids应该是空
      if(this.editData.is_all_circle === 1){
        this.editData.circle_ids=[]
      }else{
         if(this.editData.circle_ids.length===0){
          return this.$Message.error('圈子不能为空')
        }
      }
      const data = {
        ...this.editData
      }
      // if (value) {
      // 添加修改调用的是同一个接口，只是参数不一样
      addChangeCircleAdmin(data).then(res => {
        if (res.data.code === 200) {
          this.addTagVisble = false
          this.getCircleAdminList()
          this.editData.status = 0
          // this.isAdd = true
          this.editData = {}
        }
      })
      // 添加
      // addUserAdmin(data).then(res => {
      //   if (res.data.code === 200) {
      //     this.addTagVisble = false
      //     this.getCircleAdminList()
      //     this.editData.status = 0
      //     this.isAdd = true
      //     this.editData = {}
      //   }
      // })
      // } else {
      // 修改
      //   editUserAdmin(data).then(res => {
      //     if (res.data.code === 200) {
      //       this.addTagVisble = false
      //       this.getCircleAdminList()
      //       this.editData.status = 0
      //       this.isAdd = true
      //       this.editData = {}
      //     }
      //   })
      // }
    },
    // 获取圈子管理人员列表
    getCircleAdminList () {
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
      getCircleAdminList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.pageParams.total = res.data.data.total
            if(res.data.data.data.length === 0){
              if(this.pageParams.page!== 1){
                this.pageParams.page = this.pageParams.page-1
                this.getCircleAdminList()
              }
            }else{
              return
            }
          }
        })
    },
    // 账号状态修改
    handleSwitchChange (data) {
      this.circleAdminSetStatus(data)
    },
    // 修改账号状态
    circleAdminSetStatus (item) {
      const data = {
        id: item.id,
        status: item.status === 0 ? 1 : 0
      }
      circleAdminSetStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('修改成功')
          this.getCircleAdminList()
        }
      })
    },
    // this.editData.status = 0
    // 添加管理列表
    add () {
       this.isINput=false
      this.addText = '添加'
      this.modeVue.phone = ''
      this.addTagVisble = true
      this.isAdd = true
      this.editData.user_id = ''
      this.editData.id = ''
      this.getUserMassger={}
      this.isClickText = true
    },
    // 编辑当前游戏信息
    edit (massge) {
      // 初始化状态再赋值
      this.addText = '编辑'
      this.isINput=true
      this.userInfoMsg = ''
      this.editData.user_id = ''
      this.getUserMassger={}
      this.isClickText = true
      this.modeVue.phone = ''
      this.editData.is_all_circle = 0
      this.editData.id = massge.id
      this.isAdd = false
      this.editData.status = massge.status
      this.modeVue.phone = massge.username
      this.getCircleEditInfo(massge.id)
      this.addTagVisble = true
    },
    // 删除
    circleAdminDel (id) {
      const data = {
        id: id
      }
      this.submitLoading = true
      circleAdminDel(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            this.getCircleAdminList()
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.getCircleAdminList()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.getCircleAdminList()
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
</style>
