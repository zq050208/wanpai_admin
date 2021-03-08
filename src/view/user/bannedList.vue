<template>
  <div>
    <Card>
      <SearchForm title="筛选数据" :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <!-- 列表 -->
    <Card>
      <p slot="title">数据列表</p>
      <div slot="extra">
        <Button style="margin-right: 20px" icon="md-cloud-upload" type="primary" @click="exportData">导出数据</Button>
      </div>
      <Table border :columns="columns" :data="data" ref="table"></Table>
       <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- 封禁弹框 -->
    <Modal v-model="bannedModal"  :mask-closable="false" @on-cancel="resetBanned">
        <p slot="header" style="text-align:center"><span>封禁{{bannedUser}}</span></p>
      <Form ref='bannedData' :model="bannedData" :rules="rules">
        <FormItem label="封禁渠道：" prop="source">
          <Select style="width: 280px"  v-model='bannedData.prohibit_source' >
            <Option :value="String(item.id)" v-for="item in prohibit_source" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁类型：" prop="prohibit_type">
          <Select style="width: 280px"  v-model='bannedData.prohibit_type'>
            <Option :value="String(item.id)" v-for="item in (Number(this.bannedData.prohibit_source) === 2 ? select2 : select1)" :key="item.index" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁时长：" prop="prohibit_hour" >
          <Input v-model="bannedData.prohibit_hour" style="width:200px" type="number" /> 小时
        </FormItem>
        <FormItem label="封禁原因：" prop="prohibit_reason">
          <Select style="width: 280px" v-model='bannedData.prohibit_reason'>
            <Option :value="String(item.id)" v-for="item in prohibit_reason" :key="item.index" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁描述：" prop="prohibit_desc">
            <Input  v-model="bannedData.prohibit_desc" type="textarea" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入相关描述！" style="width: 280px" />
        </FormItem>
      </Form>
        <div slot="footer">
            <Button type="primary" size="default" @click="submitData('bannedData')">提交</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getProhibitUserList, relieveProhibitUser, exportProhibitUserList, getProhibitUserData, editProhibitUser } from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    return {
      data: [],
      bannedModal: false,
      total: 0,
      current: 1,
      per_page: 10,
      radioValue: '',
      prohibitUserList: {},
      bannedUser: '',
      bannedData: {
        prohibit_reason: '',
        prohibit_type: '',
        prohibit_desc: '',
        prohibit_hour: '',
        prohibit_source: ''
      },
      prohibit_reason: [],
      prohibit_type: [],
      prohibit_source: [],
      select1: [],
      select2: [],
      searchParams: {
        date: ''
      },
      searchData: {
        date: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = { ...this.searchData }
              this.current = 1
              this.getProhibitUserList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'content',
            label: '查询内容',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '发布时间：'
          }
        ]
      },
      columns: [
        {
          title: '用户ID',
          key: 'user_id',
          align: 'center',
          width: '80px'
        },
        {
          title: '用户昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'username',
          align: 'center',
          width: '130px'
        },
        {
          title: '封禁原因',
          key: 'reason',
          align: 'center'
        },
        {
          title: '封禁类型',
          key: 'type',
          align: 'center',
          width: '120px'
        },
        {
          title: '封禁时长',
          key: 'hour',
          align: 'center',
          width: '80px'
        },
        {
          title: '封禁描述',
          key: 'desc',
          align: 'center'
        },
        {
          title: '封禁人',
          key: 'create_admin',
          align: 'center',
          width: '120px'
        },
        {
          title: '封禁时间',
          key: 'start_time',
          align: 'center'
        },
        {
          title: '封禁渠道',
          key: 'source',
          align: 'center',
          width: '130px'
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
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确定解禁 ' + '“' + params.row.nickname + '”' + ' 吗？',
                      onOk: () => {
                        this.relieveUser(params.row.id)
                      }
                    })
                  }
                }
              }, '解禁'),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.bannedData.prohibit_source = params.row.source === '分子派对' ? '2' : '1'
                    this.bannedData.prohibit_hour = String(params.row.hour)
                    this.bannedData.prohibit_desc = params.row.desc
                    if (params.row.type === '评论封禁') {
                      this.bannedData.prohibit_type = '1'
                    } else if (params.row.type === '登录封禁') {
                      this.bannedData.prohibit_type = '2'
                    } else if (params.row.type === '上麦封禁') {
                      this.bannedData.prohibit_type = '4'
                    } else if(params.row.type === '评价封禁'){
                      this.bannedData.prohibit_type = '5'
                    } else {
                      this.bannedData.prohibit_type = '3'
                    }
                    if (params.row.reason === '淫秽色情') {
                      this.bannedData.prohibit_reason = '1'
                    } else if (params.row.reason === '涉及政治') {
                      this.bannedData.prohibit_reason = '2'
                    } else if (params.row.reason === '涉及军事') {
                      this.bannedData.prohibit_reason = '3'
                    } else if (params.row.reason === '谩骂侮辱') {
                      this.bannedData.prohibit_reason = '4'
                    } else if (params.row.reason === '垃圾广告') {
                      this.bannedData.prohibit_reason = '5'
                    } else if (params.row.reason === '血腥暴力') {
                      this.bannedData.prohibit_reason = '6'
                    } else {
                      this.bannedData.prohibit_reason = '7'
                    }
                    this.bannedCom(params.row.id, params.row.nickname)
                    this.getProhibitUser()
                  }
                }
              }, '封禁')
            ])
          }
        }
      ],
      rules: {
        prohibit_reason: [{ required: true, message: '请选择封禁原因', trigger: 'change' }],
        prohibit_type: [{ required: true, message: '请选择封禁类型', trigger: 'change' }],
        prohibit_hour: [{ required: true, message: '请输入封禁时长', trigger: 'blur' }],
        prohibit_desc: [{ required: true, message: '请输入封禁描述', trigger: 'blur' }],
        prohibit_source: [{ required: true, message: '请选择封禁渠道', trigger: 'change' }]
      }
    }
  },
  mounted () {
    this.getProhibitUserList()
  },
  methods: {
    // 获取封禁用户数据
    getProhibitUser () {
      getProhibitUserData().then(res => {
        this.prohibit_reason = res.data.data.prohibit_reason_list
        this.prohibit_source = res.data.data.prohibit_source
        this.select1 = res.data.data.prohibit_source[0].type_list
        this.select2 = res.data.data.prohibit_source[1].type_list
        this.prohibit_type = res.data.data.prohibit_type_list
      })
    },
    getProhibitUserList () {
      const params = { ...this.searchParams }
      const { date } = this.searchParams
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      var data = {
        page: this.current,
        per_page: this.per_page,
        ...params
      }
      getProhibitUserList(data).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    
    // 分页
    handlePageChange (page) {
      this.current = page
      this.getProhibitUserList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.getProhibitUserList()
    },
    // 解除用户封禁
    relieveUser (id) {
      relieveProhibitUser({ prohibit_id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('解除封禁成功')
          this.current = 1
          this.getProhibitUserList()
        }
      })
    },
    // 封禁用户
    bannedCom (id, name) {
      this.bannedUser = name
      this.bannedModal = true
      this.bannedData.prohibit_id = String(id)
    },
    // 提交编辑用户
    submitData (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          editProhibitUser(this.bannedData).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('修改成功')
              this.bannedModal = false
              this.resetBanned()
              this.current = 1
              this.getProhibitUserList()
            } else {
              this.resetBanned()
            }
          })
        }
      })
    },
    // 重置封禁弹框
    resetBanned () { this.$refs.bannedData.resetFields() },
    //  导出数据
    exportData () {
      const params = { ...this.searchParams }
      const { date } = this.searchParams
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      var data = {
        ...params
      }
      exportProhibitUserList(data).then(res => {
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            filename: '封禁用户列表数据',
            columns: this.columns,
            data: res.data.data.user_list
          })
        }
      })
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
