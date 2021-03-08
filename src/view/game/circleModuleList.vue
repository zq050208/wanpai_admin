<template>
  <div>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
    />
      
  </div>
</template>

<script>
import { getCircleModularList, setCircleModularStatus } from '@/api/data'

export default {
  components: {
 
  },
  data () {
    return {
      circleId: this.$route.query.id,
      // circleId: 1,
      tableData: [
        {
          id: '122',
          module_name: 'banner模块',
          belong: '圈子',
          status: 1
        }
      ],
      columns: [
        {
          align: 'center',
          title: '模块id',
          key: 'id'
        },
        {
          align: 'center',
          title: '模块名称',
          key: 'name'
        },
        {
          title: '所属模块',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, +params.row.module_type === 1 ? '圈子' : '')
          }
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
                disabled: params.row.is_type === 4,
                'before-change': () => this.handleSwitchChange(params.row)
              }
            })
          }
        },
      ],
    }
  },
  mounted () {
    this.getInitList()
  },
  methods: {
    handleSwitchChange (row) {
      row.is_show = !row.is_show
      row.is_show = row.is_show ? 1 : 0
      let params = {
        circle_id: this.circleId,
        id: row.id,
        is_show: row.is_show
      }
      setCircleModularStatus(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getInitList()
        }
      })
    },
    getInitList () {
      getCircleModularList({circle_id: this.circleId}).then(res => {
        if(res.data.code === 200){
          this.tableData = res.data.data
        }
      })
    }
  }
}
</script>

<style scoped>


</style>
