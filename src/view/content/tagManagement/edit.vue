<template>
  <Card>
    <p slot="title">{{ mode === 'add' ? '新建标签' : '编辑标签' }}</p>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="10" :sm="15" :xs="24">
        <Form
          ref="form"
          :label-width="100"
          :rules="formRules"
          :model="formData"
        >
          <FormItem label="标签名称：" prop="name">
            <Input placeholder="" v-model="formData.name" />
          </FormItem>
          <FormItem label="上级标签：">
            <Row type="flex" justify="space-between" :gutter="16">
              <Col :span="12">
                <Select v-model="formData.top_pid" placeholder="请选择一级标签" @on-change="handleSelectChange">
                  <Option v-for="item in level1Select" :key="item.id" :value="item.id">{{ item.name }}</Option>
                </Select>
              </Col>
              <Col :span="12">
                <Select :disabled="!formData.top_pid" v-model="formData.pid" placeholder="请选择二级标签">
                  <Option v-for="item in level2Select" :key="item.id" :value="item.id">{{ item.name }}</Option>
                </Select>
              </Col>
            </Row>
            <p style="margin-top: 20px">不选择一级标签默认为新建一级标签，不选择二级标签默认为新建二级标签</p>
          </FormItem>
          <FormItem>
            <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
          </FormItem>
        </Form>
      </Col>
    </Row>
  </Card>
</template>

<script>
import { getTagInfo, addTag, editTag, getTagCheckCode, getAppTagData } from '@/api/data'
import { mapMutations } from 'vuex'

export default {
  watch: {
    '$route' (to, from) {
      if(to.meta.title === from.meta.title && to.params.mode === 'edit' && to.params.id !== from.params.id) {
        this.getTagInfo(to.params.id)
      } else if(to.meta.title === from.meta.title && to.params.mode === 'add') {
          this.formData = {
            name: '',
            top_pid: 0,
            pid: 0
          }
      }
    }
  },
  data () {
    return {
      mode: '',
      level1Select: [],
      level2Select: [],
      submitLoading: false,
      formData: {
        name: '',
        top_pid: 0,
        pid: 0
      },
      formRules: {
        name: [
          { required: true, message: '请输入标签名称' },
          { type: 'string', max: 10, message: '最多只能输入10个字符' }
        ]
      }
    }
  },
  mounted () {
    const { params } = this.$route
    if (params.mode) {
      this.mode = params.mode
    }
    if (params.id) {
      this.getTagInfo(params.id)
    }
    this.getAppTagData({level: 1})
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    getAppTagData(data) {
      getAppTagData(data)
        .then(res => {
          if(res.data.code === 200) {
            if (data.level === 1) this.level1Select = res.data.data
            else this.level2Select = res.data.data
          }
        })
    },
    getTagInfo (id) {
      getTagInfo({ id })
        .then(res => {
          if (res.data.code === 200) {
            this.formData = res.data.data
            if(res.data.data.top_pid) {
              this.getAppTagData({
                level: 2,
                top_pid: res.data.data.top_pid
              })
            }
          }
        })
    },
    getCheckCode () {
      return new Promise((resolve, reject) => {
        getTagCheckCode()
          .then(res => {
            if (res.data.code === 200) {
              resolve(res.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    addTag (checkcode) {
      const data = {
        ...this.formData,
        checkcode
      }
      data.level = data.top_pid ? data.pid ? 3 : 2 : 1
      addTag(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('添加成功')
            this.closeTag(this.$route)
            this.$router.push({ path: '/content/tag' })
            this.submitLoading = false
          }
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    editTag (checkcode) {
      const data = {
        ...this.formData,
        checkcode
      }
      data.level = data.top_pid ? data.pid ? 3 : 2 : 1
      editTag(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('编辑成功')
            this.closeTag(this.$route)
            this.$router.push({ path: `/content/tag?level=${data.level}` })
            this.submitLoading = false
          }
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handleSelectChange(pid) {
      this.getAppTagData({
        level: 2,
        top_pid: this.formData.top_pid
      })
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.getCheckCode()
            .then(res => {
              if (this.mode === 'add') {
                this.addTag(res.data.checkcode)
              } else {
                this.editTag(res.data.checkcode)
              }
            })
        }
      })
    }
  }
}
</script>
