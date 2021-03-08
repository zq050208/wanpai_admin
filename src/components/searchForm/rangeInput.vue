<template>
  <div>
    <!-- <Input number @on-change="handleStartChange" style="width: 60px" /> ——
    <Input number @on-change="handleEndChange" style="width: 60px" /> -->
    <input type="text" name="tel" oninput="value=value.replace(/[^\d]/g,'')"  @change="handleStartChange"/> ——
    <input type="text" name="tel" oninput="value=value.replace(/[^\d]/g,'')"  @change="handleEndChange"/>
  </div>
</template>

<script>
export default {
  name: 'rangeInput',
  model: {
    prop: 'range',
    event: 'change'
  },
  props: {
    range: {
      type: [String, Array],
      required: true
    }
  },
  data () {
    return {
      start: '',
      end: '',
      value:''
    }
  },
  methods: {
  
    handleStartChange (e) {
      this.start = e.target.value
      if (!this.start&&!this.end) {
        this.value = `${this.start}`
        this.$emit('change', this.value)
      } else {
        // this.$Message.error('请输入选择范围')
      }
    },
    handleEndChange (e) {
      this.end = e.target.value
      this.value = `${this.start},${this.end}`
      if (this.start&&this.end) {
        this.$emit('change', this.value)
      }else{
        // this.$Message.error('请输入选择范围')
      }
    }
  }
}
</script>
<style scoped>
  input {
    width: 100px;
    height: 32px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
  }
</style>
