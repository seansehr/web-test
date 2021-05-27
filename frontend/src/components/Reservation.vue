<template>
  <div>
    <div v-if="loading" class="loading">
      Loading...
    </div>

    <div v-if="error" class="error">
      <b-message type="is-danger">
        {{ error }}
      </b-message>
    </div>

    <div class="date_picker">
      <b-field label="Select a date">
        <b-datepicker
          v-model="date"
          placeholder="Click to select..."
          icon="calendar-today"
          trap-focus
        >
        </b-datepicker>
      </b-field>
    </div>

    <b-table
      v-if="!loading"
      :data="data"
      ref="table"
      detailed
      hoverable
      custom-detail-row
      :default-sort="['time', 'asc']"
      detail-key="time"
      @details-open="(row, index) => $buefy.toast.open(`Expanded ${row.time}`)"
      show-detail-icon
    >
      <b-table-column field="time" label="Time" sortable v-slot="props">
        <a @click="toggle(props.row)">{{ props.row.time }}</a>
      </b-table-column>
      <b-table-column field="name" label="Name" v-slot="props">
        {{ props.row.name }}
      </b-table-column>
      <b-table-column field="email" label="Email" sortable v-slot="props">
        {{ props.row.email }}
      </b-table-column>
      <b-table-column
        field="party_size"
        label="Party Size"
        sortable
        v-slot="props"
      >
        {{ props.row.party_size }}
      </b-table-column>
      <b-table-column custom-key="actions" width="200px">
        <div></div>
      </b-table-column>
      <template slot="detail" slot-scope="props">
        <tr v-for="item in props.row.items" :key="item.id">
          <td></td>
          <td class="has-text-centered">
            {{ item.time.toLocaleString() }}
          </td>
          <td>{{ item.name }}</td>
          <td class="has-text-centered">{{ item.email }}</td>
          <td class="has-text-centered">{{ item.party_size }}</td>
          <td>
            <b-button
              type="is-danger"
              @click="deleteReservation(item.id)"
              icon-left="delete"
              >Delete</b-button
            >
          </td>
        </tr>
      </template>
      <template #footer>
        <th></th>
        <th>
          <div class="date_input">
            <b-select v-model="newMonth" placeholder="Month" required>
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </b-select>
          </div>
          <div class="date_input">
            <b-select v-model="newDay" placeholder="Day" required>
              <option v-for="day in days" :value="day" :key="day">
                {{ day }}
              </option>
            </b-select>
          </div>
          <div class="date_input">
            <b-select v-model="newYear" placeholder="Year" required>
              <option v-for="year in years" :value="year" :key="year">
                {{ year }}
              </option>
            </b-select>
          </div>
          <div class="date_input">
            <b-select v-model="newHour" placeholder="Hour" required>
              <option v-for="hour in hours" :value="hour" :key="hour">
                {{ hour }}
              </option>
            </b-select>
          </div>
          <div class="date_input">
            <b-select v-model="newMinute" placeholder="Minute" required>
              <option v-for="minute in minutes" :value="minute" :key="minute">
                {{ minute }}
              </option>
            </b-select>
          </div>
        </th>
        <th>
          <b-input v-model="newName" placeholder="Name"></b-input>
        </th>
        <th>
          <b-input v-model="newEmail" placeholder="Email"></b-input>
        </th>
        <th>
          <b-select v-model="newPartySize" placeholder="Party Size" required>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
          </b-select>
        </th>
        <th>
          <b-button
            :type="addButtonEnabled ? 'is-success' : 'is-danger is-light'"
            @click="addInventory"
            >Add</b-button
          >
        </th>
      </template>
    </b-table>
  </div>
</template>

<script>
const BASE_PATH = 'http://localhost:9090/reservation'
import axios from 'axios'
export default {
  data() {
    const years = [2021, 2022, 2023]
    const hours = [...Array(24).keys()]
    const minutes = ['00', '15', '30', '45']
    const currentTime = new Date()
    return {
      loading: false,
      error: null,
      data: [],
      date: currentTime,
      newName: null,
      newEmail: null,
      newPartySize: 2,
      newMonth: 5,
      newYear: 2021,
      newHour: currentTime.getHours(),
      newMinute: '00',
      minutes,
      hours,
      years
    }
  },
  computed: {
    days() {
      if (this.newMonth !== undefined && this.newYear !== undefined) {
        const max = new Date(this.newYear, this.newMonth, 0).getDate()
        return max
      }
      return 31
    },
    newDay() {
      return this.date.getDate()
    },
    addButtonEnabled() {
      return (
        this.newName &&
        this.newEmail &&
        this.newDay &&
        this.newMonth &&
        this.newYear &&
        this.newHour &&
        this.newMinute
      )
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    $route: 'fetchData',
    date: 'fetchData'
  },
  methods: {
    toggle(row) {
      this.$refs.table.toggleDetails(row)
    },
    fetchData() {
      this.error = null
      this.loading = true
      const date = `${this.date.getFullYear()}-${this.date.getMonth()}-${this.date.getDate()}`
      axios.get(`${BASE_PATH}/?date=${date}`).then(res => {
        this.loading = false
        if (res.statusText !== 'OK') {
          this.error = 'TODO: Better errors'
        } else {
          const data = []
          res.data.forEach(i => {
            const item = { ...i, time: new Date(i.time) }
            const hour = item.time.getHours()
            const index = data.findIndex(i => i.hour === hour)
            if (data[index]) {
              data[index].items.push(item)
            } else {
              const time = new Date()
              time.setMinutes(0)
              time.setSeconds(0)
              time.setHours(hour)
              data.push({
                hour,
                time,
                items: [item]
              })
            }
          })
          this.data = data
        }
      })
    },
    addInventory() {
      if (!this.addButtonEnabled) {
        this.error = 'All fields required'
      } else {
        this.error = null
        const time = new Date(
          this.newYear,
          this.newMonth - 1,
          this.newDay,
          this.newHour,
          this.newMinute,
          0
        )
        axios
          .post(`${BASE_PATH}`, {
            name: this.newName,
            email: this.newEmail,
            // eslint-disable-next-line
            party_size: this.newPartySize,
            time: time
          })
          .then(res => {
            if (res.statusText !== 'OK') {
              this.error = res.data.errors.join(', ')
            } else {
              this.data = res.data
              this.fetchData()
            }
          })
          .catch(error => {
            this.error = error.response.data.errors.join(', ')
          })
      }
    },
    deleteReservation(id) {
      axios
        .delete(`${BASE_PATH}/${id}`)
        .then(res => {
          if (res.statusText !== 'OK') {
            this.error = res.data.errors.join(', ')
          } else {
            if (res.data.id) {
              const data = this.data.map(time => {
                return {
                  ...time,
                  items: time.items.filter(i => i.id !== res.data.id)
                }
              })
              this.data = data
            } else {
              this.fetchData()
            }
          }
        })
        .catch(res => (this.error = res.data.errors.join(', ')))
    }
  }
}
</script>

<style scoped lang="scss">
.date_picker {
  margin: auto;
  max-width: 500px;
}
.date_input {
  display: inline-block;
  margin-right: 5px;
}
</style>
