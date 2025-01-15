const path = require('path');

module.exports = {
	ServerApp : {
		google: {
			apiKeyForPicker: 'AIzaSyAQrhR1t9RJN0LICekbRAXQapR1IvVJ9xc', // picker API Key
			locale: 'en', //https://developers.google.com/drive/picker/reference/picker.locales.md
			pickerRootFolder: ['1nB3lzLf8lgszVEXK4hcGW1LuPl6-OonU'], // this is the id of "pick up root" folder in Google-Drive
		},
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
	}
};