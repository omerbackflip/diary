export const DIARY_MODEL = 'diarydatas';
export const TABLE_MODEL = 'tables';
export const LEAD_MODEL = 'leads';
export const HOLDER_MODEL = 'holders';
import apiService from "../services/apiService";

export const DIARY_WEB_HEADERS = [
    { text: "תאריך",    value: "date",          class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},	
    // { text: "מנהל",     value: "director",      class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "פועלים",   value: "poalim",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "טרקטור",   value: "traktor",       class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "שופל",     value: "shufel",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "משאבה",    value: "pipe",          class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "באגר",     value: "bagger",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "מנוף",     value: "manof",         class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "משאית פסולת",   value: "manitu",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "עגורן",    value: "agoran",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "יציקות",   value: "yetzikot",      class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "חומרים",   value: "homarim",       class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "שונות",    value: "shonot",        class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "תאור יום", value: "description",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"}
];
export const DIARY_MOBILE_HEADERS = [
    { text: "תאריך",    value: "date",          class: "mobile-headers",    groupable: false,   align: "right", width: "75%"},	
    // { text: "מנהל",     value: "director",      class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "פועלים",   value: "poalim",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "מחפרון",   value: "traktor",       class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "שופל",     value: "shufel",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "משאבה",    value: "pipe",          class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "באגר",     value: "bagger",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "מנוף",     value: "manof",         class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "משאית פסולת",   value: "manitu",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "עגורן",    value: "agoran",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "יציקות",   value: "yetzikot",      class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "חומרים",   value: "homarim",       class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "שונות",    value: "shonot",        class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "תאור יום", value: "description",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"}
];
export const LEADS_HEADERS = [
    { text: "שם", value: "name",   class: "mobile-headers",    groupable: false,   align: "right", width: "25%"},
    { text: "טלפון", value: "phone",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "תאור", value: "description",   class: "mobile-headers",    groupable: false,   align: "right", width: "40%"},
    // { text: "סטטוס", value: "status",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "עדכון אחרון", value: "last_update",   class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
];
export const HOLDER_MOBILE_HEADERS = [
    { text: "מס' דירה", value: "flatId",   class: "mobile-headers",    groupable: false,   align: "right", width: "25%"},
    { text: "שם", value: "name",   class: "mobile-headers",    groupable: false,   align: "right", width: "40%"},
    { text: "טלפון", value: "phone",   class: "mobile-headers",    groupable: false,   align: "right", width: "35%"},
    // { text: "email", value: "email",   class: "mobile-headers",    groupable: false,   align: "right", width: "25%"},
];
export const NEW_DIARY = {
    date: new Date(),
    director: null,
    poalim: null,
    traktor: null,
    manitu: null,
    shufel: null,
    pipe: null,
    bagger: null,
    manof: null,
    agoran: null,
    yetzikot: "",
    homarim: "",
    shonot: "",
    description: "",
};
export const NEW_LEAD = {
    last_update: new Date(),
    name: "",
    phone: "",
    description: "",
    status: "",
    email: "",
};
export const NEW_HOLDER = {
    flatId: '',
    name: "",
    phone: "",
    email: "",
};

export const isMobile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
};

export const loadTable = async (table_id) => {
    try {
        const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
        if (response.data.length > 0) {
            return (response.data)
            // return (response.data.map((code) => code.description))
        } else return (window.alert("Read Table no - " + table_id + " faild"))
    } catch (error) {
        console.log(error);
    }
};