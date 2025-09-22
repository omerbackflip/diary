export const DIARY_MODEL = 'diarydatas';
export const TABLE_MODEL = 'tables';
export const LEAD_MODEL = 'leads';
export const HOLDER_MODEL = 'holders';
export const PRICE_MODEL = 'prices';
export const BILL_MODEL = 'bills';
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
    { text: "שם", value: "name",                class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "טלפון", value: "phone",            class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "סטטוס", value: "status",           class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "מודעה", value: "adName",           class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "הגיע אלינו", value: "arrivedFrom", class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "מעונין", value: "interested",      class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "ת. מעקב", value: "trackDate",      class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "עדכון אחרון", value: "updatedAt",  class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "קליטה", value: "createdAt",        class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "פגישה", value: "meatting",         class: "mobile-headers",    groupable: false,   align: "right", width: "3%"},
];
export const LEADS_SUMMARY_HEADERS = [
    { text: "הגיע אלינו", value: "source", class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "כמות", value: "count", class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
];
export const HOLDER_MOBILE_HEADERS = [
    { text: "דירה", value: "flatId",   class: "mobile-headers px-2",    groupable: false,   align: "right", width: "5%"},
    { text: "שם", value: "name",   class: "mobile-headers",    groupable: false,   align: "right", width: "35%"},
    { text: "ת.מסירה", value: "mesiraDate",   class: "mobile-headers",    groupable: false,   align: "right", width: "10%"},
    { text: "סטטוס", value: "status",   class: "mobile-headers",    groupable: false,   align: "right", width: "5%"},
    { text: "מטבח", value: "mitbach",   class: "mobile-headers",    groupable: false, width: "5%"},
    { text: "סניטרים", value: "senitar",   class: "mobile-headers",    groupable: false, width: "2%"},
    { text: "ת.דייר", value: "payedFile",   class: "mobile-headers rotated-header",    groupable: false, width: "1%"},
    // { text: "תוכניות", value: "sendPlans",   class: "mobile-headers rotated-header",    groupable: false, width: "1%"},
    { text: "ה. מחיר", value: "gotOffer",   class: "mobile-headers rotated-header",    groupable: false, width: "1%"},
    { text: "שולם", value: "payedOffer",   class: "mobile-headers rotated-header",    groupable: false, width: "1%"},
    // { text: "בניה", value: "bniya",   class: "mobile-headers rotated-header",    groupable: false, width: "1%"},
    // { text: "חשמל", value: "hashmal",   class: "mobile-headers rotated-header",    groupable: false, width: "1%"},
];
export const BILL_HEADERS = [
    { text: "מס'", value: "line", class: 'success title', width: "1%"},
    // { text: "flatId", value: "flatId", class: 'success title'},
    // { text: "bill_id", value: "bill_id", class: 'success title'},
    { text: "פריט", value: "topic_id", class: 'success title', groupable: false, width: "30%" },
    // { text: "תאור", value: "description", class: 'success title', groupable: false, width: "15%" },
    // { text: "יח'", value: "measure", class: 'success title', groupable: false, width: "1%" },
    // { text: "מחיר", value: "price", class: 'success title', groupable: false, width: "2%" },
    { text: "כמות", value: "amount", class: 'success title', groupable: false, width: "2%" },
    { text: "סה'כ", value: "tprice", sortable: false, class: 'success title', groupable: false, width: "2%"  },
    { text: "קוד חיוב", value: "charge_type", sortable: false, class: 'success title', groupable: false, width: "2%"  },
    { text: "לתשלום", value: "toPay", sortable: false, class: 'success title', groupable: false, width: "1%"  },
    { text: "הערה", value: "remark", sortable: false, class: 'success title', groupable: false, width: "15%"  },
    { text: "מחק", value: "actions", sortable: false, class: 'success title', groupable: false, width: "1%"  },
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
    flatId: null,
    name: "",
    phone: "",
    email: "",
    status: "",
    remark: "",
    payedFile: false,
    GDParantFolder: "",
    mesiraDate: new Date(),
};
export const NEW_BILL = {
    flatId: null,
    bill_id: null,
    topic_id: null,
    amount: null,
    tprice: null,
    charge_type: null,
    toPay: null,
    remark: null,
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
export const sendWhatsapp = (phone) => {
  let fixedPhone = phone;
  if (phone.charAt(0) === '0') fixedPhone = phone.substring(1);
  window.open('https://api.whatsapp.com/send?phone=972'+fixedPhone.replace("-", ""))
};
export async function viewGDFile(fileId, modalDialogRef) {
    try {
        const fileView = `https://docs.google.com/file/d/${fileId}/preview?usp=drivesdk`;
        await modalDialogRef.open(fileView);
        // window.open(fileView, '_blank'); // Opens the file in a new tab
    } catch (error) {
        console.error('Error viewing file:', error);
    }
}
export async function shareOnWhatsApp (fileId, msg) {
    const googleDriveLink = `https://drive.google.com/file/d/${fileId}/view`;
    const message = msg + ' ' + googleDriveLink;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');
}

