<template>
  <div>
    <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 32px">
      Danh sách passport chờ xác nhận
    </h2>
    <button
      v-if="getAccessToken()"
      @click="logoutKeycloak"
      style="position: fixed; top: 24px; right: 24px; z-index: 1000"
    >
      Đăng xuất
    </button>

    <div v-for="(p, idx) in passports" :key="idx" class="passport-card">
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
        <div class="mrz-label">Thông tin trích xuất từ ICAO/MRZ:</div>
        <table class="mrz-table">
          <tbody>
            <tr>
              <td>Passport Type</td>
              <td>{{ p.mrz_fields?.type || "" }}</td>
            </tr>
            <tr>
              <td>Country Code</td>
              <td>{{ p.mrz_fields?.country_code || "" }}</td>
            </tr>
            <tr>
              <td>Last Name</td>
              <td>{{ p.mrz_fields?.last_name || "" }}</td>
            </tr>
            <tr>
              <td>First Name</td>
              <td>{{ p.mrz_fields?.first_name || "" }}</td>
            </tr>
            <tr>
              <td>Passport No</td>
              <td>{{ p.mrz_fields?.passport_no || "" }}</td>
            </tr>
            <tr>
              <td>Nationality</td>
              <td>{{ p.mrz_fields?.nationality || "" }}</td>
            </tr>
            <tr>
              <td>Date of Birth</td>
              <td>{{ p.mrz_fields?.date_of_birth || "" }}</td>
            </tr>
            <tr>
              <td>Gender</td>
              <td>{{ p.mrz_fields?.gender || "" }}</td>
            </tr>
            <tr>
              <td>Date of Expiry</td>
              <td>{{ p.mrz_fields?.date_of_expiry || "" }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mrz-label" style="margin-top: 8px">Mã ICAO/MRZ:</div>
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
    <h2>Danh sách đã xác nhận</h2>
    <div v-for="p in processedPassports" :key="p.prefix" class="passport-card">
      <div class="info-col">
        <div>
          <b>{{ "KH" + p.prefix.padStart(3, "0") }}</b> -
          <button class="confirm-btn" @click="printPassport(p)">
            In giấy xác nhận
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
function parseMRZ(mrz) {
  const lines = (mrz || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length < 2) return {};
  const l1 = lines[0],
    l2 = lines[1];
  return {
    type: l1.slice(0, 2).replace(/</g, ""),
    country_code: l1.slice(2, 5).replace(/</g, ""),
    last_name: l1.slice(5).split("<<")[0].replace(/</g, ""),
    first_name: l1.slice(5).split("<<")[1]?.replace(/</g, "") || "",
    passport_no: l2.slice(0, 9).replace(/</g, ""),
    nationality: l2.slice(10, 13).replace(/</g, ""),
    date_of_birth:
      "19" + l2.slice(13, 15) + "-" + l2.slice(15, 17) + "-" + l2.slice(17, 19),
    gender: l2[20],
    date_of_expiry:
      "20" + l2.slice(21, 23) + "-" + l2.slice(23, 25) + "-" + l2.slice(25, 27),
  };
}
import axios from "axios";
import { logoutKeycloak, getAccessToken } from "./utils/keycloak.js";

export default {
  data() {
    return {
      passports: [],
      processedPassports: [],
      backendUrl: "http://localhost:4000",
      infoDialog: false,
      infoData: {},
    };
  },
  methods: {
    logoutKeycloak,
    getAccessToken,
    async fetchPassports() {
      const res = await axios.get(this.backendUrl + "/api/pending-passports");
      console.log("API trả về:", res.data);
      this.passports = res.data.map((p) => ({
        ...p,
        mrz_fields: parseMRZ(p.icao_mrz),
      }));
    },
    async fetchProcessed() {
      const res = await axios.get(this.backendUrl + "/api/processed-passports");
      this.processedPassports = res.data;
    },
    async confirm(p) {
      console.warn("==> [Check] Gửi check-passport", p.icao_mrz);
      // 1. Check passport (GỬI TOKEN)
      const res = await axios.post(
        this.backendUrl + "/check-passport",
        { icao_mrz: p.icao_mrz },
        {
          headers: {
            Authorization: "Bearer " + getAccessToken(),
          },
        }
      );
      console.warn("==> [Check] Kết quả từ backend:", res.data);
      if (res.data.result === "new customer created") {
        // 2. Gửi metadata tên file (không gửi file thật)
        const params = new URLSearchParams();
        params.append("customer_code", res.data.customer_code);
        params.append("image_photo", p.image_photo);
        params.append("image_vis", p.image_vis);
        params.append("prefix", p.info_file.split("-")[0]);

        console.warn(
          "==> [Upload] Chuẩn bị gửi tên file (x-www-form-urlencoded)"
        );

        await axios.post(this.backendUrl + "/upload-passport-images", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Bearer " + getAccessToken(),
          },
        });

        this.infoData = { ...res.data, icao_mrz: p.icao_mrz };
        this.infoDialog = true;
        setTimeout(this.fetchPassports, 500);
      } else {
        this.infoData = { ...res.data, icao_mrz: p.icao_mrz };
        this.infoDialog = true;
      }
    },
    printPassport(passport) {
      const clone = JSON.parse(JSON.stringify(passport));
      const code = "KH" + String(clone.prefix).padStart(3, "0");
      const mrz = clone.icao_mrz ? clone.icao_mrz.replace(/\n/g, "<br>") : "";
      const win = window.open("", "_blank");
      win.document.write(`
    <html>
      <head>
        <title>Phiếu xác nhận thông tin khách hàng</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h2 { margin-bottom: 16px; }
          .block { margin: 12px 0; }
          pre { background: #fafafa; border-radius: 8px; padding: 12px; }
        </style>
      </head>
      <body>
        <h2>PHIẾU XÁC NHẬN THÔNG TIN KHÁCH HÀNG</h2>
        <div class="block"><b>Mã khách hàng:</b> ${code}</div>
        <div class="block"><b>Mã ICAO/MRZ:</b></div>
        <pre>${mrz}</pre>
        <div class="block" style="margin-top: 32px;">Xác nhận và ký tên:</div>
        <div style="height:60px; border:1px solid #aaa; margin:24px 0 0 0;"></div>
      </body>
    </html>
  `);
      win.document.close();
      setTimeout(() => {
        win.print();
        win.close();
      }, 300);
    },
  },
  mounted() {
    this.fetchPassports();
    this.fetchProcessed();
    setInterval(() => {
      this.fetchPassports();
      this.fetchProcessed();
    }, 30000);
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
.mrz-table {
  margin-bottom: 14px;
  border-collapse: collapse;
}
.mrz-table td {
  border: 1px solid #eee;
  padding: 4px 12px;
  font-size: 1rem;
}
.mrz-table tr td:first-child {
  font-weight: bold;
  background: #fafafa;
}
</style>
