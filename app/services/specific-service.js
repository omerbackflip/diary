const moment = require('moment');
const db = require("../models");

exports.getExcelToSave = (data) => {
    try {
        let diaries = [];
        data.forEach(item => {
        let diary = {
                date: !isNaN(Date.parse(item.date)) ? moment(item.date,"DD MM YYYY").add(1,'days').subtract(1,'hour') : null,
                director: item.director,
                poalim: item.poalim,
                traktor: item.traktor,
                manitu: item.manitu,
                shufel: item.shufel,
                bagger: item.bagger,
                manof: item.manof,
                agoran: item.agoran,
                homarim: item.homarim,
                shonot: item.shonot,
                yetzikot: item.yetzikot,
                description: item.description,
            };
            diaries.push(diary);
        });
        return diaries;
    } catch (error) {
        console.log(error)
        throw error;
    }
}