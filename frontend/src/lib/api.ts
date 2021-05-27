import axios from 'axios'

const BASE_URL = 'http://localhost:9090'
const RESERVATION_URL = `${BASE_URL}/reservation`

const errorCatch = error => {
  if (Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.join(', ')
  }
  return error
}

export const ReservationApi = {
  fetchAll: params => {
    const qs = new URLSearchParams(params).toString()
    return axios
      .get(`${RESERVATION_URL}/?${qs}`)
      .then(res => {
        if (res.statusText !== 'OK') {
          throw new Error(res.data.errors.join(', '))
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
          return data
        }
      })
      .catch(errorCatch)
  },
  add: params => {
    return axios
      .post(`${RESERVATION_URL}`, params)
      .then(res => {
        if (res.statusText !== 'OK') {
          throw new Error(res.data.errors.join(', '))
        }
        return res.data
      })
      .catch(errorCatch)
  },
  delete: id => {
    return axios
      .delete(`${RESERVATION_URL}/${id}`)
      .then(res => {
        if (res.statusText !== 'OK') {
          throw new Error(res.data.errors.join(', '))
        }
        return res.data.id
      })
      .catch(errorCatch)
  }
}
