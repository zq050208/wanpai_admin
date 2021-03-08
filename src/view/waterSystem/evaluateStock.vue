<template>
  <div>
    <Tabs type="card">
      <Tab-pane label="未使用评价">
        <Card :padding="0">
          <div style="padding: 20px">
            <cardHeader
              title="未使用评价"
              leftContent="删除评价"
              rightContent="导入评价"
              @on-left-click="leftBtnClick"
              @on-right-click="rightBtnClick"
            />
          </div>
          <div class="layout">
            <!--左侧栏-->
            <div class="left-sider">
              <!--搜索-->
              <div style="padding: 5px">
                <Input
                  placeholder="搜索群组"
                  :search="true"
                  :value="keyword"
                  @on-search="onSearch"
                  style="width: auto"
                />
              </div>
              <!--分组栏-->
              <div style="height: 540px; overflow-y: scroll;">
                <div
                  v-for="(item, i) in list"
                  @click="show(i)"
                  :key="i"
                  style="border-bottom: 1px solid #dcdee2; box-sizing: border-box"
                >
                  <Dropdown
                    trigger="contextMenu"
                    :transfer="true"
                    @on-click="drop"
                    @on-visible-change="menuChange(i)"
                    style="width: 100%;"
                  >
                    <div style="position: relative; height: 30px; line-height: 30px;">
                      <span
                        :class="(selected && currentIndex === i)? 'selected' : ''"
                        style="padding-left: 10px;"
                      >{{item.name}}</span>
                      <Icon
                        type="ios-arrow-forward"
                        style="position: absolute; right: 10px; top: 10px"
                      ></Icon>
                    </div>
                    <DropdownMenu slot="list">
                      <DropdownItem name="rename">重命名</DropdownItem>
                      <DropdownItem name="istop" :divided="true">置顶</DropdownItem>
                      <DropdownItem name="moveUp" :divided="true">上移</DropdownItem>
                      <DropdownItem name="moveDown" :divided="true">下移</DropdownItem>
                      <DropdownItem name="delete" :divided="true" style="color: #ed4014">删除</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
              <div>
                <Button
                  type="primary"
                  style="width: 100%;border-radius: 0;border-bottom: 1px solid #cccccc"
                  :disabled="disabled"
                  @click="showGroupAssess"
                >新增群组评价</Button>
                <Button type="primary" style="width: 100%;border-radius: 0" @click="showGroup">新增群组</Button>
              </div>
            </div>
            <!--内容-->
            <Layout :style="{marginLeft: '200px'}">
              <Content style="min-height: 650px;background: #ffffff;">
                <SearchForm :searchForm="searchForm" :searchData="searchData" />
                <Table
                  height="450"
                  :columns="columns"
                  :data="data"
                  @on-selection-change="selectionChange"
                ></Table>
                <Page
                  class="page"
                  show-elevator
                  show-total
                  border="true"
                  :current="current"
                  :total="total"
                  :page-size="per_page"
                  @on-change="pageChange"
                />
              </Content>
            </Layout>
          </div>
        </Card>
      </Tab-pane>
      <Tab-pane label="已使用评价">
        <Card :padding="0">
          <div style="padding: 20px">
            <cardHeader
              title="已使用评价"
              rightContent="导出评价"
              :loading="loading"
              @on-right-click="exportGroupAssess"
            />
          </div>
          <div class="layout">
            <Content style="min-height: 680px;background: #ffffff;">
              <Table :columns="columns1" :data="data1" ref="table"></Table>
              <Page
                class="page"
                show-elevator
                show-total
                border="true"
                :current="current1"
                :total="total1"
                :page-size="per_page"
                @on-change="pageChange1"
              />
            </Content>
          </div>
        </Card>
      </Tab-pane>
    </Tabs>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import groupTable from '@/components/waterSystem/group-table'
import cardHeader from '@/components/waterSystem/card-header'
import {
  getAssessCode,
  getGroupIndex,
  getEvaluateList,
  getAssessByGroup,
  addGroup,
  groupRename,
  assessGroupSort,
  exportGroupAssess,
  groupAssess,
  delAssess,
  delGroupAssess
} from '@/api/data'
import { getToken } from '@/libs/util'
import excel from '@/libs/excel'
const allGroup = [{ id: 0, name: '未分组' }]
const arr1 = [{ type: 'selection', width: 60, align: 'center' }]
const arr2 = [
  { title: '游戏名', key: 'game_name', width: 100 },
  { title: '标题', key: 'title', width: 150 },
  { title: '评分', key: 'score', width: 100 },
  { title: '观点', key: 'viewpoint' },
  { title: '评价内容', key: 'content' }
]
export default {
  components: { cardHeader, SearchForm, groupTable },
  data () {
    return {
      searchData: {
        range: ''
      },
      searchForm: {
        actions: [
          {
            text: '搜索',
            type: 'primary',
            handle: () => {
              this.current = 1
              this.searchParams = {
                game_name: this.searchData.range,
                status: this.status
              }
              if (this.currentIndex === 0) {
                this.getEvaluateList(1)
              } else {
                this.getAssessByGroup()
              }
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'range',
            label: '游戏名：'
          }
        ]
      },
      searchParams: {}, // 搜索内容
      list: [...allGroup], // 群组列表
      groupId: [], // 选择分组ID
      disabled: true, // 新增群组评价按钮开启状态
      keyword: '', // 群组搜索关键字
      selected: true, // 是否左键点击
      group_id: 0, // 分组id
      checkcode: '', // 校验码
      currentIndex: 0, // 当前分组选择项
      forwardIndex: 0, // 右键选择项
      val: '', // 重命名内容
      addVal: '', // 新增分组名
      selection: [], // 当前选中数据
      loading: false, // card2 右边按钮状态
      per_page: 10, // 每页条数
      current: 1, // 当前页
      current1: 1,
      total: 1, // 总页数
      total1: 1,
      last_page: 1, // 最后页码
      last_page1: 1,
      columns: [...arr1, ...arr2],
      columns1: [...arr2],
      data: [],
      data1: []
    }
  },
  mounted () {
    this.getGroupIndex()
    this.getAssessByGroup()
    this.getEvaluateList(2)
    setTimeout(() => {
      this.getEvaluateList(1)
    }, 500)
  },
  methods: {
    /**
     * 群组列表
     **/
    getGroupIndex () {
      getGroupIndex({ keyword: this.keyword }).then(res => {
        if (res.data.code === 200) {
          this.list = [...allGroup, ...res.data.data]
        }
      })
    },
    /**
     * 群组评价列表
     **/
    getAssessByGroup () {
      let data = {
        page: this.current,
        per_page: this.per_page,
        group_id: this.group_id
      }
      getAssessByGroup(data).then(res => {
        if (res.data.code === 200) {
          let data = res.data.data
          this.data = data.data
          this.total = data.total
          this.last_page = data.last_page
        }
      })
    },
    /**
     * 评价列表
     **/
    getEvaluateList (status) {
      let data = {
        page: status === 1 ? this.current : this.current1,
        per_page: this.per_page,
        status: status,
        ...(status === 1 ? this.searchParams : [])
      }
      getEvaluateList(data).then(res => {
        if (res.data.code === 200) {
          if (status === 1) {
            this.data = res.data.data.data
            this.total = res.data.data.total
            this.last_page = data.last_page
          } else {
            this.data1 = res.data.data.data
            this.total1 = res.data.data.total
            this.last_page1 = data.last_page
          }
        }
      })
    },
    /**
     * 群组排序
     * @param type 排序方式 1=上移 2=下移 3=置顶
     **/
    assessGroupSort (type) {
      let data = {
        group_id: this.group_id,
        sort_type: type
      }
      assessGroupSort(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          // 当前左键选择与右键选择的群组一致时，改变选中状态位置
          if (type === 1 && this.currentIndex === this.forwardIndex) {
            this.currentIndex--
          } else if (type === 2 && this.currentIndex === this.forwardIndex) {
            this.currentIndex++
          } else if (type === 3 && this.currentIndex === this.forwardIndex) {
            this.currentIndex = 1
          }
          this.getGroupIndex()
        }
      })
    },
    /**
     * 添加分组
     **/
    addGroup () {
      let data = { checkcode: this.checkcode, name: this.addVal }
      addGroup(data).then(res => {
        this.addVal = ''
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.getGroupIndex()
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    /**
     * 分组重命名
     **/
    groupRename () {
      groupRename({ group_id: this.group_id, name: this.val }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.getGroupIndex()
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    /**
     * 删除群组
     **/
    delGroupAssess () {
      delGroupAssess({ group_id: this.group_id }).then(res => {
        if (res.data.code === 200) {
          this.group_id = 0
          this.currentIndex = 0
          this.current = 1
          this.$Message.success('成功')
          if (this.currentIndex === 0) {
            this.getEvaluateList(1)
          } else {
            this.getAssessByGroup()
          }
          this.getGroupIndex()
        }
      })
    },
    /**
     * 搜索按钮
     **/
    onSearch (value) {
      this.keyword = value
      this.getGroupIndex()
    },
    /**
     * card1 左边按钮
     **/
    leftBtnClick () {
      if (this.selection.length) {
        this.$Modal.confirm({
          title: '提示',
          content: '确定删除吗？',
          onOk: () => {
            let assess_ids = []
            this.selection.forEach(item => {
              assess_ids.push(item.id)
            })
            let params = {
              group_id: this.group_id,
              assess_ids: JSON.stringify(assess_ids)
            }
            delAssess(params).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('成功')
                if (this.current === this.last_page) {
                  this.current--
                  if (this.current === 0) {
                    this.current = 1
                  }
                }
                if (this.currentIndex === 0) {
                  this.getEvaluateList(1)
                } else {
                  this.getAssessByGroup()
                }
              } else {
                this.$Message.error(res.data.msg)
              }
            })
          }
        })
      } else {
        this.$Message.error('请选择需要删除项')
      }
    },
    /**
     * card1 右边按钮
     **/
    rightBtnClick () {
      let action = server.BASE_URL + 'AssessLibrary/import'
      let token = getToken()
      this.$Modal.info({
        okText: '关闭',
        render: (h) => {
          return h('div', [
            h(
              'upload',
              {
                style: {
                  textAlign: 'center',
                  height: '100px',
                  lineHeight: '100px',
                  cursor: 'pointer'
                },
                props: {
                  action: action,
                  ref: 'upload',
                  type: 'drag',
                  name: 'excel_data',
                  headers: { token: token },
                  format: ['xls', 'xlsx', 'csv'],
                  'show-upload-list': false,
                  'on-success': this.handleSuccessUpload
                }
              },
              '上传文件,支持xls、xlsx、csv格式。'
            ),
            h(
              'div',
              { style: { marginTop: '10px' } },
              '备注： 一次最多5000条数据'
            )
          ])
        }
      })
    },
    /**
     * card2 右边按钮 导出
     **/
    exportGroupAssess () {
      this.loading = true
      exportGroupAssess({}).then(res => {
        this.loading = false
        if (res.data.code === 200) {
          let key = []
          let title = []
          this.columns1.forEach(item => {
            key.push(item.key)
            title.push(item.title)
          })
          excel.export_array_to_excel({
            title: title,
            key: key,
            data: res.data.data.assess_list,
            autoWidth: true,
            filename: `已使用评价`
          })
        }
      })
    },
    formatExcelData (data) {
      var arr = []
      var self = this
      var dateArr = ['createDate', 'fixedDate', 'reportDate']
      _.forEach(data, function (v) {
        for (var k in v) {
          if (typeof v[k] === 'string') {
            v[k] = v[k].replace(/\n/g, '')
          }
        }
        arr.push(v)
      })
      return arr
    },
    /**
     * 上传文件成功回调
     * @param res
     * @param file
     **/
    handleSuccessUpload (res, file) {
      if (res.code === 200) {
        this.$Modal.remove()
        this.$Message.success({ content: res.msg })
        this.group_id = 0
        this.currentIndex = 0
        this.current = 1
        this.getEvaluateList(1)
      } else {
        this.$Message.error({ content: res.msg })
      }
    },
    /**
     * 分组右键触发
     **/
    menuChange (i) {
      this.forwardIndex = i
    },
    /**
     * 获取校验码
     **/
    getAssessCode (cb) {
      getAssessCode().then(res => {
        if (res.data.code === 200) {
          cb(res.data.data.checkcode)
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    /**
     * 添加群组评价
     **/
    groupAssess () {
      let assess_ids = []
      this.selection.forEach(item => {
        assess_ids.push(item.id)
      })
      let data = {
        checkcode: this.checkcode,
        group_ids: JSON.stringify(this.groupId),
        assess_ids: JSON.stringify(assess_ids)
      }
      groupAssess(data).then(res => {
        if (res.data.code === 200) {
          this.disabled = true
          this.current = 1
          this.$Message.success('成功')
          if (this.currentIndex === 0) {
            this.getEvaluateList(1)
          } else {
            this.getAssessByGroup()
          }
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    /**
     * 设置选择的群组ID
     * @param list 所选群组
     **/
    setGroupId (list) {
      this.groupId = list
    },
    /**
     * 新增分组评价弹窗显示
     **/
    showGroupAssess () {
      this.getAssessCode(res => {
        this.checkcode = res
        let list = this.list.slice(1)
        this.$Modal.confirm({
          title: '选择分组',
          render: (h, params) => {
            return h(groupTable, {
              props: {
                data: list,
                selectList: this.setGroupId
              }
            })
          },
          onOk: () => {
            if (this.groupId.length) {
              this.groupAssess()
              if (this.currentIndex === 0) {
                this.getEvaluateList(1)
              } else {
                this.getAssessByGroup()
              }
            } else {
              this.$Message.error('请选择群组')
            }
          }
        })
      })
    },
    /**
     * 新增分组弹窗显示
     **/
    showGroup () {
      this.getAssessCode(res => {
        this.checkcode = res
        this.$Modal.confirm({
          title: '提示',
          render: h => {
            return h('Input', {
              props: {
                type: 'text',
                value: this.addVal,
                placeholder: '输入新增分组名',
                clearable: true,
                autofocus: true,
                maxlength: 20
              },
              on: {
                'on-blur': event => {
                  this.addVal = event.target.value
                }
              }
            })
          },
          onOk: () => {
            if (this.addVal) {
              this.addGroup()
            } else {
              this.$Message.error('请输入新增分组名')
            }
          }
        })
      })
    },
    /**
     * table选中项发生变化时就会触发
     * @param selection 已选项数据
     **/
    selectionChange (selection) {
      this.selection = selection
      if (this.currentIndex === 0) {
        if (this.selection.length) {
          this.disabled = false
        } else {
          this.disabled = true
        }
      } else {
        this.disabled = true
      }
    },
    /**
     * 切换页数触发
     * @param e 当前页数
     */
    pageChange (e) {
      this.current = e
      if (this.currentIndex === 0) {
        this.getEvaluateList(1)
      } else {
        this.getAssessByGroup()
      }
    },
    pageChange1 (e) {
      this.current1 = e
      console.log(this.current1)
      this.getEvaluateList(2)
    },
    show (i) {
      this.selection = []
      this.disabled = true
      this.currentIndex = i
      this.selected = true
      this.group_id = this.list[this.currentIndex].id

      this.current = 1
      this.searchParams = {
        start_id: '',
        end_id: '',
        status: 1
      }
      if (this.currentIndex === 0) {
        this.getEvaluateList(1)
      } else {
        this.getAssessByGroup()
      }
    },
    /**
     * 点击菜单项时触发
     * @param name DropdownItem 的 name 值
     */
    drop (name) {
      this.group_id = this.list[this.forwardIndex].id
      switch (name) {
        case 'rename': // 重命名
          this.val = this.list[this.forwardIndex].name
          this.$Modal.confirm({
            title: '提示',
            render: h => {
              return h('Input', {
                props: {
                  type: 'text',
                  value: this.val,
                  placeholder: '输入新命名',
                  clearable: true,
                  autofocus: true,
                  maxlength: 20
                },
                on: {
                  'on-blur': event => {
                    this.val = event.target.value
                  }
                }
              })
            },
            onOk: () => {
              if (this.val) {
                this.groupRename()
              } else {
                this.$Message.error('请输入新命名')
              }
            }
          })
          break
        case 'istop': // 置顶
          this.$Modal.confirm({
            title: '提示',
            content: '确定置顶吗？',
            onOk: () => {
              this.assessGroupSort(3)
            }
          })
          break
        case 'moveUp': // 上移
          this.$Modal.confirm({
            title: '提示',
            content: '确定上移吗？',
            onOk: () => {
              this.assessGroupSort(1)
            }
          })
          break
        case 'moveDown': // 下移
          this.$Modal.confirm({
            title: '提示',
            content: '确定下移吗？',
            onOk: () => {
              this.assessGroupSort(2)
            }
          })
          break
        case 'delete': // 删除
          this.$Modal.confirm({
            title: '提示',
            content: '确定删除吗？',
            onOk: () => {
              this.delGroupAssess()
            }
          })
          break
      }
    }
  }
}
</script>
<style scoped>
.layout {
  background: #ffffff;
  position: relative;
  overflow: hidden;
}
.left-sider {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  position: absolute;
  background: rgb(255, 255, 255);
  left: 0px;
}
.selected {
  color: #f59a23;
}
.page {
  margin-top: 20px;
  text-align: center;
}
/*修改滚动条样式*/
div::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
div::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}
div::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 5px;
}
div::-webkit-scrollbar-thumb:hover {
  background: #333;
}
</style>
