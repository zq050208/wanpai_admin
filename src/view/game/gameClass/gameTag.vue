<template>
  <Card>
    <Tabs :value="level" @on-click="tabsChange">
      <TabPane label="一级分类列表" name="1">
        <Tag1Form ref="gameTagForm1" />
      </TabPane>
      <TabPane label="二级分类列表" name="2">
        <Tag2Form ref="gameTagForm2" />
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
import Tag1Form from './gameTagForm1'
import Tag2Form from './gameTagForm2'

export default {
  components: {
    Tag1Form,
    Tag2Form
  },
  data () {
    return {
      level: localStorage.getItem('tab')
    }
  },
  methods: {
    tabsChange (tab) {
      if (tab !== this.level) {
        this.level = tab
        console.log('tab', tab)
        this.$refs[`gameTagForm${tab}`].getGameCategoryList(Number(tab))
      }
    }
  },
  mounted () {
    const { query } = this.$route
    if (query.level) this.level = query.level
  }
}
</script>
