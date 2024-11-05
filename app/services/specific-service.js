const moment = require('moment');
const db = require("../models");

exports.getExcelToSave = (data) => {
    try {
        let leads = [];
        data.forEach(item => {
        let diary = {
                name: item.name,
                phone: item.phone,
                email: item.email,
                last_update: !isNaN(Date.parse(item.last_update)) ? moment(item.last_update,"DD MM YYYY") : null,
                description: item.description,
                status: item.status
            };
            leads.push(diary);
        });
        return leads;
    } catch (error) {
        console.log(error)
        throw error;
    }
}