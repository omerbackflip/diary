const moment = require('moment');

exports.getExcelToSave = (data) => {
    try {
        let documents = [];
        data.forEach(item => {
        let document = { 
                // price Table
                // topic: item.topic,
                // topic_id: item.topic_id,
                // description: item.description,
                // measure: item.measure,
                // price: item.price,

                // leads table
                name: item.name,
                phone: item.phone,
                description: item.description,
                status: item.status,
                interested: item.interested,
                last_update: !isNaN(Date.parse(item.last_update)) ? moment(item.last_update).add(1,'days') : new Date(), //probably need to add 1 day because of initially exporting the excel with vue-excel-export
                email: item.email,
                arrivedFrom: item.arrivedFrom,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
            documents.push(document);
        });
        return documents;
    } catch (error) {
        console.log(error)
        throw error;
    }
},

exports.bulkWriteService = async (model,query) => {
    try {
        return await model.bulkWrite(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
}