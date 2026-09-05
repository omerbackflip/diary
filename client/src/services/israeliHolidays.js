import axios from "axios";
import config from "../config/israeliCalendarConfig";

const HEBCAL_URL = "https://www.hebcal.com/hebcal";
const cache = new Map();
const pending = new Map();

const CLASSIFICATIONS = [
  { pattern: /^Rosh Hashana (?:I|II)(?: \d+)?$/i, type: "israeli-holiday", name: "ראש השנה", dayOff: true },
  { pattern: /^Yom Kippur$/i, type: "israeli-holiday", name: "יום כיפור", dayOff: true },
  { pattern: /^Sukkot I$/i, type: "israeli-holiday", name: "סוכות", dayOff: true },
  { pattern: /^(?:Shmini Atzeret|Simchat Torah)$/i, type: "israeli-holiday", name: "שמחת תורה / שמיני עצרת", dayOff: true },
  { pattern: /^Pesach (?:I|VII)$/i, type: "israeli-holiday", name: "פסח", dayOff: true },
  { pattern: /^Shavuot(?: I)?$/i, type: "israeli-holiday", name: "שבועות", dayOff: true },
  { pattern: /^Yom HaAtzma'ut(?: \(observed\))?$/i, type: "israeli-holiday", name: "יום העצמאות", dayOff: true },
  { pattern: /^Erev (?:Rosh Hashana|Yom Kippur|Sukkot|Pesach|Shavuot)$/i, type: "holiday-eve", name: "ערב חג", dayOff: false },
  { pattern: /^(?:Sukkot|Pesach) (?:II|III|IV|V|VI) \(CH(?:''|״)M\)$/i, type: "chol-hamoed", name: "חול המועד", dayOff: false },
  { pattern: /^(?:Yom HaZikaron|Yom HaShoah)(?: \(observed\))?$/i, type: "informational", name: "יום זיכרון", dayOff: false }
];

function parseDateKey(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || "").slice(0, 10));
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function weekdayForDate(date) {
  const parts = parseDateKey(date);
  return parts ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() : null;
}

export function isShabbat(date) {
  return weekdayForDate(date) === 6;
}

export function dateKeyInTimeZone(date = new Date(), timezone = config.timezone) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date).reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch (error) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

function classificationFor(title) {
  return CLASSIFICATIONS.find(item => item.pattern.test(title || ""));
}

function normalizeItem(item, options) {
  const classification = classificationFor(item.title_orig || item.title);
  if (!classification) return null;
  if (classification.type === "informational" && !options.showInformationalDates) return null;

  const blocksScheduling = classification.dayOff ||
    (classification.type === "holiday-eve" && options.holidayEvesBlockScheduling) ||
    (classification.type === "chol-hamoed" && options.cholHaMoedBlocksScheduling);
  const colorKey = classification.type === "israeli-holiday"
    ? "holiday"
    : classification.type === "holiday-eve"
      ? "holidayEve"
      : classification.type === "chol-hamoed"
        ? "cholHaMoed"
        : "informational";
  const date = String(item.date || "").slice(0, 10);

  return {
    _id: `hebcal:${classification.type}:${date}:${item.title_orig || item.title}`,
    name: item.hebrew || (/[\u0590-\u05ff]/.test(item.title || "") ? item.title : classification.name),
    start: date,
    end: date,
    timed: false,
    type: classification.type,
    isDayOff: classification.dayOff,
    blocksScheduling,
    color: options.colors[colorKey],
    source: "hebcal"
  };
}

function cacheKey(year, options) {
  return [year, options.cholHaMoedBlocksScheduling, options.holidayEvesBlockScheduling, options.showInformationalDates].join(":");
}

export async function getIsraeliHolidays(year, options = config) {
  const numericYear = Number(year);
  if (!Number.isInteger(numericYear)) return [];
  const key = cacheKey(numericYear, options);
  if (cache.has(key)) return cache.get(key);
  if (pending.has(key)) return pending.get(key);

  const request = axios.get(HEBCAL_URL, {
    params: {
      v: 1,
      cfg: "json",
      year: numericYear,
      yt: "G",
      month: "x",
      i: "on",
      lg: "he",
      maj: "on",
      min: "on",
      mod: "on"
    }
  }).then(response => {
    const events = (response.data && Array.isArray(response.data.items) ? response.data.items : [])
      .map(item => normalizeItem(item, options))
      .filter(Boolean);
    cache.set(key, events);
    return events;
  }).catch(error => {
    console.warn(`לא ניתן לטעון חגים לשנת ${numericYear}`, error);
    return [];
  }).finally(() => pending.delete(key));

  pending.set(key, request);
  return request;
}

export function getCachedIsraeliHolidays(year, options = config) {
  return cache.get(cacheKey(Number(year), options)) || [];
}

export async function getDateAvailability(date, options = config) {
  const parts = parseDateKey(date);
  if (!parts) return { available: true, event: null, message: "" };

  if (isShabbat(date)) {
    return { available: false, event: null, message: "לא ניתן לקבוע פגישה בתאריך זה: שבת" };
  }
  const weekday = weekdayForDate(date);
  if (weekday === 5 && options.fridayMode === "day-off") {
    return { available: false, event: null, message: "לא ניתן לקבוע פגישה בתאריך זה: יום שישי מוגדר כיום חופש" };
  }

  const events = await getIsraeliHolidays(parts.year, options);
  const event = events.find(item => item.start === date && item.blocksScheduling);
  return event
    ? { available: false, event, message: `לא ניתן לקבוע פגישה בתאריך זה: ${event.name}` }
    : { available: true, event: null, message: "" };
}

export default {
  getIsraeliHolidays,
  getCachedIsraeliHolidays,
  getDateAvailability,
  dateKeyInTimeZone,
  isShabbat,
  weekdayForDate
};
