# QBO

Informations propres à ce client. Les règles communes à tous les clients sont dans `C:\Users\JérémyHoule\.claude\CLAUDE.md`.

## Repères

- `FasterClientID` = `1e1fde07-e0a9-4e37-a24e-ef4cac82846e`. Fichiers sans extension.
- Statuts : À faire = `5b465caf-66a8-4fb8-967d-c5af2b7dcb5c`, À refaire = `2abf544f-5e20-4516-9232-506e60b7b924`, Pas à faire = `c9249251-2390-4156-ac12-c80f214b6104`.
- Formulaire `INTERVENTION`. Fonction 104 : courriels de `Notifications_Assignation` (selon `TypeIntervention`, `EquipeAbribus`, `Partenaire`). Fonction 105 : `Notifications_Completion`. Clés : `Notifications_…|n|courriel|n`.

## Ajouter une équipe Gauthier (client QBO à confirmer)

1. Base : créer l'`Item` `GAUTHIER_N`, puis le lier à la liste 34 (`Item_List`).
2. FasterWeb : Données > Équipe > + > formulaire Équipe, rempli comme les autres équipes Gauthier, puis « rendre actif ».
3. Admin > Accès > + : créer l'utilisateur (courriel et mot de passe), rôle DRIVER, enregistrer.
4. Admin > Accès > Ajouter un filtre à cet utilisateur : valeur `GAUTHIER_N`, opérateur `EQUALS`, Name `EquipeAbribus`.
