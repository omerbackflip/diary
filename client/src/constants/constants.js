export const DIARY_MODEL = 'diarydatas';
export const TABLE_MODEL = 'tables';

export const DIARY_WEB_HEADERS = [
    { text: "תאריך",    value: "date",          class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},	
    { text: "מנהל",     value: "director",      class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "פועלים",   value: "poalim",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "טרקטור",   value: "traktor",       class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "שופל",     value: "shufel",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "באגר",     value: "bagger",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "מנוף",     value: "manof",         class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "עגורן",    value: "agoran",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "יציקות",   value: "yetzikot",      class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "חומרים",   value: "homrim",        class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "שונות",    value: "shonot",        class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    { text: "תאור יום", value: "description",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"}
];

export const DIARY_MOBILE_HEADERS = [
    { text: "תאריך",    value: "date",          class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},	
    // { text: "מנהל",     value: "director",      class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "פועלים",   value: "poalim",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "טרקטור",   value: "traktor",       class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "שופל",     value: "shufel",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "באגר",     value: "bagger",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "מנוף",     value: "manof",         class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "עגורן",    value: "agoran",        class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    // { text: "יציקות",   value: "yetzikot",      class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "חומרים",   value: "homrim",        class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "שונות",    value: "shonot",        class: "mobile-headers",    groupable: false,   align: "right", width: "15%"},
    // { text: "תאור יום", value: "description",   class: "mobile-headers",    groupable: false,   align: "right", width: "15%"}
];

export const NEW_DIARY = {
    date: new Date(),
    director: null,
    poalim: null,
    traktor: null,
    shufel: null,
    bagger: null,
    manof: null,
    agoran: null,
    yetzikot: "",
    homarim: null,
    shonot: null,
    description: "",
};

export const isMobile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}