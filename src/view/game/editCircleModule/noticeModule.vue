<template>
  <div>
      <Input v-model="textVal" maxlength="300" :rows="10" show-word-limit type="textarea" placeholder="请输入公告" 
      style="width: 500px" />
      <div style="width: 500px;text-align:center;margin-top: 20px;">
        <Button type="primary" @click="save">保存</Button>
      </div>
  </div>
</template>

<script>
import { setCircleAnnouncement, getCircleAnnouncement  } from '@/api/data'

export default {
  components: {
   
  },
  data () {
    return {
      circleId: this.$route.query.id,
      // circleId: 1,
      moduleId: '',
      textVal: ''
    }
  },
  mounted () {
    // this.getInitList()
  },
  methods: {
    getInitList () {
      let circleModuleLists = JSON.parse(localStorage.getItem('circleModuleLists'))
      let newArr = circleModuleLists.filter(item => {
        return +item.is_type === 2
      })
      this.moduleId = newArr[0].id
      let params = {
        circle_modular_id: this.moduleId,
        circle_id: this.circleId,
      }
      getCircleAnnouncement (params).then(res => {
        if (res.data.code === 200) {
          this.textVal = res.data.data.content
        }
      })
    },
    save(){
      if (!this.textVal) return this.$Message.error("输入内容不能为空");
      let params = {
        circle_modular_id: this.moduleId,
        circle_id: this.circleId,
        content: this.textVal
      }
      setCircleAnnouncement(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("保存成功");
        }
      })
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
