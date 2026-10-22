console.log("Fonction 283", context);

const COLLECTION_FIELD = "Facturation_TarifCollec";
const UNIT_PRICE_FIELD = "Facturation_TarifCollec|3|PrixUnitaire";
const QUANTITY_FIELD = "Facturation_TarifCollec|4|Quantite";
const LINE_TOTAL_FIELD = "Facturation_TarifCollec|5|PrixTotal";

const SUBTOTAL_FIELD = "Facturation_PrixAvantTaxe";
const TPS_FIELD = "Facturation_TPS";
const TVQ_FIELD = "Facturation_TVQ";
const TOTAL_FIELD = "Facturation_PrixTotal";

const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;

const getValue = (result, key) => result?.[key] ?? docData?.[key];

const toNumber = (value) => parseFloat(value) || 0;

const isCollectionChange = () => inputKey?.includes(COLLECTION_FIELD);

const calculateCurrentLineTotal = (result) => {
  // Le prix de ligne saisi à la main ne doit pas être écrasé par quantité × prix unitaire
  if (inputKey === LINE_TOTAL_FIELD) return;

  const collection = getValue(result, COLLECTION_FIELD);
  const currentLine = collection?.[indexItemChange];
  if (!currentLine) return;

  const lineTotal =
    toNumber(currentLine[QUANTITY_FIELD]) * toNumber(currentLine[UNIT_PRICE_FIELD]);

  currentLine[LINE_TOTAL_FIELD] = lineTotal.toFixed(2);
  result[COLLECTION_FIELD] = collection;
};

const calculateSubtotal = (result) => {
  const collection = getValue(result, COLLECTION_FIELD) || [];

  const subtotal = collection.reduce(
    (sum, line) => sum + toNumber(line?.[LINE_TOTAL_FIELD]),
    0,
  );

  result[SUBTOTAL_FIELD] = subtotal.toFixed(2);
};

const calculateTaxes = (result) => {
  const subtotal = toNumber(getValue(result, SUBTOTAL_FIELD));

  result[TPS_FIELD] = (subtotal * TPS_RATE).toFixed(2);
  result[TVQ_FIELD] = (subtotal * TVQ_RATE).toFixed(2);
};

const calculateTotal = (result) => {
  const total =
    toNumber(getValue(result, SUBTOTAL_FIELD)) +
    toNumber(getValue(result, TPS_FIELD)) +
    toNumber(getValue(result, TVQ_FIELD));

  result[TOTAL_FIELD] = total.toFixed(2);
};

const calculateBilling = () => {
  const result = {};

  if (isCollectionChange()) {
    calculateCurrentLineTotal(result);
    calculateSubtotal(result);
    calculateTaxes(result);
    calculateTotal(result);
    return result;
  }

  if (inputKey === SUBTOTAL_FIELD) {
    calculateTaxes(result);
    calculateTotal(result);
    return result;
  }

  return result;
};

return calculateBilling();
