<template>
  <Card>
    <p slot="title">{{ mode === 'add' ? '新建分类' : '编辑分类' }}</p>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="12" :sm="18" :xs="24">
        <Form ref="form" :label-width="100" :rules="formRules" :model="formData">
          <FormItem label="分类名称：" prop="cate_name">
            <Input placeholder="" v-model="formData.cate_name" />
          </FormItem>
          <FormItem label="上级分类：">
            <Select v-model="formData.pid" placeholder="请选择分类">
              <Option v-for="option in selectOptions" :key="option.id" :value="option.id">{{ option.cate_name }}</Option>
            </Select>
            <p>不选择分类默认为顶级分类</p>
          </FormItem>
          <FormItem label="权重排序：" prop="order">
            <Input v-model="formData.order" number />
            <p>数字越小越靠前</p>
          </FormItem>
          <FormItem label="启用状态：" prop="status">
            <i-switch v-model="formData.status" />
            <p>启用后将显示在游戏导航栏</p>
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
import { getCategoryInfo, addCategory, editCategory, getCateCheckCode, getCategoryList } from '@/api/data'
import { mapMutations } from 'vuex'

export default {
  watch: {
    '$route' (to, from) {
      if (to.meta.title === from.meta.title && to.params.mode === 'edit' && to.params.id !== from.params.id) {
        this.getCategoryInfo(to.params.id)
      } else if (to.meta.title === from.meta.title && to.params.mode === 'add') {
        this.formData = {
          pid: null,
          cate_name: '',
          order: '',
          status: true
        }
      }
    }
  },
  data () {
    const validateOrder = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入'))
      }
      if (!Number.isInteger(value)) {
        callback(new Error('请输入整数'))
      }
      callback()
    }
    return {
      mode: 'add',
      submitLoading: false,
      selectOptions: [],
      formData: {
        pid: null,
        cate_name: '',
        order: '',
        status: true
      },
      formRules: {
        cate_name: [
          { required: true, message: '请输入广告名称' },
          { type: 'string', max: 10, message: '最多只能输入10个字符' }
        ],
        order: [
          { required: true, message: '请输入' },
          { validator: validateOrder, trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择' }
        ]
      }
    }
  },
  mounted () {
    const { params, query } = this.$route
    if (params.mode) this.mode = params.mode

    if (params.id) {
      this.getCategoryInfo(params.id)
    }
    // this.getCategoryList()
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    getCategoryList () {
      const data = {
        page: 1,
        per_page: 10,
        level: 1
      }
      getCategoryList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.selectOptions = res.data.data.data
          }
        })
    },
    getCateCheckCode () {
      return new Promise((resolve, reject) => {
        getCateCheckCode()
          .then(res => {
            if (res.data.code === 200) {
              resolve(res.data)
            }
          })
      })
    },
    getCategoryInfo (id) {
      getCategoryInfo({ id })
        .then(res => {
          if (res.data.code === 200) {
            this.formData = res.data.data
            this.formData.status = res.data.data.status === 1
          }
        })
    },
    addCategory (checkcode) {
      const data = {
        checkcode,
        ...this.formData
      }
      if (data.pid) {
        data.level = 2
      } else {
        data.level = 1
      }
      if (data.status) {
        data.status = 1
      } else {
        data.status = 0
      }
      addCategory(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success(`新增分类成功`)
            this.closeTag(this.$route)
            this.$router.push({ path: `/content/category` })
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    editCategory (checkcode) {
      const data = {
        checkcode,
        ...this.formData
      }
      if (data.pid) {
        data.level = 2
      } else {
        data.level = 1
      }
      if (data.status) {
        data.status = 1
      } else {
        data.status = 0
      }
      editCategory(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success(`编辑分类成功`)
            this.closeTag(this.$route)
            this.$router.push({ path: `/content/category?level=${data.level}` })
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.getCateCheckCode()
            .then(res => {
              this.mode === 'add' ? this.addCategory(res.data.checkcode) : this.editCategory(res.data.checkcode)
            })
            .catch(() => {
              this.submitLoading = false
            })
        }
      })
    }
  }
}
</script>
