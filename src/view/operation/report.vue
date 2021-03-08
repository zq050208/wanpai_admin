<template>
  <div>
    <Card>
    <template slot="title">举报列表</template>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
    <Table border :columns="columns" :data="data" ref="table"></Table>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
  </Card>
  <Modal v-model="reportModal" :width="600">
    <p slot="header" style="text-align:center">查看举报内容</p>
      <table style="width:560px">
      <tr>
        <td style="width:100px">举报分类</td>
        <td>{{reportData.report_reason}}</td>
      </tr>
      <tr>
        <td>被举报{{reportData.work}}</td>
        <td>{{reportData.name}}</td>
      </tr>
      <tr>
        <td>补充说明</td>
        <td >{{reportData.supplement}}</td>
      </tr>
      <tr>
        <td>相关图片</td>
        <td style="text-align: left">
          <div style="display: inline-block" v-for="item in reportData.images_url" :key="item.index">
            <img style="width:200px;height:180px; margin-right:10px;" :src="item" alt="">
          </div>
        </td>
      </tr>
    </table>
  </Modal>
  <!-- 处理弹框 -->
  <Modal v-model="disposeModal" :mask-closable="false" @on-cancel="resetForm">
     <p slot="header" style="text-align:center">举报处理</p>
      <p style="display:flex;align-items: center">
        <span style="margin-right:20px">*处理结果：</span>
        <Tabs :value="level" @on-click="handleTabChange">
        <TabPane label="举报失败" name="1"></TabPane>
        <TabPane label="举报成功" name="2"></TabPane>
        </Tabs>
      </p>
        <div v-show="Number(level) === 1">
          <Form ref='failedData' :model="failedData">
            <p style="padding:30px 0">
              <span style="margin-right:10px">*处理结果：</span>
               <Radio v-model="single">不符合举报条件</Radio>
            </p>
            <p>请输入备注（非必填）</p>
            <FormItem  prop="remark">
            <Input  v-model="failedData.remark" type="textarea" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入相关描述！" style="width: 100%" />
            </FormItem>
          </Form>
        </div>
        <div v-show="Number(level) === 2">
          <Form ref='successData' :model="successData" :rules="rules" style="margin-top:20px">
          <FormItem label="封禁渠道：" prop="prohibit_source">
          <Select style="width: 280px" v-model="successData.prohibit_source">
            <Option :value="item.id" v-for="item in prohibit_source" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
          <FormItem label="封禁原因：" prop="report_reason">
          <Select style="width: 280px" v-model="successData.report_reason">
            <Option :value="item.id" v-for="item in report_reason" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁类型：" prop="type">
          <Select style="width: 280px" v-model="successData.type">
            <Option :value="String(item.id)" v-for="item in type" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁时长：" prop="n" >
          <Input v-model="successData.n" style="width:200px" type="number" /> 小时
        </FormItem>
        <span style="font-size:10px">PS：封禁时长输入0小时表示举报成功但不封禁用户</span>
          </Form>

        </div>
        <div slot="footer">
            <Button type="primary" size="default" @click="submitData(Number(level) === 1? 'failedData' : 'successData')">提交</Button>
        </div>
  </Modal>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getReport, reportInfo, ignoreInfo, disposeInfo, getReportCheckCode, getDisposeViewData } from '@/api/data'
export default {
  components: {
    SearchForm
  },
  data () {
    return {
      reportModal: false,
      disposeModal: false,
      single: true,
      level: '1',
      total: 1,
      current: 1,
      per_page: 10,
      data: [],
      reportData: {},
      failedData: {},
      reportCheckCode: '',
      successData: {
        report_reason: null,
        n: 0,
        type: null,
        prohibit_source: null
      },
      report_reason: [],
      prohibit_source: [],
      type: [],
      searchParams: {
        type: 0,
        word: '',
        handle_id: '-1',
        app_id: -1
      },
      searchData: {
        type: 0,
        word: '',
        handle_id: '-1',
        app_id: -1
      },
      rules: {
        report_reason: [{ required: true, message: '请选择封禁原因' }],
        prohibit_source: [{ required: true, message: '请选择封禁渠道' }],
        n: [{ required: true, message: '请输入封禁时长' }],
        type: [{ required: true, message: '请选择封禁类型' }]
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = { ...this.searchData }
              this.current = 1
              this.getReportList()
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
                label: '全部',
                value: -1
              },
              {
                label: 'APP-小虎Hoo',
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
            label: '举报分类：',
            prop: 'type',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '淫秽色情',
                value: 1
              },
              {
                label: '涉及政治',
                value: 2
              },
              {
                label: '涉及军事',
                value: 3
              },
              {
                label: '谩骂侮辱',
                value: 4
              },
              {
                label: '垃圾广告',
                value: 5
              },
              {
                label: '血腥暴力',
                value: 6
              },
              {
                label: '其他',
                value: 7
              }
            ]
          },
          {
            name: 'Input',
            label: '关键词查询：',
            prop: 'word',
            placeholder: '请输入举报人或被举报人名称',
            style: {
              'width': '230px'
            }
          },
          {
            name: 'Select',
            label: '状态：',
            prop: 'handle_id',
            options: [
              {
                label: '全部',
                value: '-1'
              },
              {
                label: '未处理',
                value: '0'
              },
              {
                label: '已处理',
                value: '1'
              }
            ]
          }
        ]
      },
      columns: [
        {
          title: 'id',
          key: 'id',
          align: 'center',
          width: '80px'
        },
        {
          title: '举报分类',
          key: 'report_reason',
          align: 'center'
        },
        {
          title: '产品',
          key: 'source',
          align: 'center'
        },
        {
          title: '对象',
          key: 'report_type',
          align: 'center',
          render: (h, params) => {
            if (params.row.report_type === 1) return h('div', {}, '内容 ')
            else if (params.row.report_type === 2) return h('div', {}, '评论')
            else if (params.row.report_type === 3) return h('div', {}, '用户')
            else if (params.row.report_type === 4) return h('div', {}, '派对')
            else if (params.row.report_type === 5) return h('div', {}, '评价')
          }
        },
        {
          title: '举报人',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '被举报人',
          key: 'report_user_nickname',
          align: 'center'
        },
        {
          title: '举报时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '内容',
          key: 'content',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'success' },
                on: {
                  click: () => {
                    this.reportDetail(params.row.id)
                  }
                }
              }, '查看举报内容')
            ])
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.handle_id === 0 ? 'success' : 'default'
                },
                on: {
                  click: () => {
                    if (params.row.handle_id === 0) {
                      this.disposeClick(params.row.id)
                      this.getReportData(params.row.id)
                    }
                  }
                }
              }, params.row.handle_id === 0 ? '处理' : '已处理')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getReportList()
  },
  methods: {
    // 获取举报成功的封禁数据
    getReportData (ids) {
      getDisposeViewData({ id: ids }).then(res => {
        this.report_reason = res.data.data.prohibit_reason_list
        this.prohibit_source = res.data.data.prohibit_source
        this.type = res.data.data.prohibit_source[0].type_list
      })
    },
    // 获取列表数据
    getReportList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      getReport(obj).then(res => {
        this.data = res.data.data.data.data
        this.current = res.data.data.data.current_page
        this.per_page = res.data.data.data.per_page
        this.total = res.data.data.data.total
      })
    },
    // 获取校验码
    getCheckCode () {
      getReportCheckCode().then(res => {
        this.successData.checkcode = res.data.data.checkcode
      })
    },
    // 举报详情
    reportDetail (ids) {
      reportInfo({ id: ids }).then(res => {
        if (res.data.code === 200) {
          if (res.data.data.report_type === 1) {
            this.reportData.work = '内容'
          } else if (res.data.data.report_type === 2) {
            this.reportData.work = '评论'
          } else if (res.data.data.report_type === 3) {
            this.reportData.work = '用户'
          } else if (res.data.data.report_type === 4) {
            this.reportData.work = '派对'
          } else {
            this.reportData.work = '评价'
          }
          this.reportData.name = res.data.data.name
          this.reportData.report_reason = res.data.data.report_reason
          this.reportData.supplement = res.data.data.supplement
          this.reportData.images_url = res.data.data.images_url
        }
        this.reportModal = true
      })
    },
    // tab 切换
    handleTabChange (tab) {
      if (tab !== this.level) {
        this.level = tab
        this.resetSuccessForm()
      }
    },
    // 举报弹窗
    disposeClick (id) {
      this.getCheckCode()
      this.disposeModal = true
      this.failedData.id = id
      this.successData.id = id
    },
    // 举报提交
    submitData (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (Number(this.level) === 1) {
            ignoreInfo(this.failedData).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('提交成功')
                this.disposeModal = false
                this.getReportList()
                this.level = '1'
                this.resetSuccessForm()
              }
            })
          } else {
            disposeInfo(this.successData).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('提交成功')
                this.disposeModal = false
                this.getReportList()
                this.resetfaildForm()
                this.level = '1'
              }
            })
          }
        }
      })
    },
    // 重置表单
    resetfaildForm () { this.$refs.failedData.resetFields() },
    resetSuccessForm () { this.$refs.successData.resetFields() },
    resetForm () {
      this.level = '1'
      this.resetfaildForm()
      this.resetSuccessForm()
    },
    // 页码改变
    handlePageChange (page) {
      this.current = page
      this.getReportList()
    },
    // size 改变
    handlePageSizeChange (size) {
      this.per_page = size
      this.getReportList()
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
table,
tr,
td{
  border: 1px solid #d7d7d7;
  border-collapse:collapse;
  text-align: center;
  padding: 10px
}
td{

  word-break: break-all
}
</style>
