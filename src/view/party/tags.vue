<template>
  <Card>
    <p slot="title">添加热门标签</p>
      <div class="tags-item">
        <h4>电竞圈标签<span class="decs"> ({{text}})</span></h4>
        <Tag closable :color="colors" v-for="item in count1" :key="item" :name="item" @on-close="handleClose(1, item)">{{item}}</Tag>
        <Button icon="ios-add" type="dashed" size="small" @click="isShow(1)">添加标签</Button>
      </div>
      <div class="tags-item">
        <h4>偶像圈标签<span class="decs"> ({{text}})</span></h4>
        <Tag closable :color="colors" v-for="item in count2" :key="item" :name="item" @on-close="handleClose(2, item)">{{item}}</Tag>
        <Button icon="ios-add" type="dashed" size="small" @click="isShow(2)">添加标签</Button>
      </div>
      <div class="tags-item">
        <h4>西皮圈标签<span class="decs"> ({{text}})</span></h4>
        <Tag closable :color="colors" v-for="item in count3" :key="item" :name="item" @on-close="handleClose(3, item)">{{item}}</Tag>
        <Button icon="ios-add" type="dashed" size="small" @click="isShow(3)">添加标签</Button>
      </div>
      <Button type="primary" @click="addHotTags">确定</Button>
    <Modal v-model="visible">
      <Input type="text" placeholder="输入标签" />
    </Modal>
  </Card>
</template>
<script>
import { getHotTags, addHotTags } from '@/api/data'
export default {
  name: 'tags',
  data () {
    return {
      text: '最多添加10个热门标签',
      value: null,
      visible: false,
      a: 1,
      colors: '#3B90EC',
      count1: [],
      count2: [],
      count3: [],
      checkcode: null
    }
  },
  mounted () {
    this.getHotTags()
  },
  methods: { // a
    getHotTags () {
      getHotTags().then(res => {
        if (res.data.code === 200) {
          let tag_list = res.data.data.tag_list
          tag_list.forEach((list, index) => {
            if (tag_list[index].tags.length) {
              tag_list[index].tags.forEach(item => {
                if (index === 0) this.count1.push(item.tag_name)
                else if (index === 1) this.count2.push(item.tag_name)
                else if (index === 2) this.count3.push(item.tag_name)
              })
            }
          })
          this.checkcode = res.data.data.checkcode
        }
      })
    },
    addHotTags () {
      if (this.count1.length >= 1 || this.count1.length >= 1 || this.count1.length >= 1) {
        let obj = {
          checkcode: this.checkcode,
          tag: JSON.stringify({ 1: this.count1, 2: this.count2, 3: this.count3 })
        }
        addHotTags(obj).then(res => {
          if (res.data.code === 200) {
            this.$Message.success('成功')
          }
        })
      } else {
        this.$Message.error('请添加热门标签')
      }
    },
    isShow (type) {
      if (type === 1 && this.count1.length >= 10) {
        this.$Message.error(this.text)
        return
      } else if (type === 2 && this.count2.length >= 10) {
        this.$Message.error(this.text)
        return
      } else if (type === 3 && this.count3.length >= 10) {
        this.$Message.error(this.text)
        return
      }
      this.$Modal.confirm({
        render: (h) => {
          return h('Input', {
            props: { value: this.value, autofocus: true, placeholder: '请输入标签名' },
            on: { input: (val) => { this.value = val.trim() } }
          })
        },
        onOk: () => {
          this.handleAdd(type)
        }
      })
    },
    handleAdd (type) {
      let count = []
      if (type === 1) count = this.count1
      else if (type === 2) count = this.count2
      else if (type === 3) count = this.count3
      let sta = this.in_array(this.value, count)
      if (sta) this.$Message.error({ content: '已有相同标签' })
      else if (this.value) count.push(this.value)
      this.value = null
    },
    handleClose (type, name) {
      var count = []
      if (type === 1) count = this.count1
      else if (type === 2) count = this.count2
      else if (type === 3) count = this.count3
      const index = count.indexOf(name)
      count.splice(index, 1)
    },
    in_array (stringToSearch, arrayToSearch) {
      for (var s = 0; s < arrayToSearch.length; s++) {
        var thisEntry = arrayToSearch[s].toString()
        if (thisEntry === stringToSearch) {
          return true
        }
      }
      return false
    }
  }
}
</script>

<style scoped>
  .tags-item{
    margin-bottom: 15px;
  }
  .tags-item h4{
    margin-bottom: 5px;
  }
  .decs {
    color: #999999;
  }
</style>
