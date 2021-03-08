


<template>
  <div class="circle-wrap">
    <Tabs :value="classify" :animated="false" @on-click="tabChange">
      <Tab-pane label="圈子列表" key="0">
        <circleColumn ref='circleDom'></circleColumn>
      </Tab-pane>
      <Tab-pane label="分类列表" key="1">
        <classify ref='classifyDom'></classify>
      </Tab-pane>
      <Tab-pane label="圈子分类列表" key="2">
        <circleClassify ref='circleClassifyDom'></circleClassify>
      </Tab-pane>
    </Tabs>
  </div>
</template>
<script>
import circleColumn from './circleColumn'
import classify from './classify'
import circleClassify from './circleClassify'
export default {
  data () {
    return {
      classify: 0
    }
  },
  components: {
    circleColumn,
    classify,
    circleClassify
  },
  methods: {
    tabChange (name) {
      // console.log(name)
      if (name == 0) {
        this.$refs.circleDom.circleList()
      } else if (name == 1) {
        this.$refs.classifyDom.getClassifyData()
        this.$refs.classifyDom.getAllClassifyData()
      } else {
        this.$refs.circleClassifyDom.getCircleClassify('')
        this.$refs.circleClassifyDom.getCircleClassifySelect()
      }
    }
  }
}
</script>
