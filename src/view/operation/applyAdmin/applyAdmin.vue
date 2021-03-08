<template>
  <Card>
    <Tabs :value="level" @on-click="tabsChange">
      <TabPane label="圈子管理员" name="1">
        <circleApply ref="circleApply" />
      </TabPane>
      <TabPane label="百科管理员" name="2">
        <encyclopediaApply ref="encyclopediaApply" />
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
import circleApply from './circleApply'
import encyclopediaApply from './encyclopediaApply'

export default {
  components: {
    circleApply,
    encyclopediaApply
  },
  data () {
    return {
      level: '1'
    }
  },
  methods: {
    tabsChange (tab) {
      if (+tab === 1) {     
        this.$refs.circleApply.applyCircleMagageList()
      } else {
        this.$refs.encyclopediaApply.indexApplyAdmin()      
      }
    }
  },
  mounted () {
    // const { query } = this.$route
    // if (query.level) this.level = query.level
  }
}
</script>