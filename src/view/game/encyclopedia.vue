<template>
  <div>
    <Tabs @on-click="handleClick" :animated="false" v-model="activeTbas">
      <TabPane label="模块分类列表" name="list"></TabPane>
      <TabPane label="子模块" name="son"></TabPane>
      <TabPane label="子模块配置" name="collocate"></TabPane>
    </Tabs>
    <component :is="current"></component>
  </div>
</template>

<script>
export default {
  components: {
    List(resolve) {
      // 模块分类列表
      require(["./moduleSortList"], resolve);
    },
    EntryList(resolve) {
      // 子模块列表
      require(["./subModuleList"], resolve);
    },
    Collocate(resolve) {
      // 子模块配置
      require(["./subModuleCollocate"], resolve);
    }
  },
  data() {
    return {
      current: "List",
      activeTbas:'list'
    };
  },
  methods: {
    handleClick(name) {
      if (name === "list") {
        this.current = "List";
        window.sessionStorage.removeItem('oneLeve_Tabs')
      } else if (name === "son") {
        this.current = "EntryList";
        window.sessionStorage.removeItem('oneLeve_Tabs')
      } else {
        this.current = "Collocate";
      window.sessionStorage.setItem('oneLeve_Tabs',name)
      }
      // 保存点击记录
    }
  },
  mounted(){
    let tabsName = window.sessionStorage.getItem('oneLeve_Tabs')
    if(tabsName){
      this.current = tabsName
      this.activeTbas = tabsName
    }
  }
};
</script>
