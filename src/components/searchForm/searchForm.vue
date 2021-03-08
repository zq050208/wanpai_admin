<template>
  <Card :dis-hover="true" style="margin-bottom: 20px">
    <p v-if="title" slot="title">{{ title }}</p>
    <Form inline :label-width="100" :rules="rules" :mode="searchData" ref="form">
      <FormItem v-for="item in searchForm.components" :key="item.prop" :label="item.label" :label-width='item.width' :prop="item.prop">
        <!-- name为组件名称，prop是searchData中的字段，用来与组件做双向绑定 -->
        <Select
          v-if="item.name === 'Select'"
          v-model="searchData[item.prop]"
          :placeholder="item.placeholder"
          :prop="item.prop"
          :style="item.style"
          @on-change="item.onChange ? item.onChange($event) : ''"
        >
          <Option
            v-for="opt in item.options"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          ></Option>
        </Select>

        <Input
          clearable
          v-if="item.name === 'Input'"
          v-model="searchData[item.prop]"
          :placeholder="item.placeholder"
          :style="item.style"
          @on-blur="item.onChange ? item.onChange($event) : ''"
        />

        <SelectDate
          ref="date"
          v-if="item.name === 'SelectDate'"
          v-model="searchData[item.prop]"
          :showLeft="item.showLeft"
        />

        <DatePicker
          v-if="item.name === 'DatePicker'"
          v-model="searchData[item.prop]"
          type="datetime"
          :placeholder="item.placeholder"
          :style="item.style"
        />

        <RangeInput
          v-if="item.name === 'RangeInput'"
          v-model="searchData[item.prop]"
        />
      </FormItem>

      <FormItem :label-width="0">
        <Button v-for="btn in searchForm.actions" :key="btn.text" :type="btn.type || 'default'" @click="btn.handle" :icon="btn.icon" style="margin-left: 18px">{{ btn.text }}</Button>
      </FormItem>
    </Form>
  </Card>
</template>

<script>
// 需要自定义的组件
import SelectDate from './selectDate'
import RangeInput from './rangeInput'

export default {
  name: 'searchForm',
  components: {
    SelectDate,
    RangeInput
  },
  methods: {
    reset () {
      this.$refs.date[0].reset()
    },
    handleClick () {
      this.$refs.form.validate(valid => {
        console.log(valid)

        if (valid) {
          this.searchForm.button.handle()
        }
      })
    }
  },
  props: {
    // 组件所需数据，包含components，actions
    searchForm: {
      type: Object,
      required: true
    },
    // 组件绑定的数据结构
    searchData: {
      type: Object,
      required: true
    },
    // 组件卡片容器的标题
    title: {
      type: String
    },
    // 组件表单校验规则
    rules: {
      type: Object,
      default: () => {}
    },
    fun: {
      type: Function,
      default: () => {}
    }
  }
}
</script>
