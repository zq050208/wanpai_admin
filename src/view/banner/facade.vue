<template>
  <div>
    <Tabs>
      <TabPane label="每日门面" name="1" >
        <DayFace />
      </TabPane>
      <TabPane label="评论管理" name="2">
        <commentManage />
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import DayFace from './components/dayFace'
import CommentManage from './components/commentManage'
export default {
  components: { DayFace, CommentManage },
  data () {
    return {}
  }
}
</script>
