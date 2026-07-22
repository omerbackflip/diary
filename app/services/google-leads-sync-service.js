const { google } = require('googleapis');
const db = require("../models");
const googleSubmoduleService = require('./google-submodule-service');

const SPREADSHEET_ID = "1qS8rb0RDkOwVCuH7McXPYrlvrfctLFSaQ2hpFrmtbI0";
const RANGE = "'לידים'!A:I";

async function fetchNewRows(UPLOAD_MODEL) {
  const oAuth2Client = googleSubmoduleService.getOAuthClientFromStoredTokens();
  const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    let rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return 0;
    }

    rows = rows.slice(1);

    let lastLoad = await db.tables.findOne({ table_id: 99, table_code: 80 });
    const lastRowIndex = parseInt(lastLoad?.description || '0', 10);

    console.log("Last loaded row index:", lastRowIndex);

    const newRows = rows.slice(lastRowIndex + 1);

    console.log("Total rows:", rows.length);
    console.log("New rows to upload:", newRows.length);

    if (newRows.length > 0) {
      for (const row of newRows) {
        const [createdAt, name, phone, email, interested, adName, arrivedFrom, duration, answered] = row;
        const formattedPhone = formatPhoneNumber(phone);
        await UPLOAD_MODEL.create({
          name: name && name.trim() 
            ? name 
            : answered?.includes('yes') 
              ? `כוכבית - ${duration} שניות` 
              : 'כוכבית - לא נענתה',
          phone: formattedPhone,
          email,
          interested,
          adName,
          arrivedFrom
        });
      }

      const newLastIndex = lastRowIndex + newRows.length;

      await db.tables.findOneAndUpdate(
        { table_id: 99, table_code: 80 },
        { description: newLastIndex.toString() }
      );
    }

    console.log(`Fetched ${newRows.length} new rows from Google Sheets.`);
    return newRows.length;
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    throw error;
  }
}

function formatPhoneNumber(phone) {
  if (!phone) return phone;

  let formattedPhone = String(phone).trim();
  formattedPhone = formattedPhone.replace(/[\s\-().]/g, '');

  if (formattedPhone.startsWith('+972')) {
    formattedPhone = '0' + formattedPhone.slice(4);
  } else if (formattedPhone.startsWith('972') && !formattedPhone.startsWith('0')) {
    formattedPhone = '0' + formattedPhone.slice(3);
  }

  return formattedPhone;
}

module.exports = {
  fetchNewRows
};
