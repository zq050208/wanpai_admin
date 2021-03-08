<template>
  <Card>
    <Row style="margin-bottom: 20px" >
      <Col :span="6">
        <RadioGroup v-model="type" type="button" @on-change="handleTypeChange">
          <Radio :label="1">安卓</Radio>
          <Radio :label="2">iOS</Radio>
        </RadioGroup>
      </Col>
      <Col :span="6">
        <Button type="default" @click="handleAddVersion">添加新版本</Button>
      </Col>
    </Row>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
    />
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="pageParams.total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />

    <Modal
      :title="mode === 'add' ? '添加新版本' : '修改版本'"
      footer-hide
      v-model="modalVisible"
    >
      <Form ref="form" :model="formData" :label-width="100">
        <FormItem label="版本号：" prop="version">
          <Input v-model="formData.version" />
        </FormItem>
        <FormItem label="更新地址：" prop="update_url">
          <Input v-model="formData.update_url" />
        </FormItem>
        <FormItem label="更新类型：" prop="update">
          <Select v-model="formData.update">
            <Option :value="1">正常更新</Option>
            <Option :value="2">强制更新</Option>
          </Select>
        </FormItem>
        <FormItem label="版本更新内容：" prop="update_desc">
          <Input v-model="formData.update_desc" type="textarea" :rows="5" />
        </FormItem>
        <FormItem>
          <Button type="primary" :disabled="!formData.version || !formData.update_url" :loading="submitLoading" @click="handleSubmit">提交</Button>
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>

<script>
import { getVersionManagement, addVersion, delVersion, editVersion, getEditVersionData } from '@/api/data'

export default {
  data () {
    return {
      submitLoading: false,
      type: 1,
      mode: '',
      modalVisible: false,
      formData: {
        version: '',
        update_url: '',
        update: 1,
        update_desc: ''
      },
      tableData: [],
      columns: [
        {
          align: 'center',
          title: '序号',
          key: 'id'
        },
        {
          align: 'center',
          title: '版本号',
          key: 'version'
        },
        {
          align: 'center',
          title: '更新地址',
          key: 'update_url'
        },
        {
          align: 'center',
          title: '更新内容',
          key: 'update_desc'
        },
        {
          align: 'center',
          title: '更新类型',
          key: 'update',
          render: (h, params) => {
            return h('div', {}, params.row.update === 1 ? '正常更新' : '强制更新')
          }
        },
        {
          align: 'center',
          title: '更新时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin-right': '8px'
                  },
                  on: {
                    click: () => {
                      this.formData = {...params.row}
                      this.mode = 'edit'
                      this.modalVisible = true
                    }
                  }
                },
                '修改'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认要删除此版本吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.delVersion(params.row.id)
                        }
                      })
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      }
    }
  },
  mounted () {
    this.getVersionManagement()
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if(valid) {
          if(this.mode === 'add') {
            this.addVersion()
          } else {
            this.editVersion()
          }
        }
      })
    },
    getVersionManagement () {
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        type: this.type
      }
      getVersionManagement(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.pageParams.total = res.data.data.total
          }
        })
    },
    addVersion() {
      const data = {
        type: this.type,
        ...this.formData
      }
      this.submitLoading = true
      addVersion(data)
        .then(res => {
          if(res.data.code === 200) {
            this.modalVisible = false
            this.$Message.success('添加成功')
            this.getVersionManagement()
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    delVersion (id) {
      this.submitLoading = true
      delVersion({ id })
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            this.getVersionManagement()
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    editVersion() {
      const data = {
        type: this.type,
        ...this.formData
      }
      editVersion(data)
        .then(res => {
          if(res.data.code === 200) {
            this.modalVisible = false
            this.$Message.success('修改成功')
            this.getVersionManagement()
          }
        })
    },
    handleAddVersion() {
      this.formData = {
        version: '',
        update_url: '',
        update: 1,
        update_desc	: ''
      }
      this.modalVisible = true
      this.mode = 'add'
    },
    handleTypeChange() {
      this.getVersionManagement()
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.getVersionManagement()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.getVersionManagement()
    }
  }
}
</script>

<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>
