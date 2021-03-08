<template>
  <div>
    <Card>
      <SearchForm title="意见反馈列表" :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <Card>
       <Table border :columns="columns" :data="data" ref="table"></Table>
       <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <Modal v-model="isShowModel" :mask-closable="false" @on-cancel="resetForm">
      <Form ref='formData' :model="formData" :rules="rules">
        <FormItem label="" prop="feedback_textarea">
          <Input  v-model="formData.feedback_textarea" type="textarea"
            :autosize="{minRows: 5,maxRows: 18}" maxlength='800'
            show-word-limit placeholder="说点什么~" style="width: 460px" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" size="default" @click="submitData('formData')">确认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getFeedback, disposeFeedback, feedbackReplay, feedbackDelete } from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    return {
      total: 1,
      current: 1,
      per_page: 10,
      replayStatus: true,
      data: [],
      formData: {
        feedback_textarea: '',
        feedback_id: undefined
      },
      rules: {
        feedback_textarea: [{ required: true, message: '请说点什么~' }]
      },
      searchParams: {
        date: '',
        // is_handle: -1
        status: 0
      },
      searchData: {
        date: '',
        // is_handle: -1
        status: 0
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              let tempStatus = this.searchData.status
              if (+tempStatus === 0 && this.columns.length === 7) {
                this.replayStatus = true
                this.columns.splice(3, 1)
              }
              if (+tempStatus === 1 && this.columns.length === 6) {
                this.replayStatus = false
                this.columns.splice(3, 0, {
                  title: '回复内容',
                  key: 'problem_desc',
                  key: 'replay_content',
                  align: 'center'
                })
              }
              this.searchParams = { ...this.searchData }
              this.current = 1
              this.getFeedbackList()
            }
          }
        ],
        components: [
          {
            name: 'SelectDate',
            prop: 'date',
            label: '反馈时间'
          },
          // 2.1前
          // {
          //   name: 'Select',
          //   label: '状态：',
          //   prop: 'is_handle',
          //   options: [
          //     {
          //       label: '全部',
          //       value: -1
          //     },
          //     {
          //       label: '未处理',
          //       value: 0
          //     },
          //     {
          //       label: '已处理',
          //       value: 1
          //     }
          //   ]
          // },
          // 2.1
          {
            name: 'Select',
            label: '状态',
            prop: 'status',
            options: [
              {
                label: '未回复',
                value: 0
              },
              {
                label: '已回复',
                value: 1
              }
            ],
            onChange: (event) => {
              console.log(event)
              if (event === 0) {
                // this.columns.splice(3, 1)
              } else if (event === 1) {
                // this.columns.splice(3, 0, {
                //   title: '回复内容',
                //   key: 'problem_desc',
                //   align: 'center',
                //   render: (h, params) => {
                //     return h('div', params.row.replay_content ? params.row.replay_content : '--')
                //   }
                // })
              }
            }
          },
          {
            name: 'Input',
            label: '关键词查询',
            prop: 'word',
            placeholder: '请输入昵称、联系方式或内容搜索',
            // placeholder: '请输入ID、联系方式或反馈内容搜索',
            style: {
              'width': '260px'
            }
          }
        ]
      },
      columns: [
        {
          title: '反馈用户昵称',
          key: 'nickname',
          align: 'center'
        },
        // {
        //   title: '反馈用户ID',
        //   key: 'user_id',
        //   align: 'center'
        // },
        {
          title: '联系方式',
          key: 'mobile',
          align: 'center'
        },
        {
          title: '反馈内容',
          key: 'problem_desc',
          align: 'center'
        },
        // {
        //   title: '反馈类型',
        //   key: 'feedback_type',
        //   align: 'center',
        //   render: (h, params) => {
        //     if (params.row.feedback_type === 1) return h('div', {}, '吐槽 ')
        //     else if (params.row.feedback_type === 2) return h('div', {}, 'bug')
        //     else if (params.row.feedback_type === 3) return h('div', {}, '产品建议')
        //     else if (params.row.feedback_type === 4) return h('div', {}, '投诉')
        //     else if (params.row.feedback_type === 5) return h('div', {}, '其他')
        //     else return h('div', {}, '--')
        //   }
        // },
        // 2.1.0修改后直接取反馈类型
        {
          title: '反馈类型',
          key: 'type_name',
          align: 'center',
          render: (h, params) => {
            if (!params.row.type_name) {
              return h('div', {}, '--')
            } else {
              return h('div', params.row.type_name)
            }
          }
        },
        {
          title: '反馈时间',
          key: 'create_time',
          align: 'center'
        },
        // 2.1前
        // {
        //   title: '操作',
        //   key: 'operation',
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('div', [
        //       h('Button', {
        //         props: {
        //           type: params.row.is_handle === 0 ? 'success' : 'default'
        //         },
        //         on: {
        //           click: () => {
        //             if (params.row.is_handle === 0) this.disposeData(params.row.id)
        //           }
        //         }
        //       }, params.row.is_handle === 0 ? '处理' : '已处理')
        //     ])
        //   }
        // },
        // 2.1
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              this.replayStatus && h('Button', {
                props: {
                  type: 'primary'
                },
                style: {
                  'margin-right': '10px'
                },
                on: {
                  click: () => {
                    this.feedbackList(params.row)
                  }
                }
              }, '回复'),
              h('Button', {
                props: {
                  type: 'error'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确认删除吗？',
                      onOk: () => {
                        this.deleteList(params.row.id)
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      isShowModel: false
    }
  },
  mounted () {
    this.getFeedbackList()
  },
  methods: {
    // 回复提交
    submitData (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let data = {
            id: this.formData.feedback_id,
            replay_content: this.formData.feedback_textarea
          }
          console.log(this.data.length)
          feedbackReplay(data).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('回复成功!')
              if (this.data.length === 1 && this.current > 1) {
                this.current--
              }
              this.getFeedbackList()
              console.log('data:', this.data)
            }
          })
          this.resetForm()
        }
      })
    },
    // 重置表单
    resetSuccessForm (name) {
      this.isShowModel = false
      this.$refs[name].resetFields()
      this.formData.feedback_id = undefined
    },
    resetForm () {
      this.resetSuccessForm('formData')
    },
    // 列表操作难
    feedbackList (row) {
      this.isShowModel = true
      this.formData.feedback_id = row.id
    },
    deleteList (id) {
      let data = {
        id: id
      }
      feedbackDelete(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功!')
          console.log(this.data.length)
          if (this.data.length === 1 && this.current > 1) {
            this.current--
          }
          this.getFeedbackList()
        }
      })
      this.formData.feedback_id = undefined
    },
    //   获取数据
    getFeedbackList () {
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
      getFeedback(data).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
        }
      })
    },
    // 处理反馈
    disposeData (ids) {
      disposeFeedback({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('处理成功')
          this.current = 1
          this.getFeedbackList()
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.getFeedbackList()
    },
    handlePageSizeChange (size) {
      this.current = 1
      this.per_page = size
      this.getFeedbackList()
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
