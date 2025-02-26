import axios from "axios";
import http from "../http-common";
const baseUrl = process.env.VUE_APP_API_URL; //take the "http://localhost:3004/api"
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

  savePic(data) {
    return http.post("specific/save-pic", data);
  }
  
  deletePic(data) {
    return http.post("specific/delete-pic", data);
  }

  syncGoogleSheets(data) {
    return http.get("specific/sync-google-sheets", data);
  }
}

export default new SpecificServiceEndPoints();