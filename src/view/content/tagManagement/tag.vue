<template>
  <Card>
    <Tabs :value="level" @on-click="tabsChange">
      <TabPane label="一级标签" name="1">
        <Tag1Form ref="tag1" />
      </TabPane>
      <TabPane label="二级标签" name="2">
        <Tag2Form ref="tag2" />
      </TabPane>
      <TabPane label="三级标签" name="3">
        <Tag3Form ref="tag3" />
      </TabPane>
      <Button type="primary" slot="extra" to="/content/tag/add">+ 新建标签</Button>
    </Tabs>
  </Card>
</template>

<script>
import Tag1Form from './tag1'
import Tag2Form from './tag2'
import Tag3Form from './tag3'

export default {
  components: {
    Tag1Form,
    Tag2Form,
    Tag3Form
  },
  data() {
    return {
      level: '1'
    }
  },
  methods: {
    tabsChange(tab) {
      if(tab !== this.level) {
        this.level = tab
        this.$refs[`tag${tab}`].getTagList(Number(tab))
      }
    }
  },
  mounted() {
    const { query } = this.$route
    if(query.level) this.level = query.level
  }
}
</script>
