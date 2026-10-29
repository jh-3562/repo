console.log("82", context);

const LIST = "Contact_CourrielClient";
const KEY  = "Contact_CourrielClient|1|Principal";

const rows = Array.isArray(docData?.[LIST]) ? docData[LIST] : [];
if (rows.length === 0) return {};

const asTrue = v => String(v).toLowerCase() === "true";
const bstr   = b => (b ? "true" : "false");

let idx = Number.isInteger(context?.indexItemChange) ? context.indexItemChange : -1;
if (idx < 0) idx = rows.findIndex(r => asTrue(r?.[KEY]));
if (idx < 0) idx = 0;

if (!asTrue(rows[idx]?.[KEY])) return {};

const updated = rows.map((r, i) => ({ ...r, [KEY]: bstr(i === idx) }));
const result  = { [LIST]: updated };

for (let i = 0; i < rows.length; i++) {
  const v = bstr(i === idx);
  result[`${LIST}[${i}].${KEY}`] = v;
  result[`${LIST}.${i}.${KEY}`]  = v;
}

return result;

