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

  savePic(data) {
    return http.post("specific/save-pic", data);
  }
  
  deletePic(data) {
    return http.post("specific/delete-pic", data);
  }
}

export default new SpecificServiceEndPoints();