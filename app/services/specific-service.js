const moment = require('moment');
const db = require("../models");

exports.getExcelToSave = (data) => {
    try {
        let documents = [];
        data.forEach(item => {
        let document = {
                flatId: item.flatId,
                name: item.name,
                phone: item.phone,
                email: item.email,
            };
            documents.push(document);
        });
        return documents;
    } catch (error) {
        console.log(error)
        throw error;
    }
}