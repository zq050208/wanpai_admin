<template>
  <div>
    <Table :columns="columns" :data="data" :filters="filters" @on-selection-change="selectionChange"></Table>
  </div>
</template>

<script>
  export default {
    name: "group-table",
    props: {
      data: {
        type: Array,
        value: []
      },
      selectList: {
        type: Function,
        value: []
      },
    },
    data () {
      return {
        columns: [
          { type: 'selection', width: 60, align: 'center' },
          { title: '编号', key: 'id' },
          { title: '群组名称', key: 'name' }
        ],
        filters: { id: 0, name: '全部评论'},
        selection: [] // 当前选中数据
      }
    },
    methods: {
      /**
       * table选中项发生变化时就会触发
       * @param selection 已选项数据
       **/
      selectionChange (selection) {
        this.selection = selection
        if (this.selection.length) {
          let list = []
          this.selection.forEach(item => {
            list.push(item.id)
          })
          this.selectList(list)
        }
      }
    }
  }
</script>

<style scoped>

</style>