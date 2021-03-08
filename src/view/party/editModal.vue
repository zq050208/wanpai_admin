<template>
  <Modal :value="visible" footer-hide @on-visible-change="visibleChange">
    <div v-if="mode === 'view'">
      <Tabs type="card" :value="tabValue" @on-click="tabsChange">
        <TabPane label="普通铭牌" name="1"></TabPane>
        <TabPane label="高级铭牌" name="2"></TabPane>
        <TabPane label="限量铭牌" name="3"></TabPane>
      </Tabs>
      <h4>已上传铭牌列表</h4>

      <div v-for="item in nameplateList" :key="item.id" class="item">
        <div class="left">
          <div class="img-container">
            <img class="image" :src="item.image" alt="" :style="{height: '87px', width: '138px', padding: item.color ? '8px' : '10px'}">

            <img v-if="item.color" class="image" :src="item.color" alt="" style="height: 87px; width: 138px">
            <img v-if="item.border" class="image" :src="item.border" alt="" style="height: 87px; width: 138px">
          </div>
          <div class="tip">
            <p>{{ item.name }}</p>
            <p style="color: rgba(245, 154, 35, 1)">{{ item.price }}P币</p>
            <div class="desc">已售{{ item.sell_num }}</div>
          </div>
        </div>
        <div class="right">
          <Button @click="handleOperate(item)">{{ item.status === 1 ? '下架' : '上架'}}</Button>
          <!-- 未上架的铭牌才显示删除按钮 -->
          <Button v-if="item.status !== 1" @click="handleDelete(item)">删除</Button>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px">
        <Button type="primary" @click="handleAdd">+ 添加铭牌</Button>
      </div>
    </div>

    <div v-if="mode === 'add'">
      <Tabs type="card" :value="editTabValue" @on-click="editTabsChange">
        <TabPane label="普通铭牌" name="1"></TabPane>
        <TabPane label="高级铭牌" name="2"></TabPane>
        <TabPane label="限量铭牌" name="3"></TabPane>
      </Tabs>
      <h4>请输入{{editTabValue === '1' ? '普通铭牌' : editTabValue === '2' ? '高级铭牌' : '限量铭牌'}}信息</h4>
      <template v-if="editTabValue === '1'">
        <NameplateForm
          v-for="(item, index) in normal"
          :key="index" :ref="'nameplateForm' + index"
          :editTabValue="editTabValue"
          :nameplate_color="nameplate_color"
          :nameplate_border="nameplate_border"
        />
      </template>
      <template v-if="editTabValue === '2'">
        <NameplateForm
          v-for="(item, index) in highLevel"
          :key="index" :ref="'nameplateForm' + index"
          :editTabValue="editTabValue"
          :nameplate_color="nameplate_color"
          :nameplate_border="nameplate_border"
        />
      </template>
      <template v-if="editTabValue === '3'">
        <NameplateForm
          v-for="(item, index) in limit"
          :key="index" :ref="'nameplateForm' + index"
          :editTabValue="editTabValue"
          :nameplate_color="nameplate_color"
          :nameplate_border="nameplate_border"
        />
      </template>
      <Row type="flex" justify="space-around">
        <Col :span="6">
          <Button long @click="handleAddItem">+ 新增</Button>
        </Col>
        <Col :span="6">
          <Button long @click="handleDeleteItem">删除</Button>
        </Col>
      </Row>

      <div slot="footer" style="text-align: center; margin-top: 48px">
        <Button type="primary" @click="handleSubmit">确定添加</Button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { getPartyNameplate, addPartyNameplate, partyNameplateAddView, shelfPartyNameplate, delPartyNameplate } from '@/api/data'
import NameplateForm from './nameplateForm'

export default {
  components: {
    NameplateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    party_id: {
      type: Number,
      required: true
    }
  },
  watch: {
    visible(value) {
      if(value) {
        this.getPartyNameplate()
      }
    }
  },
  data() {
    return {
      checkcode: '',
      nameplate_color: {},
      nameplate_border: {},

      mode: 'view',
      nameplateList: [],

      tabValue: '1',
      editTabValue: '1',

      normal: [],
      highLevel: [],
      limit: []
    }
  },
  methods: {
    handleSubmit() {
      if(this.editTabValue === '1') {
        let result = []
        this.normal.forEach((item, index) => {
          this.$refs[`nameplateForm${index}`][0].handleSubmit()
            .then(res => {
              result.push(res)
              if(index === this.normal.length - 1) {
                this.addPartyNameplate({
                  nameplate_level: 1,
                  nameplate_data: JSON.stringify(result)
                })
              }
            })
            .catch(err => {
              result = []
              return false
            })
        })
      }
      if(this.editTabValue === '2') {
        let result = []
        this.highLevel.forEach((item, index) => {
          this.$refs[`nameplateForm${index}`][0].handleSubmit()
            .then(res => {
              result.push(res)
              if(index === this.highLevel.length - 1) {
                this.addPartyNameplate({
                  nameplate_level: 2,
                  nameplate_data: JSON.stringify(result)
                })
              }
            })
            .catch(err => {
              result = []
              return false
            })
        })
      }
      if(this.editTabValue === '3') {
        let result = []
        this.limit.forEach((item, index) => {
          this.$refs[`nameplateForm${index}`][0].handleSubmit()
            .then(res => {
              result.push(res)
              if(index === this.limit.length - 1) {
                this.addPartyNameplate({
                  nameplate_level: 3,
                  nameplate_data: JSON.stringify(result)
                })
              }
            })
            .catch(err => {
              result = []
              return false
            })
        })
      }
    },
    handleDelete(item) {
      this.delPartyNameplate({
        id: item.id
      })
    },
    handleOperate(item) {
      this.shelfPartyNameplate({
        id: item.id,
        status: item.status === 1 ? 0 : 1
      })
    },
    delPartyNameplate(data) {
      delPartyNameplate(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('删除成功')
          this.getPartyNameplate()
        }
      })
    },
    shelfPartyNameplate(data) {
      shelfPartyNameplate(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('操作成功')
          this.getPartyNameplate()
        }
      })
    },
    getPartyNameplate() {
      const data = {
        party_id: this.party_id,
        nameplate_level: Number(this.tabValue)
      }
      getPartyNameplate(data).then(res => {
        if(res.data.code === 200) {
          this.nameplateList = res.data.data
        }
      })
    },
    addPartyNameplate(params) {
      const data = {
        checkcode: this.checkcode,
        party_id: this.party_id,
        ...params
      }
      addPartyNameplate(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('添加成功')
          this.$emit('hideModal')
        }
      })
    },
    partyNameplateAddView() {
      partyNameplateAddView().then(res => {
        if(res.data.code === 200) {
          this.checkcode = res.data.data.checkcode
          this.nameplate_color = res.data.data.nameplate_color
          this.nameplate_border = res.data.data.nameplate_border
        }
      })
    },
    handleAddItem() {
      if(this.editTabValue === '1') {
        this.normal.push(this.normal.length)
      }
      if(this.editTabValue === '2') {
        this.highLevel.push(this.highLevel.length)
      }
      if(this.editTabValue === '3') {
        this.limit.push(this.limit.length)
      }
    },
    handleDeleteItem() {
      if(this.editTabValue === '1' && this.normal.length > 0) {
        this.normal.pop()
      }
      if(this.editTabValue === '2' && this.highLevel.length > 0) {
        this.highLevel.pop()
      }
      if(this.editTabValue === '3' && this.limit.length > 0) {
        this.limit.pop()
      }
    },
    handleAdd() {
      this.mode = 'add'
      this.editTabValue = this.tabValue
    },
    tabsChange(value) {
      if(value !== this.tabValue) {
        this.tabValue = value
        this.getPartyNameplate()
      }
    },
    editTabsChange(value) {
      if(value !== this.editTabValue) {
        this.editTabValue = value
        if(value === '1') {
          this.highLevel = []
          this.limit = []
        }
        if(value === '2') {
          this.normal = []
          this.limit = []
        }
        if(value === '3') {
          this.normal = []
          this.highLevel = []
        }
      }
    },
    visibleChange(visible) {
      if(!visible) {
        this.$emit('hideModal')
        this.mode = 'view'
        this.normal = []
        this.highLevel = []
        this.limit = []
        this.tabValue = '1'
        this.editTabValue = '1'
      } else {
        this.partyNameplateAddView()
      }
    }
  }
}
</script>

<style>
.item {
  display: flex;
  justify-content: space-between;
  padding: 4px 16px;
  margin: 16px 0;
}
.left {
  display: flex;
  flex: 8;
}
.right {
  display: flex;
  flex: 2;
  flex-direction: column;
  justify-content: space-between;
}
.tip {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 24px;
}
.desc {
  border: 1px #e3e5e8 solid;
  border-radius: 6px;
  padding: 2px 6px
}

.edit-left {
  display: flex;
  flex: 3;
}
.edit-right {
  display: flex;
  flex: 7;
  /* flex-direction: column;
  justify-content: space-between; */
}
.img-container {
  position: relative;
  height: 87px;
  width: 136px
}
.image {
  position: absolute;
  top: 0;
  left: 0
}
</style>