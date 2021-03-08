<template>
  <div>
    <!-- 筛选 -->
     <SearchForm :searchForm="searchForm" :searchData="searchData" />
    <div class="demo-split">
        <!-- <Split v-model="split1"> -->
            <div class="split-left">
               <Layout>
                  <Header ><Input suffix="ios-search" placeholder="搜索群组" style="width: 100%" v-model="keyword" search @on-search="seachClick"/></Header>
                  <Content>
                    <div style="height: 550px; overflow-y: scroll;">
                      <div v-for="(item, i) in groupList" @click="show(i)" :key="i" style="border-bottom: 1px solid #dcdee2; box-sizing: border-box">
                        <div style="position: relative; height: 30px; line-height: 30px;">
                          <span :class="currentIndex === i ? 'selected' : ''" style="padding-left: 10px;">{{item.name}}</span>
                          <Icon type="ios-arrow-forward" style="position: absolute; right: 10px; top: 10px"></Icon>
                        </div>
                      </div>
                    </div>
                  </Content>
                  <Footer>
                      <Button type="primary" style="width: 100%;border-radius: 0;border-bottom: 1px solid #cccccc" :disabled="disabled" @click="showGroupAssess">新增群组成员</Button>
                      <!-- <Button style="margin-bottom: 10px" :disabled="disabled" type="success" long>新增群组成员</Button> -->
                      <Button type="primary" long >新增群组</Button>
                  </Footer>
                </Layout>
            </div>
            <div class="split-right">
              <Table border :columns="columns" :data="data" @on-selection-change="selectionChange"  ref="table"></Table>
               <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
            </div>
        <!-- </Split> -->
        <Modal v-model="joinGroupModal" width="300" title="选择目标群组">
          <Input suffix="ios-search" placeholder="搜索群组" style="width: 100%" />
          <br>
          <br>
          <List border>
            <ListItem v-for="(item, index) in groupList" :key="index">{{item.name}}</ListItem>
          </List>
        </Modal>
    </div>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'

export default {
  components: { SearchForm },
  data () {
    return {
      disabled: true, // 新增群组评价按钮开启状态
      selection: [], // 当前选中数据
      joinGroupModal: false, // 加入群组弹窗
      currentIndex: 0,
      keyword: '',
      // 群组列表 暂时自己模拟的数据
      groupList: [
        {
          name: '群组1',
          id: '1'
        },
        {
          name: '群组2',
          id: '2'
        }
      ],
      data: [
        {
          user_id: 0,
          nickname: '啊哈',
          tell: 123456789,
          gender: 1,
          age: 18,
          city: '深圳',
          tags: [
            { id: 1, name: 'ddjk' },
            { id: 2, name: 'lll' }
          ]

        }
      ],
      total: 1,
      current: 1,
      per_page: 10,
      theme3: 'light',
      searchData: {
        gender: 0,
        city: 0,
        range: '',
        keywords: '',
        tags: ''
      },
      columns: [
        { type: 'selection', width: 60, align: 'center' },
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
          key: 'tell',
          align: 'center',
          width: '150px'
        },
        {
          title: '性别',
          key: 'gender',
          align: 'center',
          width: '80px',
          render: (h, params) => {
            return h('div', {}, params.row.gender === 1 ? '男' : params.row.gender === 2 ? '女' : '')
          }
        },
        {
          title: '年龄',
          key: 'age',
          align: 'center',
          width: '80px'
        },
        {
          title: '城市',
          key: 'city',
          align: 'center',
          width: '80px'
        },
        {
          title: '用户标签',
          key: 'tag',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.tags.map(i => h('Tag', {}, i.name)))
          }
        },
        {
          title: '操作',
          key: 'option',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '10px' },
                on: {
                  click: () => {
                    console.log('查看')
                  }
                }
              }, '查看'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                style: { marginRight: '10px' },
                on: {
                  click: () => {
                    console.log('封禁')
                  }
                }
              }, '封禁'),
              h('Button', {
                props: { type: 'info', size: 'small' },
                on: {
                  click: () => {
                    this.joinGroupModal = true
                    console.log('加入群组')
                  }
                }
              }, '加入群组')
            ])
          }
        }
      ],
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              console.log('查询')
            }
          },
          {
            text: '导出数据',
            type: 'primary',
            handle: () => {
              console.log('导出数据')
            }
          }
        ],
        components: [
          {
            name: 'Select',
            prop: 'gender',
            label: '性别选择:',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '男',
                value: 1
              },
              {
                label: '女',
                value: 0
              }
            ]
          },
          {
            name: 'Select',
            prop: 'city',
            label: '城市选择：',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '深圳1',
                value: 1
              },
              {
                label: '深圳2',
                value: 0
              }
            ]
          },
          {
            name: 'RangeInput',
            prop: 'range',
            label: '年龄区间：'
          },
          {
            name: 'Input',
            prop: 'keywords',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'Input',
            prop: 'tags',
            placeholder: '输入标签搜索'
          }
        ]
      }
    }
  },
  mounted () {

  },
  methods: {
    seachClick () {
      console.log(this.keyword)
    },
    handlePageChange (page) {
      this.current = page
    },
    handlePageSizeChange (size) {
      this.per_page = size
    },
    /**
     * 新增分组评价弹窗显示
     **/
    showGroupAssess () {
      console.log('1')
    },
    /**
     * table选中项发生变化时就会触发
     * @param selection 已选项数据
     **/
    selectionChange (selection) {
      this.selection = selection
      if (this.selection.length) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
    show (i) {
      this.currentIndex = i
      console.log('选择分组:', i)
    },
    getUserGroupList () {
    //   getUserGroupList({ keywords: this.keyword, page: 1, per_page: 1000 }).then(res => {
    //     if (res.data.code === 200) {
    //       this.groupList = [
    //         ...allGroup,
    //         ...res.data.data.data
    //       ]
    //     }
    //   })
    }
  }
}
</script>
<style scoped>
.demo-split{
    min-height: 100px;
    border: 1px solid #dcdee2;
    display: flex;
}
.split-left{
  width: 200px;
}
.split-right{
  flex: 1;
}
.selected{
  color: #F59A23;
}
.page {
  margin-top: 20px;
  text-align: center;
}
.ivu-layout-header,
.ivu-layout-footer{
  background: #f5f7f9;
  width: 100%;
  padding: 0;
}
.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu){
  background: none
}
</style>
