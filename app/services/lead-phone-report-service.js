const VALID_PHONE_PATTERN = /^0\d{9}$/;

function analyzePhone(phone) {
  const original = phone == null ? "" : String(phone).trim();
  const problems = [];

  if (!original) {
    return {
      valid: false,
      original,
      suggested: "",
      problems: ["empty phone"],
      fixable: false,
    };
  }

  if (VALID_PHONE_PATTERN.test(original)) {
    return {
      valid: true,
      original,
      suggested: original,
      problems: [],
      fixable: false,
    };
  }

  if (/\s/.test(original)) problems.push("contains spaces");
  if (/-/.test(original)) problems.push("contains hyphen");
  if (/[().]/.test(original)) problems.push("contains brackets or dots");
  if (/[^\d+\-\s().]/.test(original)) problems.push("contains unsupported characters");

  let suggested = original.replace(/[\s\-().]/g, "");

  if (suggested.startsWith("+972")) {
    problems.push("starts with +972");
    suggested = "0" + suggested.slice(4);
  } else if (suggested.startsWith("972")) {
    problems.push("starts with 972");
    suggested = "0" + suggested.slice(3);
  }

  const digitsOnly = suggested.replace(/\D/g, "");
  if (suggested !== digitsOnly) problems.push("contains non-digit characters after cleanup");
  suggested = digitsOnly;

  if (!suggested.startsWith("0")) problems.push("does not start with 0");
  if (suggested.length !== 10) problems.push(`has ${suggested.length} digits instead of 10`);

  if (!problems.length) problems.push("phone does not match required format");

  const suggestionValid = VALID_PHONE_PATTERN.test(suggested);

  return {
    valid: false,
    original,
    suggested,
    problems,
    fixable: suggestionValid,
  };
}

function buildPhoneReport(leads) {
  const analyzed = leads.map((lead) => {
    const phoneAnalysis = analyzePhone(lead.phone);

    return {
      _id: lead._id,
      name: lead.name || "",
      phone: phoneAnalysis.original,
      suggestedPhone: phoneAnalysis.suggested,
      problems: phoneAnalysis.problems,
      fixable: phoneAnalysis.fixable,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      valid: phoneAnalysis.valid,
    };
  });

  const items = analyzed.filter((item) => item.problems.length > 0);

  return {
    total: leads.length,
    invalidCount: items.length,
    fixableCount: items.filter((item) => item.fixable).length,
    reviewCount: items.filter((item) => !item.fixable).length,
    items,
  };
}

module.exports = {
  analyzePhone,
  buildPhoneReport,
};
