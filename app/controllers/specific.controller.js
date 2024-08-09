const db = require("../models");
const DIARY_MODEL = db.diarydatas;
// const Book = db.books;
const csv = require('csvtojson');
var fs = require('fs');
const XLSX = require('xlsx');
const { transformCSVData } = require("../util/util");
const specificService = require("../services/specific-service");
const { url } = require("../config/db.config");

// **************** EXAMPLE FILE FOR SPECIFIC CONTROLLERS ************* //

exports.saveExcelBulk = async (req, res) => {
	try {
        // await DIARY_MODEL.deleteMany();
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);
        let excelData = specificService.getExcelToSave(data[0]);
		if (excelData) {
			const result = await DIARY_MODEL.insertMany(excelData, { ordered: true });
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
			message: "Error saving bulk of Books"
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

function unLinkFile(path) {
	fs.unlinkSync(path);
}

// exports.saveBooksBulk = async (req, res) => {
// 	if (!req.body) {
// 		return res.status(400).send({
// 			message: "Data of bulk to update can not be empty!"
// 		});
// 	}

// 	try {
// 		let data = await csv().fromFile(`uploads/${req.file.filename}`);
// 		if (data) {
// 			// filter out all items with no "asmchta_date"
// 			data = data.filter((item) => item.asmchta_date !== '');
// 			const allData = await getMappedItems(data, req.body.company);
// 			const result = await Book.insertMany(allData, { ordered: true });
// 			unLinkFile(`uploads/${req.file.filename}`);
// 			if (result) {
// 				return res.send({
// 					hasErrors: false,
// 					message: "Data successfully Imported"
// 				})
// 			}
// 		}

// 	} catch (error) {
// 		console.log(error)
// 		res.status(500).send({
// 			message: "Error saving bulk of Invoices"
// 		});
// 	}
// };

// async function getMappedItems(filteredData, company) {
// 	const data = await Promise.all(filteredData.map(async (item, i) => {
// 		const { year, asmacta1, record_id } = item;
// 		if (company && year && asmacta1) { // if no date - probbaly is Yitra...
// 			await updateExcelRecID(company, year, asmacta1, record_id);
// 		}
// 		return {
// 			company,
// 			asmchta_date: item.asmchta_date,
// 			record_id: item.record_id,
// 			year: item.year,
// 			record_schum: item.record_schum,
// 			pratim: item.pratim,
// 			asmacta1: item.asmacta1,
// 			schum_hova: item.schum_hova,
// 			schum_zchut: item.schum_zchut,
// 			cust_lname: item.cust_lname,
// 			cust_fname: item.cust_fname,
// 			bs_item_name: item.bs_item_name,
// 			bs_group_name: item.bs_group_name,
// 		}
// 	}));
// 	return data;
// }

// async function updateExcelRecID(company, year, invoiceId, excelRecID) {
// 	return await Invoice.findOneAndUpdate({
// 		company,
// 		year,
// 		invoiceId
// 	},
// 		{ excelRecID });
// };

// function unLinkFile(path) {
// 	fs.unlinkSync(path);
// }