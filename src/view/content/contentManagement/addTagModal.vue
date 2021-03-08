<template>
  <Modal
    :value="modalVisible"
    title="请选择标签"
    @on-ok="ok"
    @on-cancel="cancel"
    @on-visible-change="visibleChange"
  >
    <div v-if="selectTags.length > 0">
      <Tag
        closable
        type="border"
        size="large"
        v-for="tag in selectTags"
        :key="tag.id"
        :name="tag.id"
        @on-close="handleCloseTag"
      >{{ tag.name }}</Tag>
    </div>

    <Row style="margin: 20px">
      <Col span="12" offset="12">
        <Input search v-model="searchWord" placeholder="搜索当前级别标签" suffix="ios-search" @on-search="handleSearch" />
      </Col>
    </Row>

    <Tabs :value="level">
      <TabPane disabled label="一级标签" name="1">
        <RadioGroup @on-change="tag1Change" v-model="selectValue1">
          <Radio border v-for="item in tag1Data" :key="item.id" :label="item.id">{{ item.name }}</Radio>
        </RadioGroup>
      </TabPane>

      <TabPane disabled label="二级标签" name="2">
        <RadioGroup @on-change="tag2Change" v-model="selectValue2">
          <Radio border v-for="item in tag2Data" :key="item.id" :label="item.id">{{ item.name }}</Radio>
        </RadioGroup>
      </TabPane>

      <TabPane disabled label="三级标签" name="3">
        <CheckboxGroup @on-change="handleCheckboxChange" v-model="selectValue3">
          <Checkbox :disabled="checkDisabled" v-for="item in tag3Data" :key="item.id" :label="item.id">{{ item.name }}</Checkbox>
        </CheckboxGroup>
      </TabPane>
    </Tabs>

  </Modal>
</template>

<script>
import { getAppTagData, getTagList } from '@/api/data'

export default {
  props: {
    modalVisible: {
      type: Boolean,
      required: true
    },
    selectTags: {
      type: Array,
      required: true
    },
    defaultSelectTags: {
      type: Array,
      required: true
    },
    hideModal: {
      type: Function,
      required: true
    }
  },
  mounted () {
    this.getAppTagData()
  },
  watch: {
    selectTags(val) {
      const result = []
      val.forEach(i => {
        if(i.level === 3) {
          result.push(i.id)
        }
      })
      this.selectValue3 = [...result]
    }
  },
  methods: {
    visibleChange (value) {
      if (value) {
        this.selectValue1 = null
        this.selectValue2 = null
        this.selectValue3 = []
        this.searchWord = ''
        this.checkDisabled = false
        this.getAppTagData()
      }
    },
    handleSearch() {
      this.getAppTagData()
    },
    tag1Change (value) {
      this.level = '2'

      this.getAppTagData({
        top_pid: Number(value)
      })
      if (this.top_pid) {
        this.pid = null
        this.selected = []
      }
      this.top_pid = value

      this.tag1Data.forEach(item => {
        if (item.id == value) {
          this.selected.push(item)
        }
      })
      this.$emit('selectTagChange', this.selected)
    },
    tag2Change (value) {
      this.level = '3'
      this.pid = value
      this.getAppTagData({
        top_pid: Number(this.top_pid),
        pid: Number(value)
      })
      this.tag2Data.forEach(item => {
        if (item.id == value) {
          this.selected.push(item)
        }
      })
      this.$emit('selectTagChange', this.selected)
    },
    handleCloseTag (e, id) {
      this.selected = this.selected.filter(i => i.id !== id)
      this.$emit('selectTagChange', this.selected)
      if(this.selected.length < 10) {
        this.checkDisabled = false
      }
    },
    handleCheckboxChange (checked) {
      const temp = []
      this.tag3Data.forEach(item => {
        checked.forEach(id => {
          if (item.id === id) {
            temp.push(item)
          }
        })
      })
      this.selected = this.formatArray(this.selected.concat(temp))
      this.$emit('selectTagChange', this.formatArray(this.selected.concat(temp)))

      if(this.selected.length >= 10) {
        this.checkDisabled = true
      }
    },
    formatArray(array) {
      const result = []
      array.forEach(item => {
        let flag = false
        result.forEach(i => {
          if(i.id === item.id) {
            flag = true
          }
        })
        if(!flag) {
          result.push(item)
        }
      })
      return result
    },
    getAppTagData (data) {
      const params = {
        level: Number(this.level),
        name: this.searchWord.replace(/\s*/g,""),
        ...data
      }
      getAppTagData(params)
        .then(res => {
          if (res.data.code === 200) {
            if (this.level === '1') {
              this.tag1Data = res.data.data || []
            }
            if (this.level === '2') {
              this.tag2Data = res.data.data || []
            }
            if (this.level === '3') {
              this.tag3Data = res.data.data || []
            }
          }
        })
    },
    ok () {
      this.hideModal()
      this.level = '1'
    },
    cancel () {
      this.hideModal()
      this.level = '1'
      if(this.$route.params.mode === 'add') {
        this.$emit('selectTagChange', [])
      } else {
        this.$emit('selectTagChange', this.defaultSelectTags)
      }
    }
  },
  data () {
    return {
      selectValue1: null,
      selectValue2: null,
      selectValue3: [],

      selected: [],

      level: '1',

      tag1Data: [],
      tag2Data: [],
      tag3Data: [],

      top_pid: null,
      pid: null,
      checkDisabled: false,
      searchWord: ''
    }
  }
}
</script>
