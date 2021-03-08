<template>
  <div>
    <RadioGroup v-if="showLeft" v-model="radioValue" type="button" @on-change="handleSelectChange">
      <Radio label="0">今天</Radio>
      <Radio label="7">近7天</Radio>
      <Radio label="30">近30天</Radio>
    </RadioGroup>
    <DatePicker
      style="width: 300px"
      v-model="time"
      format="yyyy-MM-dd HH:mm:ss"
      type="daterange"
      placement="bottom-end"
      @on-change="handleDateChange"
    />
  </div>
</template>

<script>
export default {
  name: 'selectDate',
  model: {
    prop: 'date',
    event: 'change'
  },
  props: {
    date: {
      type: [String, Array],
      required: true
    },
    showLeft: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      radioValue: '',
      time: ''
    }
  },
  methods: {
    handleSelectChange(selectValue) {
      let date = new Date()
      let list = this.getDateRange(date,selectValue,true)
      this.time = list
      this.$emit('change', list)
    },
    handleDateChange(date, dateType) {
      this.radioValue = ''
      this.$emit('change', date)
    },
    getDateRange (dateNow, intervalDays, bolPastTime) {
      let oneDayTime = 24 * 60 * 60 * 1000
      let list = []
      let lastDay
      if (bolPastTime == true) {
        lastDay = new Date(dateNow.getTime() - intervalDays * oneDayTime)
        list.push(this.formateDate(lastDay) + ' 00:00:00')
        list.push(this.formateDate(dateNow) + ' 23:59:59')
      } else {
        lastDay = new Date(dateNow.getTime() + intervalDays * oneDayTime)
        list.push(this.formateDate(dateNow) + ' 00:00:00')
        list.push(this.formateDate(lastDay) + ' 23:59:59')
      }
      return list
    },
    formateDate (time) {
      let year = time.getFullYear()
      let month = time.getMonth() + 1
      let day = time.getDate()
      if (month < 10) month = '0' + month
      if (day < 10) day = '0' + day
      return year + '-' + month + '-' + day + ''
    }
  }
}
</script>
