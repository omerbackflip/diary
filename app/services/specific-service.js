// const moment = require('moment');
// const db = require("../models");

exports.getExcelToSave = (data) => {
    try {
        let documents = [];
        data.forEach(item => {
        let document = {
                name: item.name,    // this is Leads table
                phone: item.phone,
                description: item.description,
                status: item.status,
                last_update: item.last_update,
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