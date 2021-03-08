<template>
  <div>
    <Tabs type="card">
      <Tab-pane label="未使用评论">
        <Card :padding="0">
          <div style="padding: 20px">
            <cardHeader
              title="未使用评论"
              leftContent="删除评论"
              rightContent="导入评论"
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
                >新增群组评论</Button>
                <Button type="primary" style="width: 100%;border-radius: 0" @click="showGroup">新增群组</Button>
              </div>
            </div>
            <!--内容-->
            <Layout :style="{marginLeft: '200px'}">
              <Content style="min-height: 650px;background: #ffffff;">
                <SearchForm :searchForm="searchForm" :searchData="searchData" />
                <Table height="450" :columns="columns" :data="data" @on-selection-change="selectionChange"></Table>
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
      <Tab-pane label="已使用评论">
        <Card :padding="0">
          <div style="padding: 20px">
            <cardHeader
              title="已使用评论"
              rightContent="导出评论"
              :loading="loading"
              @on-right-click="exportCommentList"
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
  getCommentLists,
  getCommentGroupList,
  addCommentGroup,
  editCommentGroup,
  commentGroupSort,
  exportCommentList,
  commentJoinGroup,
  delComments,
  delCommentGroup
} from '@/api/data'
import { getToken } from '@/libs/util'
const allGroup = [{ id: -1, name: '未分组' }]
const arr1 = [{ type: 'selection', width: 60, align: 'center' }]
const arr2 = [
  { title: '编号', key: 'id' },
  { title: '评论内容', key: 'comment' }
]
export default {
  components: { cardHeader, SearchForm, groupTable },
  data () {
    return {
      searchData: {
        range: []
      },
      searchForm: {
        actions: [
          {
            text: '搜索',
            type: 'primary',
            handle: () => {
              console.log(this.searchData.range)
              this.current = 1
              this.searchParams = {
                start_id: this.searchData.range[0]
                  ? Number(this.searchData.range[0])
                  : '',
                end_id: this.searchData.range[1]
                  ? Number(this.searchData.range[1])
                  : '',
                status: this.status
              }
              this.getCommentLists(1)
            }
          }
        ],
        components: [
          {
            name: 'RangeInput',
            prop: 'range',
            label: '编号区间：'
          }
        ]
      },
      searchParams: {}, // 搜索内容
      list: [...allGroup], // 群组列表
      groupId: [], // 选择分组ID
      disabled: true, // 新增群组评论按钮开启状态
      keyword: '', // 群组搜索关键字
      selected: true, // 是否左键点击
      group_id: -1, // 分组id
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
    this.getCommentGroupList()
    this.getCommentLists(1)
    this.getCommentLists(2)
  },
  methods: {
    /**
     * 群组列表
     **/
    getCommentGroupList () {
      getCommentGroupList({ keywords: this.keyword, per_page: 500 }).then(
        res => {
          console.log(res)
          if (res.data.code === 200) {
            this.list = [...allGroup, ...res.data.data.data]
          }
        }
      )
    },
    /**
     * 群组评论列表
     **/
    getAssessByGroup () {
      let data = {
        page: this.current,
        per_page: this.per_page,
        group_id: this.group_id
      }
      getAssessByGroup(data).then(res => {
        console.log(res)
        if (res.data.code === 200) {
          this.data = res.data.data.data
        }
      })
    },
    /**
     * 评论列表
     **/
    getCommentLists (status) {
      let data = {
        page: this.current,
        per_page: this.per_page,
        status: status,
        group_id: this.group_id,
        ...(status === 1 ? this.searchParams : [])
      }
      getCommentLists(data).then(res => {
        if (res.data.code === 200) {
          if (status === 1) {
            this.data = res.data.data.data
            this.total = res.data.data.total
            this.last_page = res.data.data.last_page
          } else {
            this.data1 = res.data.data.data
            this.total1 = res.data.data.total
            this.last_page1 = res.data.data.last_page
          }
        }
      })
    },
    /**
     * 群组排序
     * @param type 排序方式 1=上移 2=下移 3=置顶
     **/
    commentGroupSort (type) {
      let data = {
        id: this.group_id,
        sort_type: type
      }
      commentGroupSort(data).then(res => {
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
          this.getCommentGroupList()
        }
      })
    },
    /**
     * 添加分组
     **/
    addCommentGroup () {
      let data = { group_name: this.addVal }
      addCommentGroup(data).then(res => {
        this.addVal = ''
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.getCommentGroupList()
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    /**
     * 分组重命名
     **/
    editCommentGroup () {
      editCommentGroup({ id: this.group_id, group_name: this.val }).then(
        res => {
          this.val = ''
          if (res.data.code === 200) {
            this.$Message.success('成功')
            this.getCommentGroupList()
          }
        }
      )
    },
    /**
     * 删除群组
     **/
    delCommentGroup () {
      delCommentGroup({ id: this.group_id }).then(res => {
        if (res.data.code === 200) {
          this.group_id = this.list[0].id
          this.currentIndex = 0
          this.current = 1
          this.$Message.success('成功')
          this.getCommentLists(1)
          this.getCommentGroupList()
        }
      })
    },
    /**
     * 搜索按钮
     **/
    onSearch (value) {
      this.keyword = value
      this.getCommentGroupList()
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
            let comment_ids = []
            this.selection.forEach(item => {
              comment_ids.push(item.id)
            })
            let params = {
              group_id: this.group_id === -1 ? 0 : this.group_id,
              comment_ids: JSON.stringify(comment_ids)
            }
            console.log(`delete ${params}`)
            delComments(params).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('成功')
                if (this.current === this.last_page) {
                  this.current--
                  if (this.current === 0) {
                    this.current = 1
                  }
                }
                this.getCommentLists(1)
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
      let action = server.BASE_URL + 'CommentLibrary/importCommentExcel'
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
    exportCommentList () {
      this.loading = true
      exportCommentList({}).then(res => {
        this.loading = false
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            quoted: true,
            separator: ',=',
            filename: `已使用评论`,
            columns: this.columns2,
            data: res.data.data
          })
        }
      })
    },
    /**
     * 上传文件成功回调
     * @param res
     * @param file
     **/
    handleSuccessUpload (res, file) {
      console.log(res)
      if (res.code === 200) {
        this.$Modal.remove()
        console.log('upload success')
        this.$Message.success({ content: res.msg })
        this.group_id = this.list[0].id
        this.currentIndex = 0
        this.current = 1
        this.getCommentLists(1)
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
     * 添加群组评论
     **/
    commentJoinGroup () {
      let comment_ids = []
      this.selection.forEach(item => {
        comment_ids.push(item.id)
      })
      let params = {
        group_ids: JSON.stringify(this.groupId),
        comment_ids: JSON.stringify(comment_ids)
      }
      commentJoinGroup(params).then(res => {
        if (res.data.code === 200) {
          this.disabled = true
          this.current = 1
          this.$Message.success('成功')
          this.getCommentLists(1)
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
     * 新增分组评论弹窗显示
     **/
    showGroupAssess () {
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
            this.commentJoinGroup()
          } else {
            this.$Message.error('请选择群组')
          }
        }
      })
    },
    /**
     * 新增分组弹窗显示
     **/
    showGroup () {
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
          console.log(this.addVal)
          if (this.addVal) {
            this.addCommentGroup()
          } else {
            this.$Message.error('请输入新增分组名')
          }
        }
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
      this.getCommentLists(1)
    },
    pageChange1 (e) {
      this.current1 = e
      this.getCommentLists(2)
    },
    show (i) {
      this.selection = []
      this.disabled = true
      console.log(`show ${i}`)
      this.currentIndex = i
      this.selected = true
      this.group_id = this.list[this.currentIndex].id

      this.current = 1
      this.searchParams = {
        start_id: '',
        end_id: '',
        status: 1
      }
      this.getCommentLists(1)
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
                this.editCommentGroup()
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
              this.commentGroupSort(3)
            }
          })
          break
        case 'moveUp': // 上移
          this.$Modal.confirm({
            title: '提示',
            content: '确定上移吗？',
            onOk: () => {
              this.commentGroupSort(1)
            }
          })
          break
        case 'moveDown': // 下移
          this.$Modal.confirm({
            title: '提示',
            content: '确定下移吗？',
            onOk: () => {
              this.commentGroupSort(2)
            }
          })
          break
        case 'delete': // 删除
          this.$Modal.confirm({
            title: '提示',
            content: '确定删除吗？',
            onOk: () => {
              this.delCommentGroup()
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
  background: #f5f7f9;
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
