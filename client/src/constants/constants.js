export const DIARY_MODEL = 'diarydatas';
export const TABLE_MODEL = 'tables';
export const LEAD_MODEL = 'leads';

export const DIARY_WEB_HEADERS = [
    { text: "תאריך",    value: "date",          class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},	
    // { text: "מנהל",     value: "director",      class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "פועלים",   value: "poalim",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "טרקטור",   value: "traktor",       class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "שופל",     value: "shufel",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "משאבה",    value: "pipe",          class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "באגר",     value: "bagger",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "מנוף",     value: "manof",         class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "מאניטו",   value: "manitu",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
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
    { text: "מאניטו",   value: "manitu",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "עגורן",    value: "agoran",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "יציקות",   value: "yetzikot",      class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "חומרים",   value: "homarim",       class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "שונות",    value: "shonot",        class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "תאור יום", value: "description",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"}
];
export const LEADS_HEADERS = [
    { text: "שם", value: "name",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "טלפון", value: "phone",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "תאור", value: "description",   class: "mobile-headers",    groupable: false,   align: "right", width: "40%"},
    // { text: "סטטוס", value: "status",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "עדכון אחרון", value: "last_update",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
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
};

export const isMobile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}