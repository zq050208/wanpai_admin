<template>
  <Card>
    <Tabs :value="level" @on-click="tabsChange">
      <TabPane label="站内达人申请列表" name="1">
        <experApplyList1 ref="experApplyList1" />
      </TabPane>
      <TabPane label="站外达人申请列表" name="2">
        <experApplyList2 ref="experApplyList2" />
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
import experApplyList1 from './experApplyList1'
import experApplyList2 from './experApplyList2'

export default {
  components: {
    experApplyList1,
    experApplyList2
  },
  data () {
    return {
      level: '1'
    }
  },
  methods: {
    tabsChange (tab) {
      if (tab == 1) {     
        this.$refs.experApplyList1.getMasterApplyStationList()
      } else {
        this.$refs.experApplyList2.getMasterApplyOutStationList()      
      }
    }
  },
  mounted () {
    // const { query } = this.$route
    // if (query.level) this.level = query.level
  }
}
</script>