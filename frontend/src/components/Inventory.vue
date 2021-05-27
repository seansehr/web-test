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

    <b-table v-if="!loading" :data="data" default-sort="start_time">
      <b-table-column field="id" label="ID" sortable v-slot="props">
        {{ props.row.id }}
      </b-table-column>
      <b-table-column
        field="start_time"
        label="Start Time"
        sortable
        v-slot="props"
      >
        {{ props.row.start_time }}
      </b-table-column>
      <b-table-column field="end_time" label="End Time" sortable v-slot="props">
        {{ props.row.end_time }}
      </b-table-column>
      <b-table-column field="capacity" label="Capacity" sortable v-slot="props">
        {{ props.row.capacity }}
      </b-table-column>
      <b-table-column custom-key="actions" v-slot="props">
        <b-button
          type="is-danger"
          @click="deleteInvetory(props.row.id)"
          icon-left="delete"
          >Delete</b-button
        >
      </b-table-column>
      <template #footer>
        <th></th>
        <th>
          <b-timepicker
            v-model="newStartTime"
            :incrementMinutes="minutesGranularity"
            hourFormat="24"
          ></b-timepicker>
        </th>
        <th>
          <b-timepicker
            v-model="newEndTime"
            :incrementMinutes="minutesGranularity"
            hourFormat="24"
          ></b-timepicker>
        </th>
        <th>
          <b-numberinput v-model="newCapacity" min="1"></b-numberinput>
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
const BASE_PATH = 'http://localhost:9090/inventory'
import axios from 'axios'
export default {
  data() {
    return {
      loading: false,
      error: null,
      data: [],
      newStartTime: null,
      newEndTime: null,
      newCapacity: 1,
      minutesGranularity: 15
    }
  },
  computed: {
    addButtonEnabled() {
      return (
        this.newEndTime &&
        this.newStartTime &&
        this.newEndTime >= this.newStartTime
      )
    },
    timesError() {
      return (
        this.newEndTime &&
        this.newStartTime &&
        this.newEndTime <= this.newStartTime
      )
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    $route: 'fetchData'
  },
  methods: {
    fetchData() {
      this.error = null
      this.loading = true
      axios.get(`${BASE_PATH}/`).then(res => {
        this.loading = false
        if (res.statusText !== 'OK') {
          this.error = 'TODO: Better errors'
        } else {
          this.data = res.data
        }
      })
    },
    addInventory() {
      if (!this.addButtonEnabled) {
        this.error = 'Start Time must be before End Time'
      } else {
        this.error = null
        axios
          .post(`${BASE_PATH}`, {
            // eslint-disable-next-line
            start_time: `${this.newStartTime.getHours()}:${this.newStartTime.getMinutes().toString().padStart(2, '0')}`,
            // eslint-disable-next-line
            end_time: `${this.newEndTime.getHours()}:${this.newEndTime.getMinutes().toString().padStart(2, '0')}`,
            capacity: this.newCapacity
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
    deleteInvetory(id) {
      axios
        .delete(`${BASE_PATH}/${id}`)
        .then(res => {
          if (res.statusText !== 'OK') {
            this.error = res.data.errors.join(', ')
          } else {
            this.data = res.data
            this.fetchData()
          }
        })
        .catch(res => (this.error = res.data.errors.join(', ')))
    }
  }
}
</script>
