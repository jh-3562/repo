# CIA-GTJ

## Fonctions

- 27/10/2026 : 144 fonctions extraites (`Func N.js`), numéros fournis par l'utilisateur. Trous dans la numérotation : 10, 106, 119, 122.
- Le `console.log` ne correspond pas toujours au numéro : Func 28 affiche « Fonction 27 », Func 33 affiche « Fonction 50 », Func 131 affiche « [FUNCTION 130] ». Func 64 n'a pas de `console.log`.

## Batchs par vue (vérifié le 27/10/2026)

| Vue | Section | Batch | Func |
|---|---|---|---|
| Répartition | Transport_Mask | GenererOcurrenceMask | 132 |
| Répartition / Répartition Sécurisée | Transport_Table / Répartition_DonnéesTableSécurisées | ConfirmerTransportOptimisés | 81 |
| Répartition / Répartition Sécurisée | idem | RefuserTransportsNonAttribués | 82 |
| Répartition Sécurisée | DemandesSécuriséesTimeline | LancerOptim | 83 |
| Feuille de route | FeuilleRouteBouton | FeuilleDeRouteImprimer / FeuilleDeRouteEnvoiMail | 147 / 148 |

## Tickets en cours

- [[RÉPARTITION] - Indisponibilité non gérer](https://app.clickup.com/t/868mm4xre) : dans la timeline de l'onglet Répartition, un transport peut être assigné à un transporteur sur une plage « Indisponible ». Décision : bloquer. Le transporteur se choisit dans le formulaire Transport, onglet Opération, champ `Operation_NomDuTransporteur` (Search = Func 48). Le gabarit Transport n'a ni bouton ni batch (Enregistrer = bouton natif, sans fonction). Correction dans Func 48 (27/10/2026) : un transporteur dont une indisponibilité « Actif » chevauche le transport s'affiche « ⛔ … indisponible » et le choisir vide le champ. Collée en base et validée par l'utilisateur le 27/10/2026 (le filtre `BETWEEN` type DATE sur `Transporteur_Indisponibilites_Date` fonctionne). Ensuite (à recoller et tester) : la suggestion ⛔ affiche les infos du transporteur dans des clés factices (`dummykey_*`) et elle est grisée et non cliquable par CSS (`.chakra-popover__content h2.chakra-heading` → parent du parent = la suggestion) ; le `console.log` temporaire est retiré. L'horaire (`Horaire_<Jour>`) n'est pas vérifié (décision à prendre).

## Gabarits (FormLayoutID, lus dans le code)

- Demande : `5d7b4e39-c50a-428c-87ec-e9b68ac45e39`
- Transport : `017d9a14-b828-4cc5-8a9a-8906c1fcab59`
- Transporteur : `90737127-32da-4bb9-8d95-54b986c978eb`
- Indisponibilités : `7d19c79c-8a4a-418c-8d1a-89d0139ecb00` (créées par Func 20 et 116, annulées par Func 58)
- Adresses : `83b870bf-197a-4d47-96b0-a9df225b43b8`
- Utilisateur : `1f384f8f-2c25-49cd-bde8-86e7d19a5a8b`
- Taux : `d6fed3d1-3dd3-4c1b-8316-cd60ad256e41`
- Facture : `43ed55a2-0f07-4dc8-8ea2-9de2375a5c4f`
