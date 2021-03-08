<template>
  <div>
    <Card>
      <RadioGroup v-model="type" type="button"  @on-change="handleTypeChange">
        <Radio :label="0">个人管理</Radio>
        <Radio :label="1">组织管理</Radio>
      </RadioGroup>
      <SearchForm ref="searchForm" title="筛选数据" :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <Card>
      <p slot="title">数据列表</p>
      <div slot="extra">
        <Button style="margin-right: 20px" icon="md-cloud-upload" type="primary" @click="exportData">导出数据</Button>
      </div>
      <Table border :columns="type === 0 ? columns1: columns2 " :data="dataList" ref="table"></Table>
       <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- 拒绝弹框 -->
    <Modal v-model="refuseModel" :width="400">
        <p style="text-align: center; margin-bottom:20px">填写拒绝原因</p>
        <Form ref='refusedData' :model="refusedData" :rules="rules">
          <FormItem  prop="refuse_reason">
            <Input v-model="refusedData.refuse_reason"  type="textarea" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入相关描述！"  />
          </FormItem>
        </Form>
        <div slot="footer">
            <Button type="primary" size="default" @click="submitData('refusedData')">提交</Button>
        </div>
    </Modal>
    <!-- 查看身份证 -->
    <Modal v-model="idcardModel" title="查看身份证正反面">
        <Carousel v-model="value1" :loop="true" :height="250" v-if="idcardModel" >
        <CarouselItem><div class="demo-carousel"><img :src="identityImage.id_card_front_img" alt="" ></div></CarouselItem>
        <CarouselItem><div class="demo-carousel"><img :src="identityImage.id_card_reverse_img" alt="" ></div></CarouselItem>
      </Carousel>
    </Modal>
    <!-- 查看详情 -->
    <Modal v-model="detailModel" :width="400">
      <p style="text-align: center; margin-bottom:20px">查看详情</p>
      <div style="padding-bottom:10px">审核状态：<span>{{detailData.status === 1? '已通过' : '已拒绝'}}</span></div>
      <div style="padding-bottom:10px">申请时间： <span>{{detailData.applytime}}</span></div>
      <div style="padding-bottom:10px">审核时间： <span>{{detailData.checktime}}</span></div>
      <div style="padding-bottom:10px">审核人： <span>{{detailData.admin_name}}</span></div>
      <div v-if="detailData.status === 2" style="display: flex">拒绝原因：<div class="detailbox">{{detailData.refuse_reason}}</div></div>
    </Modal>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getPartyManagerList, getPartyManagerdel, partyManagerEditStatus, exportPartyManager } from '@/api/data.js'
export default {
  components: { SearchForm },
  data () {
    return {
      refuseModel: false,
      idcardModel: false,
      detailModel: false,
      value1: 0,
      type: 0,
      current: 1,
      per_page: 10,
      total: 1,
      dataList: [],
      detailData: {},
      identityImage: {},
      searchData: {
        keyword: '',
        status: -1,
        date: ''
      },
      searchParams: {},
      refusedData: { refuse_reason: '' },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.current = 1
              this.searchParams = { ...this.searchData }
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'keyword',
            label: '查询内容',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'Select',
            label: '状态',
            prop: 'status',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '未审核',
                value: 0
              },
              {
                label: '已通过',
                value: 1
              },
              {
                label: '已拒绝',
                value: 2
              }
            ]
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '申请时间：'
          }
        ]
      },
      rules: {
        refuse_reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
      },
      columns1: [
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
          align: 'center'
        },
        {
          title: '微信号',
          key: 'wechat',
          align: 'center'
        },
        {
          title: 'QQ号',
          key: 'qq',
          align: 'center'
        },
        {
          title: '身份证号码',
          key: 'id_card',
          align: 'center'
        },
        {
          title: '身份证正反面',
          key: 'identityImage',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: { type: 'primary', size: 'small' },
              on: {
                click: () => {
                  this.identityImage.id_card_front_img = params.row.id_card_front_img
                  this.identityImage.id_card_reverse_img = params.row.id_card_reverse_img
                  this.idcardModel = true
                }
              }
            }, '查看')
          }
        },
        {
          title: '是否担任相关工作',
          key: 'is_job',
          align: 'center',
          width: '100px',
          render: (h, params) => {
            return h('div', {}, params.row.is_job === 1 ? '是' : '否')
          }
        },
        {
          title: '管理优势描述',
          key: 'desc',
          align: 'center'
        },
        {
          title: '派对名称',
          key: 'party_name',
          align: 'center'
        },
        {
          title: '提交申请时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          width: '220px',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: params.row.status === 0 ? 'success' : (params.row.status === 1) ? 'warning' : 'default', size: 'small' },
                style: { margin: '0px 10px 0px 0px' },
                on: {
                  click: () => {
                    if (params.row.status === 0) {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确认该用户通过审核吗?',
                        onOk: () => {
                          this.passData(params.row.id)
                        }
                      })
                    }
                  }
                }
              }, params.row.status === 0 ? '通过' : (params.row.status === 1) ? '已通过' : '已拒绝'),
              h('Button', {
                props: { type: 'info', size: 'small' },
                style: { display: params.row.status === 1 || params.row.status === 2 ? '' : 'none' },
                on: {
                  click: () => {
                    this.detailData.status = params.row.status
                    this.detailData.applytime = params.row.create_time
                    this.detailData.checktime = params.row.check_time
                    this.detailData.admin_name = params.row.admin_name
                    this.detailData.refuse_reason = params.row.refuse_reason
                    this.detailModel = true
                  }
                }
              }, '查看'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                style: { margin: '0px 0px 0px 10px' },
                on: {
                  click: () => {
                    if (params.row.status === 1 || params.row.status === 2) {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '删除后将不可复原，确认删除该管理吗?',
                        onOk: () => {
                          this.deleteClick(params.row.id)
                        }
                      })
                    } else {
                      this.refuseModel = true
                      this.refusedData.id = params.row.id
                      this.refusedData.status = 2
                    }
                  }
                }
              }, params.row.status === 1 || params.row.status === 2 ? '删除' : '拒绝')
            ])
          }
        }
      ],
      columns2: [
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
          align: 'center'
        },
        {
          title: '微信号',
          key: 'wechat',
          align: 'center'
        },
        {
          title: 'QQ号',
          key: 'qq',
          align: 'center'
        },
        {
          title: '组织名称',
          key: 'team_name',
          align: 'center'
        },
        {
          title: '角色',
          key: 'team_role',
          align: 'center'
        },
        {
          title: '派对名称',
          key: 'party_name',
          align: 'center'
        },
        {
          title: '提交申请时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          width: '220px',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: params.row.status === 0 ? 'success' : (params.row.status === 1) ? 'warning' : 'default', size: 'small' },
                style: { margin: '0px 10px 0px 0px' },
                on: {
                  click: () => {
                    if (params.row.status === 0) {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确认该用户通过审核吗?',
                        onOk: () => {
                          this.passData(params.row.id)
                        }
                      })
                    }
                  }
                }
              }, params.row.status === 0 ? '通过' : (params.row.status === 1) ? '已通过' : '已拒绝'),
              h('Button', {
                props: { type: 'info', size: 'small' },
                style: { display: params.row.status === 1 || params.row.status === 2 ? '' : 'none' },
                on: {
                  click: () => {
                    this.detailData.status = params.row.status
                    this.detailData.applytime = params.row.create_time
                    this.detailData.checktime = params.row.check_time
                    this.detailData.admin_name = params.row.admin_name
                    this.detailData.refuse_reason = params.row.refuse_reason
                    this.detailModel = true
                  }
                }
              }, '查看'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                style: { margin: '0px 0px 0px 10px' },
                on: {
                  click: () => {
                    if (params.row.status === 1 || params.row.status === 2) {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '删除后将不可复原，确认删除该管理吗?',
                        onOk: () => {
                          this.deleteClick(params.row.id)
                        }
                      })
                    } else {
                      this.refuseModel = true
                      this.refusedData.id = params.row.id
                      this.refusedData.status = 2
                    }
                  }
                }
              }, params.row.status === 1 || params.row.status === 2 ? '删除' : '拒绝')
            ])
          }
        }
      ],
      exportColumn1: [
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
          title: '微信号',
          key: 'wechat',
          align: 'center'
        },
        {
          title: 'QQ号',
          key: 'qq',
          align: 'center'
        },
        {
          title: '身份证号码',
          key: 'id_card',
          align: 'center'
        },
        {
          title: '身份证正面',
          key: 'id_card_front_img',
          align: 'center'
        },
        {
          title: '身份证反面',
          key: 'id_card_reverse_img',
          align: 'center'
        },
        {
          title: '是否担任相关工作',
          key: 'is_job',
          align: 'center',
          width: '100px',
          render: (h, params) => {
            return h('div', {}, params.row.is_job === 1 ? '是' : '否')
          }
        },
        {
          title: '管理优势描述',
          key: 'desc',
          align: 'center'
        },
        {
          title: '派对名称',
          key: 'party_name',
          align: 'center'
        },
        {
          title: '提交申请时间',
          key: 'create_time',
          align: 'center'
        }
      ]
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    // 获取列表
    getDataList () {
      const params = { ...this.searchParams }
      const { date } = this.searchParams
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      if (params.status === -1) {
        params.status = ''
      }
      var data = {
        page: this.current,
        per_page: this.per_page,
        is_team: this.type,
        ...params
      }
      getPartyManagerList(data).then(res => {
        if (res.data.code === 200) {
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
          this.dataList = res.data.data.data
        }
      })
    },
    // 删除
    deleteClick (ids) {
      getPartyManagerdel({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.getDataList()
        }
      })
    },
    // 提交拒绝原因
    submitData (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          partyManagerEditStatus(this.refusedData).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('拒绝成功')
              this.refuseModel = false
              this.$refs.refusedData.resetFields()
              this.current = 1
              this.getDataList()
            }
          })
        }
      })
    },
    // 通过提交
    passData (ids) {
      var obj = {
        id: ids,
        status: 1
      }
      partyManagerEditStatus(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('通过成功')
          this.current = 1
          this.getDataList()
        }
      })
    },
    handleTypeChange (tab) {
      this.type = tab
      this.searchParams = {
        keyword: '',
        status: -1,
        date: ''
      }
      this.$refs.searchForm.reset()
      this.getDataList()
    },
    // 导出数据
    exportData () {
      const params = { ...this.searchParams }
      const { date } = this.searchParams
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      if(params.status === -1) {
        params.status = ''
      }
      var data = {
        page: this.current,
        per_page: this.per_page,
        is_team: this.type,
        ...params
      }
      exportPartyManager(data).then(res => {
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            quoted: true,
            separator: ',=',
            filename: this.type === 0 ? '派对管理个人审核表' : '派对管理组织审核表',
            columns: this.type === 0 ? this.exportColumn1 : this.columns2,
            data: res.data.data.data
          })
        }
      })
    },
    // 分页
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    handlePageSizeChange (size) {
      this.current = 1
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
.detailbox{
  border: 1px solid #ccc;
  min-height: 100px;
  width: 250px;
  padding: 10px 20px;
  word-break: break-all;
  word-wrap: break-word
}
.demo-carousel{
  width: 100%;
  height: 250px;
}
.demo-carousel img{
  width: 100%;
  height: 100%;
  margin-top: 20px
}
.ivu-carousel-track {
  width: 100% !important
}
</style>
