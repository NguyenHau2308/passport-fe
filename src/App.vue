<template>
  <div>
    <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 32px">
      Danh sách passport chờ xác nhận
    </h2>
    <div v-for="(p, idx) in passports" :key="idx" class="passport-card">
      <div class="img-col">
        <img :src="p.image_photo_base64" class="avatar" alt="Photo" />
        <img :src="p.image_vis_base64" class="passport" alt="Passport" />
      </div>
      <div class="info-col">
        <div class="mrz-label">Mã ICAO/MRZ:</div>
        <pre class="mrz-code">{{ p.icao_mrz }}</pre>
        <button class="confirm-btn" @click="confirm(p)">
          Xác nhận (Confirm)
        </button>
      </div>
    </div>
    <div v-if="infoDialog" class="dialog-backdrop">
      <div
        class="info-dialog"
        :class="{
          'dialog-success': infoData.result === 'new customer created',
          'dialog-existed': infoData.result === 'customer existed',
        }"
      >
        <h3 v-if="infoData.result === 'new customer created'">
          Tạo khách hàng mới thành công!
        </h3>
        <h3 v-else-if="infoData.result === 'customer existed'">
          Khách hàng đã tồn tại
        </h3>
        <div>
          Mã khách hàng: <b>{{ infoData.customer_code }}</b>
        </div>
        <div>Mã ICAO/MRZ:</div>
        <pre>{{ infoData.icao_mrz }}</pre>
        <button @click="infoDialog = false">Đóng</button>
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
      infoDialog: false,
      infoData: {},
    };
  },
  methods: {
    async fetchPassports() {
      const res = await axios.get(this.backendUrl + "/api/pending-passports");
      const list = res.data;
      for (const p of list) {
        const [photo, vis] = await Promise.all([
          axios.get(
            this.backendUrl + "/api/passport-img-base64/" + p.image_photo
          ),
          axios.get(
            this.backendUrl + "/api/passport-img-base64/" + p.image_vis
          ),
        ]);
        p.image_photo_base64 = photo.data.base64;
        p.image_vis_base64 = vis.data.base64;
      }
      this.passports = list;
    },
    async confirm(p) {
      console.warn("==> [Check] Gửi check-passport", p.icao_mrz);
      // 1. Check passport
      const res = await axios.post(this.backendUrl + "/check-passport", {
        icao_mrz: p.icao_mrz,
      });
      console.warn("==> [Check] Kết quả từ backend:", res.data);
      if (res.data.result === "new customer created") {
        // 2. Gửi tiếp 2 file ảnh
        const formData = new FormData();
        formData.append("customer_code", res.data.customer_code);
        console.warn("==> [Upload] Chuẩn bị upload ảnh...");
        formData.append(
          "image_photo",
          await fetch(
            this.backendUrl + "/api/passport-img/" + p.image_photo
          ).then((r) => r.blob()),
          p.image_photo
        );
        formData.append(
          "image_vis",
          await fetch(
            this.backendUrl + "/api/passport-img/" + p.image_vis
          ).then((r) => r.blob()),
          p.image_vis
        );

        await axios.post(
          this.backendUrl + "/upload-passport-images",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        this.infoData = { ...res.data, icao_mrz: p.icao_mrz };
        this.infoDialog = true;
        setTimeout(this.fetchPassports, 500);
      } else {
        this.infoData = { ...res.data, icao_mrz: p.icao_mrz };
        this.infoDialog = true;
      }
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
  font-family: "Fira Mono", "Consolas", monospace;
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
.dialog-backdrop {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: #0006;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-dialog {
  background: #fff;
  border-radius: 14px;
  padding: 32px 40px;
  box-shadow: 0 6px 48px #3336;
  min-width: 340px;
  text-align: center;
}
.info-dialog button {
  margin-top: 24px;
  background: #44aaff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 32px;
  font-size: 1.05rem;
  cursor: pointer;
  font-weight: bold;
}
.info-dialog.dialog-success {
  border-left: 8px solid #52c41a;
  background: #f6ffed;
}
.info-dialog.dialog-existed {
  border-left: 8px solid #faad14;
  background: #fffbe6;
}
.info-dialog button:hover {
  background: #0073b7;
}
</style>
