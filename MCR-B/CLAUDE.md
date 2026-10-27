# MCR-B — Croix-Rouge de Belgique (ClickUp : « CRB-M - Croix-Rouge de Belgique »)

Informations propres à ce client. Les règles communes à tous les clients sont dans `C:\Users\JérémyHoule\.claude\CLAUDE.md`.

## 1. Règles critiques

- **Ne pas modifier `Func 291.js`** (version en production, protégée par un hook).
- **Fonctions globales absentes** (`showPopupLoading`, `showErrorBanner`…) : chaque fonction doit les définir elle-même. Les copier de `C:\Users\JérémyHoule\.claude\modeles\popups.js` (ou des fonctions 3, 71, 142 du dépôt).
- `isValidDocument` est disponible.
- La plupart des fonctions commencent par vérifier l'URL : `mcrDictionary[window.location.pathname.split("/")[1]]` (segment d'URL → nom de la Maison, ex. `mcr.arlon` → `MCR Arlon`). `mcrDictionary` est global, hors dépôt.

## 2. Repères

- `FasterClientID` = `9ae9ac6a-ae26-49b6-8d93-73685e4e16bc`.
- Gabarits : Mission = `0e44171d-1616-4a50-9b36-aff4d998c4a5`, Facture = `81e43068-2f10-426b-b78b-dfd855136bd5`, Véhicule = `56f6c94d-6706-4630-a0a6-3588cd954e06`, Volontaire (formulaire du chauffeur) = `7c6d6132-ca2b-411c-86e9-baaaa130faa3`, Tarif = `43eb719b-4a1c-44ac-9cf3-276cbc089fad`, Disponibilité = `cd81267c-4a6b-451b-846f-22999f0be1f5`, Bénéficiaire = `3da52cab-039f-4a19-93ce-c904fe1e2ef0`, Profil MCR = `40307eab-5d1b-4ae2-adae-bcd79c11fcd5`.
- Rôles : `1. CHAUFFEUR`, `1. ADMIN`, `1. COORDINATEUR`, `1. DISPATCHEUR`, `1. RESPONSABLE D'ACTIVITÉ`, `1. CHARGÉ DE LA FACTURATION`, `1. DEVELOPPEUR`.
- Fichiers : `Func N.js`, extraits le 26/10/2026 d'un export DBeaver. Le numéro vient du `console.log("Function N")`, qui peut être faux. Les fonctions « inconnue » ont été renommées d'après l'ordre des `FunctionID` : 11, 51, 56, 62, 65, 92, 276, 280, 281, 294, 295, 297, 298, 299 et 301. Vérifié en base : 280 = `OnchangeVehiculeUtilise`, 281 = `OnchangeVehiculeRetour`, 282 = `DupliquerMission` (contient `console.log("Function 281")`, copié d'une autre fonction). La 128 n'a pas de fichier (`Data` = null).
- Fonction 27 (FILL `ONLOADMASTER`) : valeurs par défaut de chaque gabarit en Draft (dont `Maison` = `mcrDictionary[AREA]`). Fonction 130 (SHOW `ONLOAD`) : sections de boutons selon le gabarit, le statut et le rôle.

## 3. Maisons (MCR)

- Maisons existantes : Arlon, Aubange-Messancy, Sud Gaume, Rulles-Semois, Docteur Lagneau, Marche, Gembloux, Namur, Florenville, Rochefort (la dernière ajoutée).
- **Ajouter une Maison** : un cas par Maison dans les fonctions 47 et 48 (adresse de départ des véhicules + GPS), 78 (`mcrTown`), 121 (`mcrArea`, `mcrName`), 138 (`mcrName`, `mcrTown`) et 83 (`mcrConfig`, à deux endroits). Ajouter aussi l'entrée dans `mcrDictionary`, plus le formulaire Profil MCR.
- Formulaire « Profil MCR » (statut Actif, lu par `getProfil` selon `Maison` dans 78, 83, 121, 138) : Nom officiel (`NomMCR`), Adresse (`AdresseMCR`), Téléphone (`TelephoneMCR`), IBAN (`IBANMCR`), TVA (`TVAMCR`), BIC (tous obligatoires), Maison (obligatoire, liste grisée, remplie par la fonction 27), Numéro BCE, Exploitant BDC (facultatifs, valeurs par défaut dans la 83).
- Ticket « Ajout Maison: Ardenne » (`868mjzzj7`, au 26/10/2026) : MCR Centre Ardenne, Libramont. Il manque la TVA, et la Maison n'existe pas encore dans la liste (ni dans `mcrDictionary`, à confirmer). Précédents : Aubange (`868e5fvgr`), Sud Gaume et Rulles-et-Semois (`868eqjjre`).

## 4. Accès chauffeur (ticket « Corriger L'accès du chauffeur », en cours au 26/10/2026)

- Objectif : un chauffeur sans formulaire Volontaire ne modifie rien. Un chauffeur avec un formulaire Volontaire peut seulement créer des disponibilités.
- Fonction 130 (ONLOAD, trigger 50 pour Disponibilité) : elle cache des **sections** (`ViewContent`) qui contiennent des boutons. Ses clés `BatchSauvegarder`, `BatchDisponibilité` et `Enregistrer_Disponibilite` sont des `ViewContent.Key`.
  - Section `BatchDisponibilité` (`0377811c-d0a8-4519-ac80-c4f1d2a2ed9d`) : Enregistrer + `Supprimer_Disponibilité` d'une disponibilité existante. Section `Enregistrer_Disponibilite` (`a7d1719f-874e-4d92-86ce-bd858a2a85c7`) : Enregistrer en Draft.
  - Correction du 26/10/2026 : `BatchDisponibilité` est visible seulement pour `isPrivileged` et hors Draft. **Testée par l'utilisateur, elle fonctionne** : le chauffeur ne voit plus Supprimer.
- Chauffeur sans formulaire Volontaire : pas de solution SHOW possible. La piste ONCHANGE sur `IdentifiantDispo` a été abandonnée. On bloque donc à l'enregistrement, dans la fonction 139 du dépôt.
  - Vérifié : le batch `EnregistrerDispo` (étape 0, fonction 139) se trouve dans la section `Enregistrer_Disponibilite` (création en Draft). Le batch `Enregistrer_Disponibilité` (étape 0, fonction 97 « BatchEnregistrerDispo ») se trouve dans la section `BatchDisponibilité`, avec `Supprimer_Disponibilité`. Elle vérifie, comme la 111, qu'un formulaire Volontaire existe pour l'utilisateur non privilégié.
- `Batch_ViewContent.FunctionID` existe (ex. `Sauvegarder_Mission` → 283), mais son rôle n'est pas confirmé : la fonction 283 est vide.
- Batchs Disponibilité (actifs) : `Supprimer_Disponibilité` (`00a70134-64a5-45e9-b371-2f9ecb70411e`), `Enregistrer_Disponibilité` (`09f63e64-…`), `EnregistrerDispo` (`16d86243-…`).
  - `Supprimer_Disponibilité` n'a aucune restriction de statut. Son étape 0 lance la **fonction 98**, qui passe la disponibilité et les « Enregistrée » de sa récurrence à « Supprimé(e) » (`PUT document/Many`). Elle ne vérifie pas le rôle et n'attend pas la fin du `PUT`.
- Bouton du haut `Supprimer2` (`86d75613-aa5d-4834-a413-80578881bb0b`, `SAVE`, sans batch, partagé) : retiré de Disponibilité le 26/10/2026 (statut `885f3175-e9e2-4cb1-b4d8-b6976278b303`, « Enregistrée »). Il reste sur Bénéficiaire, Facture, Tarif et Volontaire sans exception, et sur `80e3e93d-…` en OnlyAdmin.
- Fonction 111 (Search) : préremplit une disponibilité en Draft depuis le formulaire Volontaire dont `NomDutilisateur` = `username` (`IdentifiantDispo` = ID du Volontaire). Sans formulaire Volontaire, elle ne remplit rien et ne bloque rien.
- Fonctions 26 (READONLY par rôle) et 271 (rend le nom, le prénom et la date de naissance en lecture seule pour un chauffeur).

## 5. Ticket « Problème enregistrement Test » (`868k6v141`, ouvert au 26/10/2026)

- La modification d'une récurrence de Mission ne demande plus « à partir de quand », et les occurrences ne sont pas mises à jour. L'annulation à partir d'une date fonctionne.
- Fonction 141 (Mission) : `PUT document` du seul formulaire, puis redirection vers la timeline. Elle ne traite pas les occurrences. Elle appelle `isValidDocument` sans `await`.
- Vérifié en test le 26/10/2026 : sur Mission, le seul bouton dans `Button_FormLayout_Status` est `EnregistrerMission` (SAVE, Refusée, OnlyAdmin). Les boutons Enregistrer du haut viennent de batchs PROCESS dans des sections :
  - `Enregistrer_Mission` (étape 0 = popup `APartirDeBatchstep` « À partir de », étape 1 = fonction 124), section `Batch_EnregistrerMissionRe…` (nom complet à vérifier) ;
  - `Enregistrer_MissionOccurence` (fonction 129, enregistre seulement l'occurrence, sans popup), section `BatchMissionOccurence`, avec `BatchAnnulerMission` (popup, puis fonction 131) ;
  - `Enregistrer_Mission_FactuEnCours` (fonction 141), section `Section_Mission_enCoursFa…` ; `Sauvegarder_Mission` (fonction 3), section `BatchSauvegarder`.
- La fonction 130 choisit les sections : une occurrence affiche `BatchMissionOccurence`. La source (ouverte par « Modifier les occurrences » depuis la timeline) affiche `BatchMissionRecurrence`. `BatchMission` n'est jamais affichée (condition impossible).
- **Correction du 26/10/2026 (test)** : dans `Batch_ViewContent`, la section `BatchMissionRecurrence` contient `Enregistrer_Mission` (popup + 124) à la place de `Enregistrer_Mission_FactuEnCours` (141). Le retour en arrière est l'`UPDATE` inverse. La popup « À partir de » s'affiche de nouveau (vu par l'utilisateur).
- La fonction 27 copie `InformationsAdmin_DateHeureFin` dans `InformationsAdmin_LastKnownDateHeureFin` à l'ouverture d'une Mission hors Draft. Les deux champs sont dans la section `InfoDevsMission`.
- **Doublons (vérifié en test le 26/10/2026, sources 1846 → 1849 → 1853)** : la 124 ne coupe que la source ouverte. Si « À partir de » est avant le `Planification_Date` de cette source, la source précédente couvre encore cette période → doublons. Correction faite dans le dépôt (pas encore en base) : la 124 refuse une date antérieure au `Planification_Date` de la source, avec `showErrorBanner`.
- Fonction 124 : `await` ajouté avant la redirection sur le `PUT document/Many`, dans le dépôt le 26/10/2026, **à recoller dans `Function.Data`** (pas encore en base).

## 6. Véhicules et timeline

- Véhicule : statut actif = « Enregistré ». Fonction 300 = archivage (enregistre `VehiculeArchivage`, statut « Archivé », retire le véhicule des missions à venir). La date doit être aujourd'hui ou plus tard. Fonction 291 = réactivation immédiate (vide `VehiculeArchivage`). La réactivation par date a été abandonnée le 23/10/2026 (copie dans `Func 291 - reactivation par date (en test).js`). Le champ `VehiculeReactivation` existe encore dans `Field` à cause de `History`.
- Fonctions 280 et 281 : ONCHANGE du véhicule de l'aller et du retour d'une mission. Fonction 301 : boutons du véhicule (archiver, réactiver).
- Champs de la section « Informations DEVELOPPEUR » : `VehiculeArchivage`, `InformationsAdmin_DateHeureDébut` et `InformationsAdmin_DateHeureFin` (`AAAA-MM-JJTHH:mm:ss` local, par défaut 1900 et 2150), `AfficherSurTimelineDisponible`.
- Timeline : `ViewContent` `TimeLineAttributionRepartition` (`76d9c6b1-f9a8-465f-ada9-b2856e576a58`, type `TIMELINE`), grille `TimeLineChauffeur` (`47b920f0-13e8-46bf-9952-197a64983cb5`). Filtres : `FORMLAYOUTNAME` IN `Mission|Véhicule|Disponibilité`, `STATUS` IN `…|Archivé`, `AfficherSurTimelineDisponible` = `true`. La timeline ne reçoit que les champs de la grille. Son script `Data.prepareData` (`buildVehicleRow`) masque un véhicule dont `VehiculeArchivage` ≤ la date affichée.
- Le statut « Archivé » est utilisé par Véhicule, Bénéficiaire et Volontaire.

## 7. Ticket « D-2025-05-51 : Gestion des Catégories de missions et des Tarifs » (`868fj13hu`, au 27/10/2026)

- Fait (par Nicolas Ouellet et William De Santis) : formulaire Catégorie (validité, catégories statistiques, priorité), boutons, droits ADMIN, grille, fonction qui remplit les options de « Catégorie de la mission », « Nom du tarif » + « Niveau de priorité » dans Tarif. La cliente a validé le 21/10/2026.
- Fonction 93 : triggers ONCHANGE sur `Planification_Date` (105) et `Catégorie` (157), gabarit Mission (vérifié en base le 27/10/2026). Seule fonction du dépôt qui remplit `CalculPrixBis_TarifAppliqué`. Sans `Planification_Date`, elle ne cherche aucun tarif (`buildTarifFilters` renvoie `[]`), alors que les catégories utilisent la date du jour (vu en test le 27/10/2026).
- Fonction 93 (Search, champ « Catégorie de la mission » de Mission, onglet Planification, vu à l'écran) : propose les catégories triées par priorité et préremplit le tarif en Draft. Les `fields` des suggestions s'affichent sous chaque nom (`Nom - valeur`). Le 27/10/2026, retrait des lignes « Numéro de la catégorie » et « Niveau de priorité » (et donc du remplissage de `Categorie_Number`), dans le dépôt seulement.
- Champ `Categorie_Number` (`2118ca6c-45fa-4c97-ac34-1651f0470c3c`) : déconnecté de la section Mission `Mission_CahierCharges` (`3936f46c-…`) le 27/10/2026. Il reste sur Tarif (`Tarif_Condition_Éligibilité`).
- Formulaires Catégorie (test, 27/10/2026) : nos 1 à 10 supprimés (dont 10 « Dialyse/Radiothérapie/Chimiothérapie »), actifs 11 VSL/TPMR (5), 12 Transport social (1), 13 Dialyse/chimio/radiothérapie (2), 14 Transport Sang (1), tous valides en 2026. Sur la Mission, `CE_CatégorieMission` reçoit le nom du tarif (ex. « VSL »), pas la catégorie.
- Champ `Catégorie` de Mission (`e4d9363b-c2b2-42c3-bba0-6a727eba7c91`) : type `ADDRESS` (champ de recherche), `ListID` = 21, sans `Data` ni autocomplétion (vérifié le 27/10/2026). La liste 21 est l'ancienne liste fixe (Item Key → Name) : `VSL_TPMR` → VSL/TPMR, `Transport Social`, `Dialyse` → Dialyse/chimio/radiothérapie, `SangProgrammé` → « Sang - programmé ». Elle ne traduit pas à l'affichage (une Mission `Dialyse` affiche « Dialyse »). **Cause probable du bug de renommage** (vidéo de la cliente : « Dialyse/chimio/radiothérapie » tapé à la main devient « Dialyse » à la sortie du champ) : la plateforme remplace un `Item.Name` saisi par son `Item.Key`. Correction proposée : `ListID` à `NULL`. Seul champ relié à la liste 21, et aucune vue SQL ne contient `VSL_TPMR` ou `SangProgramm`. Valeurs de `Catégorie` dans les missions (27/10/2026) : surtout VSL/TPMR (1132), puis Transport Social (201), Transport Spécial (116, catégorie supprimée), `Dialyse` (92, ancienne clé), Dialyse/chimio/radiothérapie (85), etc., et 1 `VSL_TPMR` (ancienne clé).
- `Item_List` : `ItemID`, `ListID`, `Position`. `Item` : `ItemID`, `Key`, `Name`, `Creation`, `CategoryID`, `FasterClientID`.
- Liste qui disparaît après un choix : la 93 filtrait les catégories avec `CONTAINS` sur la saisie. Correction dans le dépôt le 27/10/2026 (pas encore en base) : filtre fait dans le code, et toutes les catégories valides sont proposées quand la saisie est exactement un nom de catégorie. Le tarif suit la catégorie exacte, sinon la première trouvée.
- Fonction 298 (Search, trigger 30 ONCHANGE `CalculPrixBis_TarifAppliqué`, Mission) : elle remplaçait la liste de tarifs de la 93 par la sienne (`CONTAINS` sur la saisie, `Catégorie` EQUALS, statut « Enregistré »). Le 27/10/2026, dans le dépôt : mêmes critères et mêmes lignes que la 93, liste complète si la saisie est exactement un nom de tarif. Fonction 297 = triggers 11, 22, 23, 49, gabarit Tarif.
- Bug « Faster renomme la catégorie » : pas reproduit le 27/10/2026 (changement de date, la catégorie reste). La 93 exclut les catégories supprimées.
- Retours SyD du 21/10 réglés et testés le 27/10/2026 : 93 et 298 collées en base, liste 21 détachée du champ `Catégorie`, champ `Categorie_Number` retiré de Planification.
- Reste : compatibilité chauffeur/mission dynamique, vues SQL des statistiques. Échéance : 30/10/2026.
