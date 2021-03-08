<template>
  <div>
    <div class="head_btn">
      <Button type="primary" @click="addTab" style="margin-bottom: 8px;">添加tab分类</Button>
    </div>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
    />
    <modal v-model="addPostModal" :title="tabTitle" width="400" footer-hide>
      <input type="text"  placeholder="请输入分类名称，上限六个字" oninput="value=value.replace(/[^\a-\z\A-\Z\u4E00-\u9FA5]/g,'')" maxlength="6" 
      style="width: 300px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;" v-model="tabCont" />
      <div style="display: flex;justify-content: space-around;margin-top: 15px;">
        <Button type="error" @click="cancel">取消</Button>
        <Button type="primary" @click="confirm">确定</Button>
      </div>
    </modal>
  </div>
</template>

<script>
import { 
  getCircleTabModularList, 
  setCircleTabModularStatus, 
  editCircleTabModular, 
  bannerTemp_addView,
  delCircleTabModular,
  circleTabModularSort
 } from '@/api/data'

export default {
  components: {
    
  },
  data () {
    return {
      addPostModal: false,
      tabCont: '',
      circleId: this.$route.query.id,
      // circleId: 1,
      moduleId: '',
      tabTitle: '添加tab分类',
      checkcode: '',
      tableData: [],
      tabId: '',
      columns: [
        {
          align: 'center',
          title: '排序',
          render: (h, params) => {
            return h('div', [
              params.row.is_show === 0  && +params.row.sort !== 1 && +params.row.sort !== 2 && +params.row.sort !== 3 ? h('div', {}, '无')  
              : h('div', [
                h('span', {}, params.row.sort),
                params.row.sort > 4 ? h(
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
                        this.circleTabModularSort(params.row.id, 1)
                      }
                    }
                  },
                  '上移'
                ) : '',
                params.row.sort > 3 && params.index !== this.tableData.length - 1 ? h(
                  'Button',
                  {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.circleTabModularSort(params.row.id, -1)
                      }
                    }
                  },
                  '下移'
                ) : ''
              ])
            ])
          }
        },
        {
          align: 'center',
          title: 'tab分类名称',
          key: 'name'
        },
        {
          align: 'center',
          title: '显示/隐藏',
          key: 'is_show',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                'true-color': 'rgb(26,188,156)',
                value: params.row.is_show === 1,
                disabled: params.row.tag_type === 3,
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
              params.row.tag_type === 1 || params.row.tag_type === 2 || params.row.tag_type === 3 ? h('div', {}, '') : 
              h('div', [
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
                        this.addPostModal = true
                        this.tabCont = params.row.name
                        this.tabTitle = "编辑tab分类"
                        this.tabId = params.row.id
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
                          title: '确认要删除此分类吗？',
                          content: '（删除后不可恢复，请谨慎操作）',
                          onOk: () => {
                            this.delCircleTabModular(params.row.id)
                            console.log(params)
                          }
                        })
                      }
                    }
                  },
                  '删除'
                )
              ])
            ])
          }
        }
      ],
    }
  },
  mounted () {
    // this.getInitList()
  },
  methods: {
    handleSwitchChange (row) {
      row.is_show = !row.is_show
      row.is_show = row.is_show ? 1 : 0
      let params = {
        circle_modular_id: this.moduleId,
        circle_id: this.circleId,
        id: row.id,
        is_show: row.is_show
      }
      setCircleTabModularStatus(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getInitList()
        }
      })
    },
    getInitList () {
      let circleModuleLists = JSON.parse(localStorage.getItem('circleModuleLists'))
      let newArr = circleModuleLists.filter(item => {
        return +item.is_type === 4
      })
      this.moduleId = newArr[0].id
      this.tableData = []
      let params = {
        circle_modular_id: this.moduleId,
        circle_id: this.circleId 
      }
      getCircleTabModularList(params).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data
        }
      })
    },
    circleTabModularSort (id, type) {
      let params = {
        circle_modular_id: this.moduleId,
        circle_id: this.circleId,
        id: id,
        direction: type
      }
      circleTabModularSort(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("排序成功");
          this.getInitList()
        }
      })
    },
    // 添加tab分类
    addTab () {
      this.addPostModal = true
      this.tabCont = ''
      this.tabTitle = "添加tab分类"
      this.tabId = ''
    },
    delCircleTabModular (id) {
      let params = {
        circle_modular_id: this.moduleId,
        circle_id: this.circleId,
        id: id
      }
      delCircleTabModular(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功");
          this.getInitList()
        }
      })
    },
    // 新增或编辑tab分类
    confirm () {
      this.tabCont = this.tabCont.replace(/[^\a-\z\A-\Z\u4E00-\u9FA5]/g,'')
      if (!this.tabCont) return this.$Message.error("输入内容不能为空");
      bannerTemp_addView().then(({ data }) => {
        if (data.code === 200){
          this.checkcode = data.data.checkcode;
          let params = {
            circle_modular_id: this.moduleId,
            circle_id: this.circleId,
            name: this.tabCont,
            checkcode: this.checkcode,
            id: this.tabId
          }
          editCircleTabModular(params).then(res => {
            if (res.data.code === 200) {
              this.$Message.success("成功");
              this.addPostModal = false
              this.getInitList()
            }
          })
        }
      });
    },
    cancel () {
      this.addPostModal = false
    }
  }
}
</script>

<style scoped>
.page{
  margin-top: 20px;
  text-align: center;
}
.head_btn{
  text-align: right;
}
</style>
