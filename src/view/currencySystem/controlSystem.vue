<template>
  <div>
      <RadioGroup v-model="type" type="button" @on-change="handleTypeChange" style="margin-bottom: 20px">
        <Radio :label="1">风控列表</Radio>
        <Radio :label="2">货币设置</Radio>
      </RadioGroup>
      <Card v-if="type === 1">
        <!-- <SearchForm :searchForm="searchForm" :searchData="searchData" /> -->
          <Form :label-width="100" ref="currentSet" :model="currentSet" :rules="ruleInline">
            <div style="display: flex; margin-bottom: 50px">
            <FormItem label="使用渠道:">
              <Select style="width: 150px; " v-model="searchData.app_id"  @on-change="defaultTypeChange">
                <Option :value="item.app_id" v-for="item in defaultType" :key="item.app_id" :label="item.app_name"></Option>
              </Select>
            </FormItem>
            <FormItem label="货币类型:">
              <Select style="width: 150px; " :value="searchData.currency_id" >
                <Option :value="item.id" v-for="item in defaultMoney" :key="item.currency_id" :label="item.name" @click.native="getmoneyChange(item)"></Option>
              </Select>
            </FormItem>
            <FormItem label="选择日期:">
              <Select style="width: 150px; " v-model="searchData.date_type" @on-change="dateChange" >
                <Option :value="item.date_type" v-for="item in defaultDate" :key="item.date_type" :label="item.name"></Option>
              </Select>
            </FormItem>
            <FormItem :label-width="50">
              <Input  type="text" style="width:200px" v-model="searchData.content" placeholder="输入ID/昵称/手机号查询" />
            </FormItem>
            <Button  type="primary" style="margin: 0 30px" @click="inquireClick">查询</Button>
            <Button  type="primary" @click="exportData">导出数据</Button>
            </div>
          </Form>
        <Table border :columns="columns" :data="data" ref="table"></Table>
        <Page class="page" :page-size-opts="[10, 20, 30, 50]" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
      </Card>
      <div v-if="type === 2">
        <Form :label-width="150" ref="currentSet" :model="currentSet" :rules="ruleInline">
          <div class="flex">
              <FormItem label="使用渠道:" prop="app_id">
                <Select style="width: 150px" v-model="currentSet.app_id"  @on-change="appChange">
                  <Option :value="item.app_id" v-for="item in channel" :key="item.app_id" :label="item.app_name"></Option>
                </Select>
              </FormItem>
              <FormItem label="货币类型:" prop="currency_id">
                <Select style="width: 150px" v-model="currentSet.currency_id" @on-change="currencyTypeChange" >
                  <Option :value="Number(item.id)" v-for="item in currencyType" :key="item.id" :label="item.name" @click.native="getMoreParams(item)" ></Option>
                </Select>
            </FormItem>
          </div>
          <div style="margin-left:100px; color:#aaaaaa; padding: 20px 0">货币信息设定：</div>
          <div class="flex">
            <FormItem :label="typeName+'名称：'" prop="currency_name">
              <Input  type="text" style="width:200px" v-model="currentSet.currency_name" />
            </FormItem>
            <FormItem :label="typeName+'：人民币 ＝'"  style="margin-left: 50px" >
                <InputNumber  style="width:100px;"  :readonly="currentSet.currency_id === -1 ? false : true " v-model="currentSet.currency_proportion"/>
                <span v-if="currentSet.currency_proportion !== 0"> ： <span>1</span></span>
                <!-- <Input  style="width:200px;"  :readonly="currentSet.currency_id === -1 ? false : true " v-model="currentSet.currency_proportion === 0 ? 0 : String(currentSet.currency_proportion + ':1')"/> -->
            </FormItem>
          </div>
          <div class="button">
            <Button  type="primary" @click="confirm('currentSet')">保存货币设置</Button>
          </div>
        </Form>
        <Form :label-width="160" ref="setCurrencySafe" :model="setCurrencySafe" :rules="safeRuleInline">
            <div style="margin-left: 70px; margin-bottom: 20px; color:#aaaaaa;padding-top:50px">
              <span style="margin-right: 30px">货币安全值设定： (设置值仅对单位用户)</span>
              <RadioGroup  v-model="sign" @on-change="radioChange">
                <Radio :label="1" style="margin-right: 20px">充值</Radio>
                <Radio :label="-1">消耗</Radio>
              </RadioGroup>
            </div>
            <div class="flex">
              <FormItem :label="(sign === 1 ? '每日充值额度安全值:' : '每日消耗额度安全值:')" prop="safe_day">
                <Input  type="number" style="width:200px" v-model="setCurrencySafe.safe_day" />
              </FormItem>
              <FormItem :label="(sign === 1 ? '每周充值额度安全值:' : '每周消耗额度安全值:')" style="margin: 0 50px" prop="safe_week">
                <Input  type="number" style="width:200px" v-model="setCurrencySafe.safe_week" />
              </FormItem>
                 <FormItem :label="(sign === 1 ? '每月充值额度安全值:' : '每月消耗额度安全值:')" prop="safe_month">
                <Input  type="number" style="width:200px" v-model="setCurrencySafe.safe_month" />
              </FormItem>
            </div>
            <div class="flex">
                <span style="margin-top: 5px">{{ (sign === 1 ? '充值时间间隔安全值' : '消耗时间间隔安全值')}}</span>
                <FormItem label="每" :label-width="60" prop="safe_space_time" >
                    <InputNumber   style="width:100px" v-model="setCurrencySafe.safe_space_time" />
                </FormItem>
                <FormItem label="分钟" :label-width="60" prop="safe_space_num">
                    <InputNumber   style="width:80px" v-model="setCurrencySafe.safe_space_num" />
                </FormItem>
                <span style="margin-top: 5px; margin-left:5px"> {{(sign === 1 ? '次充值' : '次消耗')}}</span>
            </div>
        </Form>
         <div class="button">
            <Button  type="primary"  @click="confirmSafe('setCurrencySafe')">保存安全值</Button>
         </div>
      </div>
  </div>
</template>
<script>
import { getCurrencyView, setCurrency, setCurrencySafe, getRiskManagementList, exportRiskManagementList, prohibitUserLogin, relieveUserLoginProhibit } from '@/api/data'
export default {
  data () {
    return {
      date_type: 1,
      type: 1,
      current: 1,
      per_page: 10,
      total: 1,
      minute: 0,
      time: 0,
      sign: 1,
      data: [],
      typeName: null,
      currentSet: {
        app_id: 1,
        currency_id: null,
        currency_name: null,
        currency_proportion: null
      },
      channel: [],
      currencyType: [],
      defaultType: [],
      defaultMoney: [],
      defaultDate: [{ date_type: 1, name: '天' }, { date_type: 2, name: '周' }, { date_type: 3, name: '月' }],
      searchData: {
        app_id: null,
        currency_id: null,
        date_type: 1,
        content: ''
      },
      setCurrencySafe: {
        app_id: 1,
        currency_id: null,
        safe_space_time: null,
        safe_space_num: null,
        safe_day: null,
        safe_week: null,
        safe_month: null,
        sign: 1
      },
      columns: [
        {
          title: '用户ID',
          key: 'user_id',
          align: 'center',
          width: '100px'
        },
        {
          title: '用户昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'username',
          align: 'center'
        },
        {
          title: '使用渠道',
          key: 'app_name',
          align: 'center'
        },
        {
          title: '使用类型',
          key: 'sign',
          align: 'center',
          width: '100px',
          render: (h, params) => {
            if (params.row.sign === 1) return h('div', {}, '充值')
            else return h('div', {}, '消耗')
          }
        },
        {
          title: '货币类型',
          key: 'currency_name',
          align: 'center',
          width: '100px'
        },
        {
          title: '货币额度',
          key: 'sum_money',
          align: 'center'
        },
        {
          title: '使用时间',
          key: 'date_time',
          align: 'center'
        },
        {
          title: '风控状态',
          key: 'username',
          align: 'center',
          render: (h, params) => {
            if (this.date_type === 1) {
              if (params.row.is_touch_safe === -1) return h('div', {}, params.row.sign === 1 ? '当天充值额度未超过安全值' : '当天消耗额度未超过安全值')
              else return h('div', { style: 'color: red' }, params.row.sign === 1 ? '当天充值额度已超过安全值' : '当天消耗额度已超过安全值')
            } else if (this.date_type === 2) {
              if (params.row.is_touch_safe === -1) return h('div', {}, params.row.sign === 1 ? '本周充值额度未超过安全值' : '本周消耗额度未超过安全值')
              else return h('div', { style: 'color: red' }, params.row.sign === 1 ? '本周充值额度已超过安全值' : '本周消耗额度已超过安全值')
            } else if (this.date_type === 3) {
              if (params.row.is_touch_safe === -1) return h('div', {}, params.row.sign === 1 ? '本月充值额度未超过安全值' : '本月消耗额度未超过安全值')
              else return h('div', { style: 'color: red' }, params.row.sign === 1 ? '本月充值额度已超过安全值' : '本月消耗额度已超过安全值')
            }
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: { type: 'primary', disabled: true },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: '提示',
                    content: params.row.status === 1 ? '确定封禁吗？' : '确定解除封禁吗？',
                    onOk: () => {
                      if (params.row.status === 1) {
                        this.bannedUser(params.row.user_id)
                      } else {
                        this.listBantUser(params.row.user_id)
                      }
                    }
                  })
                }
              }
            }, params.row.status === 1 ? '封禁' : '解除封禁')
          }
        }
      ],
      exportcolumns: [
        {
          title: '用户ID',
          key: 'user_id',
          align: 'center'
        },
        {
          title: '用户昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'username',
          align: 'center'
        },
        {
          title: '使用渠道',
          key: 'app_name',
          align: 'center'
        },
        {
          title: '使用类型',
          key: 'sign',
          align: 'center'
        },
        {
          title: '货币类型',
          key: 'currency_name',
          align: 'center'
        },
        {
          title: '货币额度',
          key: 'sum_money',
          align: 'center'
        },
        {
          title: '使用时间',
          key: 'date_time',
          align: 'center'
        },
        {
          title: '风控状态',
          key: 'is_touch_safe',
          align: 'center'
        },
        {
          title: '封禁状态',
          key: 'status',
          align: 'center'
        }
      ],
      ruleInline: {
        app_id: [{ required: true, message: '请选择使用渠道' }],
        currency_id: [{ required: true, message: '请选择货币类型' }],
        currency_name: [{ required: true, message: '请输入充值货币名称', trigger: 'blur' }]
      },
      safeRuleInline: {
        safe_space_time: [{ required: true, message: '请输入充值时间间隔安全值', type: 'number' }],
        safe_space_num: [{ required: true, message: '请输入充值时间间隔安全值', type: 'number' }],
        safe_day: [{ required: true, message: '请输入每日充值额度安全值', trigger: 'blur' }],
        safe_week: [{ required: true, message: '请输入每周充值额度安全值', trigger: 'blur' }],
        safe_month: [{ required: true, message: '请输入每月充值额度安全值', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    // 获取列表数据
    getDataList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchData
      }
      getRiskManagementList(obj).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
          this.defaultType = res.data.data.app_info
          this.defaultMoney = res.data.data.currency_info
          if (this.searchData.app_id === null) this.searchData.app_id = res.data.data.app_info[0].app_id
          if (this.searchData.currency_id === null) this.searchData.currency_id = res.data.data.currency_info[0].id
        }
      })
    },
    // 获取货币配置默认数据
    getCurrencyViewData () {
      var obj = {
        app_id: this.currentSet.app_id,
        currency_id: this.currentSet.currency_id
      }
      getCurrencyView(obj).then(res => {
        if (res.data.code === 200) {
          this.channel = res.data.data.app_info
          this.currencyType = res.data.data.currency_info
          if (this.currentSet.currency_id === null) this.currentSet.currency_id = Number(res.data.data.currency_info[0].id)
          if (this.setCurrencySafe.currency_id === null) this.setCurrencySafe.currency_id = Number(res.data.data.currency_info[0].id)
          if (this.currentSet.currency_proportion === null) this.currentSet.currency_proportion = res.data.data.currency_info[0].proportion
          if (this.currentSet.currency_name === null) this.currentSet.currency_name = res.data.data.currency_info[0].name
          this.setCurrencySafe.safe_day = res.data.data.currency_safe_info.safe_day
          this.setCurrencySafe.safe_week = res.data.data.currency_safe_info.safe_week
          this.setCurrencySafe.safe_month = res.data.data.currency_safe_info.safe_month
          if (this.typeName === null) this.typeName = res.data.data.currency_info[0].name
          if (res.data.data.currency_safe_space.safe_space) {
            var space = res.data.data.currency_safe_space.safe_space.split(':')
            this.setCurrencySafe.safe_space_time = Number(space[0])
            this.setCurrencySafe.safe_space_num = Number(space[1])
          }
        }
      })
    },
    // 货币类型改变事件
    currencyTypeChange (value) {
      this.currentSet.currency_id = null
      this.setCurrencySafe.safe_space_time = null
      this.setCurrencySafe.safe_space_num = null
      this.setCurrencySafe.safe_day = null
      this.setCurrencySafe.safe_week = null
      this.setCurrencySafe.safe_month = null
    },
    getMoreParams (items) {
      this.currentSet.currency_id = items.id
      this.currentSet.currency_proportion = items.proportion
      this.setCurrencySafe.currency_id = items.id
      this.typeName = items.name
      this.currentSet.currency_name = Number(items.id) === -1 ? '' : items.name
      this.getCurrencyViewData()
    },
    // 日期改变
    dateChange (value) {
      this.searchData.date_type = value
    },
    // 货币类型改变
    getmoneyChange (item) {
      this.searchData.currency_id = item.id
    },
    // 使用渠道改变
    defaultTypeChange (value) {
      this.searchData.app_id = value
      this.searchData.currency_id = null
      this.getDataList()
    },
    // radio值改变
    radioChange (value) {
      this.setCurrencySafe.sign = value
    },
    // 查询点击事件
    inquireClick () {
      this.current = 1
      this.total = 1
      this.date_type = this.searchData.date_type
      this.getDataList()
    },
    // 保存货币设置
    confirm (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          setCurrency(this.currentSet).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('保存货币设置成功')
              this.currentSet.currency_id = null
              this.currentSet.app_id = 1
              this.currentSet.currency_name = null
              this.currentSet.currency_proportion = null
              this.typeName = null
              this.$refs.currentSet.resetFields()
              this.getCurrencyViewData()
            }
          })
        }
      })
    },
    // 保存安全值
    confirmSafe (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          setCurrencySafe(this.setCurrencySafe).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('保存安全值成功')
              this.currentSet.currency_id = null
              this.currentSet.app_id = 1
              this.currentSet.currency_name = null
              this.currentSet.currency_proportion = null
              this.typeName = null
              this.$refs.setCurrencySafe.resetFields()
              this.getCurrencyViewData()
            }
          })
        }
      })
    },
    // tab切换
    handleTypeChange () {
      if (this.type === 2) {
        this.getCurrencyViewData()
      } else {
        this.getDataList()
      }
    },
    // 使用渠道值改变事件
    appChange (value) {
      this.currentSet.app_id = value
      this.setCurrencySafe.app_id = value
      this.currentSet.currency_id = null
      this.currentSet.currency_name = null
      this.currentSet.currency_proportion = null
      this.typeName = null
      this.setCurrencySafe.currency_id = null
      this.getCurrencyViewData()
    },
    // 封禁用户
    bannedUser (id) {
      prohibitUserLogin({ user_id: id }).then(res => {
        if (res.data.code === 200) {
          this.getDataList()
        }
      })
    },
    listBantUser (id) {
      relieveUserLoginProhibit({ user_id: id }).then(res => {
        if (res.data.code === 200) {
          this.getDataList()
        }
      })
    },
    // 导出数据
    exportData () {
      var obj = {
        ...this.searchData
      }
      exportRiskManagementList(obj).then(res => {
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            filename: '风控系统表',
            data: res.data.data.export_list,
            columns: this.exportcolumns
          })
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
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
.flex{
    display: flex;
    margin-left: 70px;
}
.button{
    width: 100%;
    text-align: center;
    margin-top: 100px
}
</style>
