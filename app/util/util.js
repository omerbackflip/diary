var fs = require('fs');
const path = require('path');

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

exports.checkAndStoreMedia = (record_id, medias, total_previous_media = 0) => {
	
	medias.forEach((media, media_no) => {
		ImageBase64 = media.fileContent;
		ImageBase64 = ImageBase64.replace(/^data:image\/octet-stream;base64,/, "");

		ImageBase64  +=  ImageBase64.replace('+', ' ');
		ImageBinaryData  =   new Buffer.from(ImageBase64, 'base64').toString('binary');

		media_counter = media_no + total_previous_media + 1;

		let filename = 'media-' + record_id + '-' + media_counter + '.jpeg'
		let uploadFolder = path.join(__dirname + '/../../client/' + process.env.VUE_APP_MEDIA_FILES_REL_DIR_PATH);
		
		
		fs.writeFile(uploadFolder + filename, ImageBinaryData, "binary", function (err) {
		    console.log("Error: While uploading files", err); // writes out file without error, but it's not a valid image
		});

		delete media.fileContent;

		media.filename = filename;
		media.uploadAt = new Date();
	});

	return medias;
}