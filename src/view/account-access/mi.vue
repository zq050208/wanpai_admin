<template>
  <div>
    <!--<div v-for="x in menudata.children">-->
      <div v-if="menudata.children && menudata.children.length>0">
        <Dropdown placement="right-start" @on-click="showMenu">
          <DropdownItem :name="menudata.id">
            <span>{{menudata.channel_name}}</span>
            <Icon type="ios-arrow-right"></Icon>
          </DropdownItem>
          <DropdownMenu slot="list" v-for="(x, index) in menudata.children" :key="index">
            <DropdownItem :name="x.id">
              <span>{{x.channel_name}}</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div v-else>
        <DropdownItem :name="menudata.id">
          <span>{{menudata.channel_name}}</span>
        </DropdownItem>
      </div>
    </div>
</template>

<script>
export default {
  name: 'mi',
  props: ['menudata'],
  data () {
    return {
    }
  },
  methods: {
    showMenu (id, name) {
      console.log({ id: id, name: name })
      // this.$emit('on-click', {id:id,name:name})
    }
  }
}
</script>

<style scoped>

</style>
