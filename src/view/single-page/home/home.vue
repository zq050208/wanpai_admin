<template>
  <Card :style="{height:contentHeight}" class="home-page">
    <div class="home-page-message">
      {{helloMessage}}
    </div>
  </Card>
</template>
<script>
export default {
  name: 'home_page',
  props: {
    contentHeight: {
      type: String,
      default: '800px'
    }
  },
  data () {
    return {
      helloMessage: ''
    }
  },
  methods: {
    hello () {
      let hello = ''
      const hour = new Date().getHours()
      if (hour < 6) hello = '凌晨好，欢迎来到小虎电竞'
      else if (hour < 9) hello = '早上好，欢迎来到小虎电竞'
      else if (hour < 12) hello = '上午好，欢迎来到小虎电竞'
      else if (hour < 14) hello = '中午好，欢迎来到小虎电竞'
      else if (hour < 17) hello = '下午好，欢迎来到小虎电竞'
      else if (hour < 19) hello = '傍晚好，欢迎来到小虎电竞'
      else if (hour < 22) hello = '晚上好，欢迎来到小虎电竞'
      else { hello = '夜深了，注意休息' }
      this.helloMessage = hello
    }
  },
  created () {
    this.hello()
  },
  activated () {
    this.hello()
  }
}
</script>
<style lang="less">
  .home-page{
    display:flex;
    align-items:center;
    justify-content:center;
    background: #FAFCFF;
    @keyframes fade-in{
      0%{ opacity: 0; }
      50%{  opacity: 0.5; }
      100%{ opacity:1; }
    }
    @-webkit-keyframes fade-in{
      0%{ opacity: 0; }
      50%{  opacity: 0.5; }
      100%{ opacity:1; }
    }
    @-ms-keyframes fade-in{
      0%{ opacity: 0; }
      50%{  opacity: 0.5; }
      100%{ opacity:1; }
    }
    @-o-keyframes fade-in{
      0%{ opacity: 0; }
      50%{  opacity: 0.5; }
      100%{ opacity:1; }
    }
    @-moz-keyframes fade-in{
      0%{ opacity: 0;}
      50%{  opacity: 0.5; }
      100%{ opacity:1; }
    }
    .home-page-message{
      font-size: 26px;
      opacity: 0;
      animation: fade-in 3s ease 0s 1;
      -webkit-animation: fade-in 3s ease 0s 1;
      -moz-animation: fade-in 3s ease 0s 1;
      -o-animation: fade-in 3s ease 0s 1;
      -ms-animation: fade-in 3s ease 0s 1;

      animation-fill-mode:forwards;
      -webkit-animation-fill-mode: forwards;
      -o-animation-fill-mode: forwards;
      -ms-animation-fill-mode: forwards;
      -moz-animation-fill-mode: forwards;
    }
  }
</style>
