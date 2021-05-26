<template>
  <div>
    <h1>Inventory</h1>
    <inventory-component></inventory-component>
  </div>
</template>

<script>
import InventoryComponent from '../components/Inventory.vue'

export default {
  components: { InventoryComponent },
  name: 'Inventory'
}
</script>
