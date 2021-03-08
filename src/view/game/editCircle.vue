<template>
  <Card>
    <Tabs :value="level" name="tab1" @on-click="tabsChange">
      <TabPane label="模块列表" name="1" tab="tab1">
        <Tag1Form ref="Tag1Form" />
      </TabPane>
      <TabPane label="编辑模块" tab="tab1" name="2" v-if="isHasData">
        <Tabs :value="secLevel" name="tab2-1" @on-click="tabsChildrenChange">
          <TabPane label="tab模块" name="3" tab="tab2-1">
            <tabModule ref="tabModule" />
          </TabPane>
          <TabPane label="banner模块" tab="tab2-1" name="4">
            <bannerModule ref="bannerModule" />
          </TabPane>
          <TabPane label="公告模块" name="5" tab="tab2-1">
            <noticeModule ref="noticeModule" />
          </TabPane>
          <TabPane label="置顶模块" name="6" tab="tab2-1">
            <toUpModule ref="toUpModule" />
          </TabPane>
        </Tabs>
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
import Tag1Form from './circleModuleList'
import tabModule from './editCircleModule/tabModule'
import bannerModule from './editCircleModule/bannerModule'
import noticeModule from './editCircleModule/noticeModule'
import toUpModule from './editCircleModule/toUpModule'
import { getCircleModularList } from '@/api/data'
import { setTimeout } from 'timers';
export default {
  components: {
    Tag1Form,
    tabModule,
    bannerModule,
    noticeModule,
    toUpModule
  },
  // props: {
  //   moduleId: ''
  // },
  data () {
    return {
      level: '1',
      secLevel: '3',
      moduleLists: [],
      circleId: this.$route.query.id,
      isHasData: true
      // circleId: 1,
    }
  },
  computed: {
    
  },
  methods: {
    tabsChange (tab) {
      if (tab !== this.level) {
        this.level = tab
        if (+tab === 1) {
          this.$refs[`Tag1Form`].getInitList()
        } else {
          this.$refs[`tabModule`].getInitList()
        }
      }
    },
    tabsChildrenChange (tab) {
      console.log(tab)
      if (tab === '3') {
        this.$refs[`tabModule`].getInitList()
      } else if (tab === '4') {
        this.$refs[`bannerModule`].getInitList()
      } else if (tab === '5') {
        this.$refs[`noticeModule`].getInitList()
      } else {
        this.$refs[`toUpModule`].getInitList()
      }
    },
    getInitList () {
      getCircleModularList({circle_id: this.circleId}).then(res => {
        if(res.data.code === 200){
          this.moduleLists = res.data.data
          if(this.moduleLists.length === 0){
            this.isHasData = false
          } else {
            this.isHasData = true
            localStorage.setItem('circleModuleLists', JSON.stringify(res.data.data))
          }
          if(+this.level === 2){
            this.$refs[`bannerModule`].getInitList()
          }
        }
      })
    }
  },
  created () {

  },
  mounted () {
    const { query } = this.$route
    if (query.level) this.level = query.level + ''
    if (this.level === '2') {
      this.secLevel = '4'
    }
    this.getInitList()
  }
}
</script>
<style leng="less" scoped>
.edit_mod{
  width: 100%;
  display: flex;
  border-bottom: 1px solid #DCDEE2;
}
.edit_mod li{
  width: 130px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  list-style: none;
  cursor: pointer;
}
.edit_mod li.actived{
  border-bottom: 2px solid #2D8CF0;
  color: #2D8CF0;
}
.content{
  margin-top: 15px;
}
</style>

