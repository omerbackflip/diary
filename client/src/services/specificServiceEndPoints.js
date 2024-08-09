import axios from "axios";
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

  async saveBooksBulk(bulk,company) {
    var formData = new FormData();
    formData.append("file", bulk);
    formData.append("company", company);
    return await axios.post(`${baseUrl}/specific/save-books-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async getDbInfo() {
		return await axios.get(`${baseUrl}/specific/get-database-info`);
	}

}

export default new SpecificServiceEndPoints();