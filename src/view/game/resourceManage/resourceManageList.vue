<template>
  <Card>
    <Tabs :value="level" @on-click="tabsChange">
      <TabPane label="每日推荐" name="1">
        <resourceManageList1 ref="resourceManageList1" />
      </TabPane>
      <TabPane label="百科主推" name="2">
        <resourceManageList2 ref="resourceManageList2" />
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
import resourceManageList1 from './resourceManageList1'
import resourceManageList2 from './resourceManageList2'

export default {
  components: {
    resourceManageList1,
    resourceManageList2
  },
  data () {
    return {
      level: '1'
    }
  },
  methods: {
    tabsChange (tab) {
      if (tab !== this.level) {
        this.level = tab
        this.$refs[`resourceManageList${tab}`].getInitDataList(Number(tab))
      }
    }
  },
  mounted () {
    // const { query } = this.$route
    // if (query.level) this.level = query.level
  }
}
</script>
