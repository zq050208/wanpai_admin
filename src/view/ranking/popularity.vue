<template>
  <Card>
    <p slot="title">超级人气榜</p>
    <Form inline>
      <FormItem>
        <Select v-model="option" style="width: 200px" @on-change="rankingChange">
          <Option v-for="(item, index) in week_list" :value="index" :key="index" :label="item.start_time + ' —— ' + item.end_time"></Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="rankingQuery">查询</Button>
    </Form>
    <Table border :columns="columns" :data="data"></Table>
    <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
  </Card>
</template>
<script>
import { getWeek, rankingList } from '@/api/data'
export default {
  name: 'popularity',
  data () {
    return {
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      week_list: [],
      start_time: '',
      end_time: '',
      option: 0,
      data: [],
      columns: [
        {
          title: '排名',
          render: (h, params) => {
            return h('div', {}, params.index + 1)
          }
        },
        {
          title: '派对',
          key: 'name'
        },
        {
          title: '人气值',
          key: 'popularity_total'
        }
      ]
    }
  },
  mounted () {
    this.getWeek()
  },
  methods: {
    getWeek () { // 获取最近6周日期
      getWeek({ contain: 2 }).then(res => {
        if (res.data.code === 200) {
          this.week_list = res.data.data.week_list
          let len = this.week_list.length
          if (len) {
            this.start_time = this.week_list[this.option].start_time
            this.end_time = this.week_list[this.option].end_time
            this.rankingList()
          }
        }
      })
    },
    rankingList () { // 获取排行榜
      let obj = { start_time: this.start_time, end_time: this.end_time, page: this.current, per_page: this.per_page }
      rankingList(obj).then(res => {
        this.data = res.data.data.data
      })
    },
    rankingChange (i) { // 日期选择
      this.start_time = this.week_list[i].start_time
      this.end_time = this.week_list[i].end_time
    },
    rankingQuery () { // 查询
      this.current = 1
      this.rankingList()
    },
    pageChange (e) { // 分页切换
      this.current = e
      this.rankingList()
    }
  }
}
</script>

<style scoped>
  .page{
    margin-top: 20px;
    text-align: center;
  }
</style>
