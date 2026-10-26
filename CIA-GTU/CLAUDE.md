# CIA-GTU

Informations propres à ce client. Les règles communes à tous les clients sont dans `C:\Users\JérémyHoule\.claude\CLAUDE.md`.

## 1. Règles critiques

- Fonctions globales présentes (`showPopupLoading`, `showErrorBanner`…) : ne pas les recopier dans les fonctions.
- `isValidDocument` est disponible.

## 2. Repères

- `FasterClientID` : à confirmer. Fichiers : `Func N.js`. Test : `https://web.cat-gtm-test.fastercom.io`.
- Gabarits : Demande = `dadaf75a-cd49-4cba-8060-2ac15155478f`, Transport = `7242b957-a155-462e-ba68-c80f46751676`. Statuts : Soumise = `b9bb25d4-767a-4138-8c5e-a0bd9768d40d`, Planifiée = `32257499-b6ad-4a99-850b-85da7ace2aee`.
- Modules : Transporteurs, Demandes, Répartition, Suivi, Liste de rappel, Analyse, Données, Statistiques, Facturation, Chauffeur, Aide.
- `Transporteur` : `NomTransporteur`, statut `Actif`. `TARIFS` : `Tarif_Nom`, `Tarif_TypeTarif`, `Tarif_Montant`, `Tarif_Transporteur` (nom), `Tarif_DateDebut`, `Tarif_DateFin`.
- Fonction 190 : contient `formatDataAPI` (conversion d'une collection pour l'API).

## 3. Facturation

- Collection `Facturation_TarifCollec` (`|1|Nom`, `|2|Type`, `|3|PrixUnitaire`, `|4|Quantite`, `|5|PrixTotal`), `Facturation_PrixAvantTaxe`, `_TPS` (5 %), `_TVQ` (9,975 %), `_PrixTotal`, `_PrixReel`, `_Transporteur`. Tarifs ajoutés : quantité 1, valides à la date du jour.
- Fonction 283 : totaux de facturation (FILL). Fonction 282 : Search d'un tarif dans la collection.

## 4. Planification

- Depuis la répartition : `Edit_Planifier` (EDIT ; étape 30 = popup, Search 127 ; étape 31 = fonction 153).
- Depuis la demande : `PlanifieeButtonSoumiseBatch` (étape 54 = fonction 190).
- Depuis un transport : `Planifée_PROCESS` (étape 23 = fonction 137).
- Fonctions Search : 127 (`Répartition_Transporteur`), 227 (`NomTransporteurSearch`), 275 (`Tarif_Transporteur`), 282 (tarif dans la collection).
