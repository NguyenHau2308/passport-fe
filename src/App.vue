<template>
  <div>
    <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 32px;">
      Danh sách passport chờ xác nhận
    </h2>
    <div
      v-for="(p, idx) in passports"
      :key="idx"
      class="passport-card"
    >
      <div class="img-col">
        <img
          :src="backendUrl + '/api/passport-img/' + p.image_photo"
          class="avatar"
          alt="Photo"
        />
        <img
          :src="backendUrl + '/api/passport-img/' + p.image_vis"
          class="passport"
          alt="Passport"
        />
      </div>
      <div class="info-col">
        <div class="mrz-label">Mã ICAO/MRZ:</div>
        <pre class="mrz-code">{{ p.icao_mrz }}</pre>
        <button class="confirm-btn" @click="confirm(p)">
          Xác nhận (Confirm)
        </button>
      </div>
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
  }
};
</script>

<style scoped>
.passport-card {
  display: flex;
  gap: 32px;
  align-items: center;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 14px #0002;
  padding: 32px 28px;
  margin-bottom: 32px;
}
.img-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  min-width: 160px;
}
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid #ececec;
  box-shadow: 0 1px 4px #8883;
}
.passport {
  width: 200px;
  border-radius: 12px;
  object-fit: cover;
  border: 1.5px solid #eee;
  box-shadow: 0 1px 3px #aaa2;
}
.info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mrz-label {
  font-weight: bold;
  font-size: 1.05rem;
  margin-bottom: 4px;
}
.mrz-code {
  background: #f5f5f7;
  color: #222;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 1.13rem;
  line-height: 1.5;
  font-family: 'Fira Mono', 'Consolas', monospace;
  box-shadow: 0 1px 2px #eee;
  margin-bottom: 12px;
}
.confirm-btn {
  background: linear-gradient(90deg, #54d65c, #42b0fc);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 1.02rem;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 1px 6px #7dd4f250;
}
.confirm-btn:hover {
  background: linear-gradient(90deg, #48be52, #2a8fd6);
  box-shadow: 0 2px 10px #1ea66144;
  opacity: 0.92;
}
</style>
