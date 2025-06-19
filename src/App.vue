<template>
  <div>
    <h2>Danh sách passport chờ xác nhận</h2>
    <div v-for="(p, idx) in passports" :key="idx" class="passport-card">
      <img
        :src="backendUrl + '/api/passport-img/' + p.image_photo"
        width="120"
        alt="Photo"
      />
      <img
        :src="backendUrl + '/api/passport-img/' + p.image_vis"
        width="120"
        alt="Passport"
      />
      <div>
        <div>Mã ICAO/MRZ:</div>
        <pre style="font-family:monospace; background:#eee; padding:10px">{{ p.icao_mrz }}</pre>
      </div>
      <button @click="confirm(p)">Xác nhận (Confirm)</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      passports: [],
      backendUrl: "http://localhost:4000",
    };
  },
  methods: {
    async fetchPassports() {
      const res = await axios.get(this.backendUrl + "/api/pending-passports");
      this.passports = res.data;
    },
    async confirm(p) {
      const res = await axios.post(this.backendUrl + "/check-passport", p);
      alert("Kết quả: " + JSON.stringify(res.data));
    },
  },
  mounted() {
    this.fetchPassports();
    setInterval(() => {
      this.fetchPassports();
    }, 10000);
  },
};
</script>
<style>
.passport-card {
  border: 1px solid #eee;
  padding: 12px;
  margin: 12px 0;
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
