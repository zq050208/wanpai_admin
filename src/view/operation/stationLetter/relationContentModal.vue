<template>
  <Modal
    title="关联作品"
    scrollable
    :width="800"
    :value="visible"
    @on-ok="ok"
    @on-cancel="cancel"
  >
    <SearchForm :searchData="searchData" :searchForm="searchForm" />

    <Table
      highlight-row
      border
      max-height="500"
      :data="tableData"
      :columns="columns"
    />
  </Modal>
</template>

<script>
import SearchForm from '@/components/searchForm'

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    tableData: {
      type: Array,
      required: true
    }
  },
  components: { SearchForm },
  data() {
    return {
      searchData: {
        title: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'default',
            handle: () => {
              this.$emit('getRelationContent', {...this.searchData})
            }
          }
        ],
        components: [
          {
            name: 'Input',
            label: '消息标题：',
            prop: 'title',
            placeholder: '请输入消息标题'
          }
        ]
      },
      selectContent: {},
      columns: [
        {
          align: 'center',
          title: '内容ID',
          key: 'id'
        },
        {
          align: 'center',
          title: '标题',
          key: 'title'
        },
        {
          align: 'center',
          title: '类型',
          key: 'type',
          render: (h, params) => {
            let word
            switch (params.row.type) {
              case 1:
                word = '图文'
                break;

              case 2:
                word = '视频'
                break;
            
              default:
                break;
            }
            return h('span', {}, word)
          }
        },
        {
          align: 'center',
          title: '上传时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '选择',
          render: (h, params) => {

            return h('div',[
              h('Radio', {
                props: {
                  value: params.row.id === this.selectContent.id
                },
                on: {
                  'on-change': () => {
                    this.selectContent = {...params.row}
                  }
                }
              })
            ])
          }
        },
      ]
    }
  },
  methods: {
    ok() {
      this.$emit('hideModal')
      this.$emit('selectContentChange', this.selectContent)
    },
    cancel() {
      this.$emit('hideModal')
    },
  }
}
</script>