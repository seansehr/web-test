<template>
  <div>
    <h1>Reservations</h1>
    <reservation-component></reservation-component>
  </div>
</template>

<script>
import ReservationComponent from '../components/Reservation.vue'

export default {
  components: { ReservationComponent },
  name: 'Reservations'
}
</script>
