import axios from "axios";
import http from "../http-common";
const baseUrl = process.env.VUE_APP_API_URL;

class SpecificServiceEndPoints {

  async saveExcelBulk(bulk) {
    var formData = new FormData();
    formData.append("file", bulk);
    return await axios.post(`${baseUrl}/specific/save-excel-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async getDbInfo() {
    return await axios.get(`${baseUrl}/specific/get-database-info`);
  }

  async getGoogleConnectionStatus(){
    return await axios.get(`${baseUrl}/specific/get-google-connection-status`);
  }

  async getPickerToken() {
    return await axios.get(`${baseUrl.replace('/specific', '')}/google/picker-token`);
  }

  savePic(data) {
    return http.post("specific/save-pic", data);
  }

  deletePic(data) {
    return http.post("specific/delete-pic", data);
  }

  syncGoogleSheets(data) {
    return http.get("specific/sync-google-sheets", data);
  }

  getGoogleSheetsSyncStatus() {
    return http.get("specific/google-sheets-sync-status");
  }

  bulkWriteApi(data,params) {
    return http.post("specific/bulk-write", data, {params});
  }

  async runBackup() {
    return await axios.post(`${baseUrl}/specific/backup/run`);
  }

  async restoreBackup(formData) {
    return await axios.post(`${baseUrl}/specific/backup/restore`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}

export default new SpecificServiceEndPoints();