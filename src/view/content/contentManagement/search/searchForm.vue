<template>
  <Card style="margin-bottom: 20px">
    <p slot="title">数据筛选</p>
    <Form inline :label-width="110" :model="formData">
      <FormItem label="标题：">
        <Input v-model="formData.keywords" placeholder="请输入关键词" />
      </FormItem>
      <FormItem label="内容ID：">
        <Input v-model="formData.content_id" placeholder="请输入内容ID" />
      </FormItem>
      <FormItem label="发布者：">
        <Input v-model="formData.nickname" placeholder="请输入用户名" />
      </FormItem>
      <FormItem label="内容类型：">
        <Row style="width: 400px" :gutter="10">
          <Col span="7">
            <Select v-model="formData.type" placeholder="全部类型">
              <Option :value="-1">全部</Option>
              <Option :value="1">图文</Option>
              <Option :value="2">视频</Option>
            </Select>
          </Col>
          <!-- <Col span="7">
            <Select v-model="formData.parentCateId" @on-change="handleSelectChange" placeholder="一级分类">
              <Option v-for="item in category1" :key="item.id" :value="item.id">{{ item.cate_name }}</Option>
            </Select>
          </Col>
          <Col span="7">
            <Select v-model="formData.cateId" :disabled="!formData.parentCateId" placeholder="二级分类">
              <Option v-for="item in category2" :key="item.id" :value="item.id">{{ item.cate_name }}</Option>
            </Select>
          </Col> -->
        </Row>
      </FormItem>
      <FormItem label="主题专栏：">
        <Select v-model="formData.is_well" style="width: 120px">
          <Option :value="-1">全部</Option>
          <Option :value="1">游戏头条</Option>
        </Select>
      </FormItem>
      <FormItem label="标签：">
        <Row style="width: 400px" :gutter="10">
          <Col span="7">
            <Select v-model="tagSelect.level1" @on-change="handleTagChange(1, $event)" placeholder="一级标签">
              <Option v-for="item in tag1Data" :key="item.id" :value="item.id">{{ item.name }}</Option>
            </Select>
          </Col>
          <Col span="7">
            <Select v-model="tagSelect.level2" :disabled="!tagSelect.level1" @on-change="handleTagChange(2, $event)" placeholder="二级标签">
              <Option v-for="item in tag2Data" :key="item.id" :value="item.id">{{ item.name }}</Option>
            </Select>
          </Col>
          <Col span="7">
            <Select v-model="tagSelect.level3" :disabled="!tagSelect.level2" placeholder="三级标签">
              <Option v-for="item in tag3Data" :key="item.id" :value="item.id">{{ item.name }}</Option>
            </Select>
          </Col>
        </Row>
      </FormItem>
      <FormItem label="状态：">
        <Select v-model="formData.status">
          <Option :value="-1">全部</Option>
          <Option :value="1">启用</Option>
          <Option :value="0">禁用</Option>
        </Select>
      </FormItem>
      <FormItem label="发布时间：">
        <SelectDate v-model="formData.date" />
      </FormItem>

      <FormItem>
        <Button style="text-align: right" type="primary" @click="handleClick">搜索</Button>
      </FormItem>
    </Form>
  </Card>
</template>

<script>
import SelectDate from './selectDate'
import { getCategoryData, getAppTagData } from '@/api/data'

export default {
  name: 'searchForm',
  components: {
    SelectDate,
  },
  mounted() {
    this.getCategoryData({level: 1})
    this.getAppTagData({level: 1})
  },
  methods: {
    handleTagChange(level, tagId) {
      const data = {
        level: level + 1,
      }
      if(level === 1) {
        if(tagId === -1) {
          this.tag2Data = []
          this.tag3Data = []
          this.tagSelect.level2 = null
          this.tagSelect.level3 = null
        }
        data.top_pid = tagId
      }
      if(level === 2) {
        if(tagId === -1) {
          this.tag3Data = []
          this.tagSelect.level3 = null
        }
        data.pid = tagId
      }
      if(tagId !== -1) {
        this.getAppTagData(data)
      }
    },
    handleSelectChange(value) {
      if(value === -1) {
        this.category2 = []
      } else {
        this.getCategoryData({level: 2, pid: value})
      }
    },
    getTagId() {
      const { tagSelect } = this
      let result
      if(tagSelect.level1) {
        if(tagSelect.level1 !== -1) result = tagSelect.level1
        else result = ''
      }
      if(tagSelect.level2) {
        if(tagSelect.level2 !== -1) result = tagSelect.level2
        else result = tagSelect.level1
      }
      if(tagSelect.level3) {
        if(tagSelect.level3 !== -1) result = tagSelect.level3
        else result = tagSelect.level2
      }
      return result
    },
    handleClick() {
      const { formData, tagSelect } = this
      const data = {...formData}
      data.start_time = formData.date[0]
      data.end_time = formData.date[1]
      delete data.date
      const tagId = this.getTagId()
      const searchParams = {
        ...data,
        type: data.type === -1 ? '' : data.type,
        parentCateId: data.parentCateId === -1 ? '' : data.parentCateId,
        cateId: data.cateId === -1 ? '' : data.cateId,
        tagId: tagId ? Number(tagId) : '',
        status: data.status === -1 ? '' : data.status,
        is_well: data.is_well === -1 ? '' : data.is_well
      }
      this.$emit('handleSearch', searchParams)
    },
    getAppTagData(data) {
      getAppTagData(data)
        .then(res => {
          if(res.data.code === 200) {
            if(data.level === 1) {
              this.tag1Data = [{id: -1, name: '全部一级标签'}, ...res.data.data]
              if(res.data.data.length === 0) {
                this.tagSelect.level1 = null
                this.tagSelect.level2 = null
                this.tagSelect.level3 = null
              }
            }
            if(data.level === 2) {
              this.tag2Data = [{id: -1, name: '全部二级标签'}, ...res.data.data]
              if(res.data.data.length === 0) {
                this.tagSelect.level2 = null
                this.tagSelect.level3 = null
              }
            }
            if(data.level === 3) {
              this.tag3Data = [{id: -1, name: '全部三级标签'}, ...res.data.data]
              if(res.data.data.length === 0) {
                this.tagSelect.level3 = null
              }
            }
          }
        })
    },
    getCategoryData(data) {
      getCategoryData(data)
        .then(res => {
          if(res.data.code === 200) {
            if(data.level === 1) {
              this.category1 = [{id: -1, cate_name: '全部一级分类'}, ...res.data.data]
            }
            if(data.level === 2) {
              this.category2 = [{id: -1, cate_name: '全部二级分类'}, ...res.data.data]
            }
          }
        })
    }
  },
  data() {
    return {
      formData: {
        status: '',
        keywords: '',
        content_id: '',
        nickname: '',
        type: null,
        is_well: null,
        parentCateId: null,
        cateId: null,
        date: '',
        tagId: null
      },

      category1: [],
      category2: [],
      tag1Data: [],
      tag2Data: [],
      tag3Data: [],

      tagSelect: {
        level1: null,
        level2: null,
        level3: null,
      }
    }
  },
}
</script>
