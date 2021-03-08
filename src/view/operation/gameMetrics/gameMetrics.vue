<template>
  <Tabs type="card">
    <TabPane label="游戏分组">
      <GameGroup />
    </TabPane>
    <TabPane label="指标数据">
      <IndexData />
    </TabPane>
  </Tabs>
</template>

<script>
import SearchForm from '../../../components/searchForm'
import GameGroup from './gameGroup.vue'
import IndexData from './indexData.vue'
export default {
  components: {
    SearchForm,
    GameGroup,
    IndexData
  },
  data () {
    return {}
  },
  mounted () {
  },
  methods: {}
}
</script>

<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
  /* : ; */
}
.add {
  margin-bottom: 10px;
}
</style>