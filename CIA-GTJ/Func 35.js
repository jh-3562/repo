console.log("Fonction 35 - Disabled on 25-05-2026, remove if not needed a while after", context);

// const FORMLAYOUT_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";

// if (docData.FORMLAYOUTID !== FORMLAYOUT_ID) return;

// function buildDate(date, heure) {
//   if (!date) return null;
//   const heureFinale = heure || "23:59";
//   return new Date(`${date}T${heureFinale}`);
// }

// const showCustomPopup = (params) => {
//   if (document.getElementById("customPopup")) return;
//   const { title, commentHTML, fields, buttons } = params;
//   function getField(params2) {
//     const {
//       key,
//       name,
//       type,
//       options,
//       style: style2,
//       defaultValue,
//       min,
//       max,
//       required,
//     } = params2;
//     const wrapper = document.createElement("div");
//     wrapper.className = "popup-input";
//     const fieldTitle = document.createElement("label");
//     fieldTitle.innerHTML = required
//       ? `${name || key} <span style="color: #FF0000">*</span>`
//       : name || key;
//     fieldTitle.htmlFor = key;
//     switch (type.toLocaleLowerCase()) {
//       case "select":
//         let select = document.createElement("select");
//         select.name = key;
//         if (style2) select.style = style2;
//         select.id = key;
//         (options || []).forEach(({ value, label: label2 }) => {
//           const opt = document.createElement("option");
//           opt.value = value;
//           opt.textContent = label2;
//           select.appendChild(opt);
//         });
//         wrapper.append(fieldTitle, select);
//         break;
//       case "checkbox":
//         let checkbox = document.createElement("input");
//         checkbox.type = "checkbox";
//         checkbox.name = key;
//         if (style2) checkbox.style = style2;
//         checkbox.id = key;
//         wrapper.classList.add("popup-input-row");
//         wrapper.append(checkbox, fieldTitle);
//         break;
//       case "number":
//         let numberInput = document.createElement("input");
//         numberInput.type = "number";
//         numberInput.name = key;
//         if (style2) numberInput.style = style2;
//         if (defaultValue !== void 0) numberInput.value = defaultValue;
//         if (min !== void 0) numberInput.min = min;
//         if (max !== void 0) numberInput.max = max;
//         if (required) numberInput.required = true;
//         numberInput.step = "1";
//         numberInput.id = key;
//         numberInput.addEventListener("input", () => {
//           let cleaned = numberInput.value.replace(/[^\d]/g, "");
//           if (cleaned === "") {
//             numberInput.value = "";
//             return;
//           }
//           let value = parseInt(cleaned, 10);
//           const maxValue = Number(max);
//           const minValue = Number(min);
//           if (!isNaN(maxValue) && value > maxValue) {
//             value = maxValue;
//           } else if (!isNaN(minValue) && value < minValue) {
//             value = minValue;
//           }
//           numberInput.value = value.toString();
//         });
//         wrapper.append(fieldTitle, numberInput);
//         break;
//       case "label":
//         const label = document.createElement("span");
//         label.innerHTML = name || "";
//         if (style2) label.style = style2;
//         wrapper.appendChild(label);
//         break;
//       case "date":
//         let dateInput = document.createElement("input");
//         dateInput.type = "date";
//         dateInput.name = key;
//         if (style2) dateInput.style = style2;
//         if (defaultValue) dateInput.value = defaultValue;
//         if (required) dateInput.required = true;
//         dateInput.id = key;
//         wrapper.append(fieldTitle, dateInput);
//         break;
//       case "time":
//         let timeInput = document.createElement("input");
//         timeInput.type = "time";
//         timeInput.name = key;
//         if (style2) timeInput.style = style2;
//         if (defaultValue) timeInput.value = defaultValue;
//         if (required) timeInput.required = true;
//         timeInput.id = key;
//         wrapper.append(fieldTitle, timeInput);
//         break;
//       default:
//         let input = document.createElement("input");
//         input.type = type.toLowerCase();
//         input.name = key;
//         if (style2) input.style = style2;
//         input.id = key;
//         wrapper.append(fieldTitle, input);
//         break;
//     }
//     return wrapper;
//   }
//   const overlay = document.createElement("div");
//   overlay.className = "popup-overlay";
//   const popup = document.createElement("form");
//   popup.id = "customPopup";
//   popup.className = "popup-box";
//   const style = document.createElement("style");
//   style.textContent = `
//   .popup-overlay {
//     position: fixed;
//     inset: 0;
//     background: rgba(0, 0, 0, 0.4);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     z-index: 9999;
//     animation: fadeInOverlay 0.15s ease-out;
//   }

//   @keyframes fadeInOverlay {
//     from {
//       background: rgba(0, 0, 0, 0);
//     }
//     to {
//       background: rgba(0, 0, 0, 0.4);
//     }
//   }

//   .popup-box {
//     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
//     background: white;
//     border-radius: 0.375rem;
//     padding: 15px 25px;
//     width: 500px;
//     box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//     animation: fadeInScale 0.15s ease-out;
//   }

//   @keyframes fadeInScale {
//     from {
//       opacity: 0;
//       transform: scale(0.95);
//       background: rgba(0, 0, 0, 0);
//     }
//     to {
//       opacity: 1;
//       transform: scale(1);
//     }
//   }

//   .popup-box h1,
//   .popup-box h2,
//   .popup-box h3,
//   .popup-box p,
//   .popup-box span {
//     color: #202127;
//   }

//   .popup-box h2 {
//     margin: 0 0 20px;
//     font-size: 1.25rem;
//   }

//   .popup-box p,
//   .popup-box span {
//     font-size: 1rem;
//   }

//   .popup-comment {
//     margin-bottom: 20px;
//   }

//   .popup-input {
//     display: flex;
//     flex-direction: column;
//     margin-bottom: 10px;
//   }

//   .popup-input-row {
//     flex-direction: row;
//     align-items: center;
//     gap: 10px;
//   }

//   .popup-input label {
//     margin-bottom: 5px;
//     font-size: 12px;
//   }

//   .popup-input input,
//   .popup-input select {
//     padding: 8px 10px;
//     border: 1px solid #ccc;
//     border-radius: 0.375rem;
//     font-size: 1rem;
//   }

//   .popup-input.invalid input,
// .popup-input.invalid select {
//   border: 1px solid #FF0000;
// }

//   .popup-buttons {
//     display: flex;
//     justify-content: flex-end;
//     gap: 10px;
//   }

//   .popup-buttons button, .popup-buttons input[type='button'] {
//     border: none;
//     padding: 3px 30px;
//     border-radius: 0.375rem;
//     cursor: pointer;
//     font-weight: 600;
//     font-size: 0.875rem;
//   }

//   @media (max-width: 768px) {
//     .popup-input input,
//     .popup-input select {
//         width: 100%;
//     }
//   }
// `;
//   popup.appendChild(style);
//   if (title) {
//     const titleElem = document.createElement("h2");
//     titleElem.textContent = title;
//     titleElem.style.fontWeight = "bold";
//     popup.appendChild(titleElem);
//   }
//   if (commentHTML) {
//     const comment = document.createElement("div");
//     comment.className = "popup-comment";
//     comment.innerHTML = commentHTML;
//     popup.appendChild(comment);
//   }
//   if (fields)
//     for (const field of fields) {
//       popup.appendChild(getField(field));
//     }
//   const buttonRow = document.createElement("div");
//   buttonRow.className = "popup-buttons";
//   if (buttons) {
//     for (const button of buttons) {
//       const btn = document.createElement("button");
//       btn.textContent = button.name;
//       switch (button.preset) {
//         case "action":
//           btn.style.backgroundColor = "#3182ce";
//           btn.style.color = "#f2f7fb";
//           break;
//         case "cancel":
//           btn.style.backgroundColor = "#f5f5f6";
//           btn.style.color = "#2c2d32";
//           break;
//         default:
//           btn.style.backgroundColor = "#3182ce";
//           btn.style.color = "#f2f7fb";
//           break;
//       }
//       if (button.backgroundColor)
//         btn.style.backgroundColor = button.backgroundColor;
//       if (button.color) btn.style.color = button.color;
//       btn.onclick = () => {
//         const form = document.getElementById("customPopup");
//         if (button.key != "cancel" && !form.reportValidity()) {
//           const fields2 = form.querySelectorAll(
//             ".popup-input input, .popup-input select",
//           );
//           fields2.forEach((el) => {
//             if (el.hasAttribute("required"))
//               el.parentElement.classList.add("invalid");
//           });
//           return;
//         }
//         const values = {};
//         const elements = popup.querySelectorAll("input, select");
//         for (const el of elements) {
//           values[el.name] = el.type === "checkbox" ? el.checked : el.value;
//         }
//         button.onClick(values);
//         document.body.removeChild(overlay);
//       };
//       buttonRow.appendChild(btn);
//     }
//   }
//   popup.appendChild(buttonRow);
//   overlay.appendChild(popup);
//   document.body.appendChild(overlay);
// };

// const showPopupErreur = (titleInput, message) => {
//   return new Promise((resolve) => {
//     showCustomPopup({
//       title: titleInput,
//       commentHTML: message,
//       buttons: [
//         {
//           name: "Retour",
//           backgroundColor: "#b2f2bb",
//           color: "#1e1e1e",
//           onClick: () => resolve(false),
//         },
//       ],
//     });
//   });
// };

// const dates = {
//   depart: docData.DemandeAllerD_Date,
//   arrivee: docData.DemandeAllerA_Date,
//   retourDepart: docData.DemandeRetourD_Date,
//   retourArrivee: docData.DemandeRetourA_Date,
// };

// const hours = {
//   depart: docData.DemandeAllerD_Heure,
//   arrivee: docData.DemandeAllerA_Heure,
//   retourDepart: docData.DemandeRetourD_Heure,
//   retourArrivee: docData.DemandeRetourA_Heure,
// };

// const depart = buildDate(dates.depart, hours.depart);
// const arrivee = buildDate(dates.arrivee, hours.arrivee);
// const retourDepart = buildDate(dates.retourDepart, hours.retourDepart);
// const retourArrivee = buildDate(dates.retourArrivee, hours.retourArrivee);

// const firstNonNullKey = Object.keys(dates).find((key) => dates[key]);

// if (firstNonNullKey) {
//   const firstDate = dates[firstNonNullKey];

//   const corrected = {};
//   if (!dates.depart) corrected.DemandeAllerD_Date = firstDate;
//   if (!dates.arrivee) corrected.DemandeAllerA_Date = firstDate;
//   if (!dates.retourDepart) corrected.DemandeRetourD_Date = firstDate;
//   if (!dates.retourArrivee) corrected.DemandeRetourA_Date = firstDate;

//   if (Object.keys(corrected).length > 0) {
//     return corrected;
//   }
// }

// const typeTransport = docData.Transport_TypeTransport;

// let ordreValide = true;

// if (typeTransport === "Aller") {
//   ordreValide = depart <= arrivee;
// } else if (typeTransport === "Retour") {
//   ordreValide = retourDepart <= retourArrivee;
// } else if (typeTransport === "Aller/Retour") {
//   ordreValide =
//     depart <= arrivee &&
//     arrivee <= retourDepart &&
//     retourDepart <= retourArrivee;
// }

// if (!ordreValide) {
//   let ordreDatesValide = true;

//   if (typeTransport === "Aller") {
//     ordreDatesValide = depart.getDate() <= arrivee.getDate();
//   } else if (typeTransport === "Retour") {
//     ordreDatesValide = retourDepart.getDate() <= retourArrivee.getDate();
//   } else if (typeTransport === "Aller/retour") {
//     ordreDatesValide =
//       depart.getDate() <= arrivee.getDate() &&
//       arrivee.getDate() <= retourDepart.getDate() &&
//       retourDepart.getDate() <= retourArrivee.getDate();
//   }

//   if (!ordreDatesValide) {
//     const corrected = {};

//     const minDate = (...v) => v.reduce((a, b) => (a < b ? a : b));
//     const maxDate = (...v) => v.reduce((a, b) => (a > b ? a : b));

//     corrected.DemandeRetourA_Date = maxDate(
//       dates.depart,
//       dates.arrivee,
//       dates.retourDepart,
//       dates.retourArrivee,
//     );
//     corrected.DemandeRetourD_Date = maxDate(
//       maxDate(dates.depart, dates.arrivee),
//       minDate(dates.retourDepart, corrected.DemandeRetourA_Date),
//     );
//     corrected.DemandeAllerA_Date = maxDate(
//       dates.depart,
//       minDate(
//         dates.arrivee,
//         minDate(corrected.DemandeRetourD_Date, corrected.DemandeRetourA_Date),
//       ),
//     );
//     corrected.DemandeAllerD_Date = minDate(
//       dates.depart,
//       corrected.DemandeAllerA_Date,
//       corrected.DemandeRetourD_Date,
//       corrected.DemandeRetourA_Date,
//     );

//     return corrected;
//   } else {
//     showPopupErreur(
//       "Les heures de départs ou d'arrivées sont incorrectes.",
//       "Veuillez modifier vos dates et vos heures.",
//     );
//   }
// }

// return;
