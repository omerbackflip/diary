var fs = require('fs');
const path = require('path');
const moment = require('moment');

exports.transformCSVData = (sheet_name_list, workbook) => {
	try {
		return sheet_name_list.map((y) => {
			var worksheet = workbook.Sheets[y];
			var headers = {};
			var data = [];

			Object.keys(worksheet).forEach((z) => {
				var tt = 0;
				for (var i = 0; i < z.length; i++) {
					if (!isNaN(z[i])) {
						tt = i;
						break;
					}
				};
				var col = z.substring(0, tt);
				var row = parseInt(z.substring(tt));
				var value = worksheet[z].v;

				if (row == 1 && value) {
					headers[col] = value;
				}

				if (!data[row]) data[row] = {};
				data[row][headers[col]] = value;
			})
			data.shift();
			data.shift();
			return data
		});
	} catch (error) {
		return false;
	}
};

exports.storeMedia = (fileContent) => {
  const base64 = fileContent.replace(/^data:image\/[^;]+;base64,/, "");

  const filename = 'pic-' + moment(new Date()).format('YYYY-MM-DD-HH.mm.ss') + '.jpeg';
  const uploadFolder = path.join(
    __dirname,
    '../../client',
    process.env.VUE_APP_MEDIA_FILES_REL_DIR_PATH || 'public/media_files/'
  );

  const filePath = path.join(uploadFolder, filename);

  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));

  return filename;
};