<template>
  <Modal
    title="查看消息"
    :value="visible"
    footer-hide
    width="700"
    @on-visible-change="modalShowChange"
  >
    <Form style="padding: 40px">
      <FormItem label="消息类型：" required>
        <span>{{ itemData.type === 1 ? '文字消息' : itemData.type === 2 ? '活动消息' : '内容推荐' }}</span>
      </FormItem>
      <FormItem label="消息标题：" required>
        <span>{{ itemData.title }}</span>
      </FormItem>
      <FormItem label="关联URL：" required>
        <span>{{ itemData.relation_url }}</span>
      </FormItem>
      <FormItem label="关联房间号：" required>
        <span>{{ itemData.party_no }}</span>
      </FormItem>
      <FormItem label="关联作品：" required>
        <span>{{ relationContentTitle() }}</span>
      </FormItem>
      <FormItem label="文字内容：" required>
        <span class="msg">{{ itemData.msg }}</span>
      </FormItem>
      <FormItem label="发送对象：" required>
        <div v-if="typeof getReceiveUser(itemData) === 'string'">{{ getReceiveUser(itemData) }}</div>
        <div v-else>
          <p v-for="item in getReceiveUser(itemData)">{{item}}</p>
        </div>
      </FormItem>
      <FormItem label="发送时间：" required>
        <span>{{ itemData.send_time }}</span>
      </FormItem>
      <FormItem label="相关图片：" required>
        <template v-if="itemData.img_url">
          <img style="width: 160px; height: 160px; margin: 0 auto; display: itemData.img_url ? block : none" :src="itemData.img_url" />
        </template>
      </FormItem>
    </Form>
  </Modal>
</template>

<script>
export default {
  props: {
    itemData: {
      type: Object,
      required: true
    },
    relationContentData: {
      type: Array,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    relationContentTitle() {
      let result
      this.relationContentData.forEach(item => {
        if(item.id === this.itemData.content_id) {
          result = item.title
        }
      })
      return result
    },
    getReceiveUser(itemData) {
      if(!itemData.receive_user && itemData.receive_user !== 0) return ''

      if(itemData.receive_user === 0) return '全部'

      const result = []
      for (let i = 0; i < itemData.receive_user.length; i+=5) {
        result.push(itemData.receive_user.slice(i,i+5).join('，'))
      }
      return result
    },
    modalShowChange(visible) {
      if(visible) this.$emit('showModal')
      else this.$emit('hideModal')
    }
  }
}
</script>

<style scoped>
.msg {
  line-height: 34px;
}
</style>