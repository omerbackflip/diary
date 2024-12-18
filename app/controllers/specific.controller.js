const db = require("../models");
const LEADS_MODEL = db.leads;
const csv = require('csvtojson');
var fs = require('fs');
const XLSX = require('xlsx');
const { transformCSVData, storeMedia } = require("../util/util");
const specificService = require("../services/specific-service");
const { url } = require("../config/db.config");
const path = require('path');
// const { HOLDER_MODEL } = require("../../client/src/constants/constants");
// const HOLDER_MODEL = db.holders;

// **************** EXAMPLE FILE FOR SPECIFIC CONTROLLERS ************* //

exports.saveExcelBulk = async (req, res) => {
	try {
        await LEADS_MODEL.deleteMany();
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);
        let excelData = specificService.getExcelToSave(data[1]);
		if (excelData) {
			const result = await LEADS_MODEL.insertMany(excelData, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} DIARIES successfully Imported`
				})
			}
		}

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of the read Excel"
		});
	}
};

exports.getDbInfo = (req,res) => {
	try {
		const local = url.includes('localhost'); //retuens true/false
		return res.send({ success: true, local});
	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error getting db info", error });
	}
};

exports.savePic = async(req, res) => {
	try {
		const media = { ...req.body };
		if(media && media.fileContent){
			let picName = storeMedia(media.fileContent); // save the pics 
			res.send(picName);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error while savePic function in specifc.controller.js file"});		
	}
}

exports.deletePic = async(req, res) => {
	try {
		const fileName = req.body;
		let uploadFolder = path.join(__dirname + '/../../client/' + process.env.VUE_APP_MEDIA_FILES_REL_DIR_PATH);
		// fs.unlink(uploadFolder + fileName,() => {}) // fs.unlink must have callback - so dummy callback was added
		unLinkFile(uploadFolder + fileName)
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error while deletePic function in specifc.controller.js file"});		
	}
}

function unLinkFile(path) {
	fs.unlinkSync(path);
}
