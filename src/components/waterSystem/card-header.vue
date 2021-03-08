<template>
  <div class="header">
    <div class="left-btn">
      <Button v-if="leftContent !== ''" type="default" @click="onLeftClick">{{leftContent}}</Button>
    </div>
    <div class="right-btn">
      <Button v-if="rightContent !== ''" type="default" :loading="loading" @click="onRightClick">
        <span v-if="!loading">{{rightContent}}</span>
        <span v-else>{{rightContent}}</span>
      </Button>
    </div>
    <div class="title">{{title}}</div>
  </div>
</template>

<script>
export default {
  name: 'card-header',
  props: {
    /**
     * 左边按钮是否展示 传入按钮名展示，默认空不展示
     */
    leftContent: {
      type: String,
      default: ''
    },
    /**
     * 右边按钮是否展示 传入按钮名展示，默认空不展示
     */
    rightContent: {
      type: String,
      default: ''
    },
    /**
     * 中间标题
     */
    title: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {

    }
  },
  methods: {
    onLeftClick () {
      this.$emit('on-left-click')
    },
    onRightClick () {
      this.$emit('on-right-click')
    }
  }
}
</script>

<style scoped>
  .header{
    text-align: center;
    position: relative;
    height: 32px;
    line-height: 32px;
  }
  .left-btn{
    position: absolute;
    left: 0;
  }
  .right-btn{
    position: absolute;
    right: 0;
  }
  .title{
    font-size: 18px;
  }
</style>
