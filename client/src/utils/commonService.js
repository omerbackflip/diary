import SpecificServiceEndPoints from "../services/specificServiceEndPoints";

export async function checkGoogleStatus(setMenuItemCallback = null) {
    try {
        const response = await SpecificServiceEndPoints.getGoogleConnectionStatus();

        if (response.data.connected) {
            

            if (response.data.username !== '' && setMenuItemCallback != null) {
                setMenuItemCallback(`Google (${response.data.username})`);
            }

            if (response.data.client_secret !== '') {
                localStorage.setItem('developerKey', response.data.developerKey);
                localStorage.setItem('googleAccessToken', response.data.access_token);
                localStorage.setItem('folderId', response.data.folderId);
                localStorage.setItem('locale', response.data.locale);
            }
        } else {
            if(setMenuItemCallback != null){
              setMenuItemCallback('Google (Connect)');
              window.open(response.data.authUrl, '_self');
            }
        }

        return response;
    } catch (error) {
        console.log(error);
    }
}