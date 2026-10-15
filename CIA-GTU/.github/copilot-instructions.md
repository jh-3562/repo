# Directives Copilot

## Modification directe des fichiers locaux

Lorsqu'un fichier demandé est disponible localement sur l'ordinateur, le modifier directement dans son emplacement local plutôt que de fournir uniquement le code dans la réponse.

## Configuration des grilles

Dans la base de données, la table `Grid` représente un affichage tabulaire composé de colonnes.

Pour ajouter un champ à une grille :

1. Créer d’abord le champ dans la table `Field`.
2. Récupérer l’identifiant (`ID`) du champ créé.
3. Dans la table `Field_Grid`, identifier la grille concernée.
4. Ajouter une ligne dans `Field_Grid` en associant l’identifiant du champ à l’identifiant de la grille.

Avant d’exécuter une requête, vérifier le nom exact des colonnes, les champs obligatoires et les relations définies dans le schéma PostgreSQL. Ne pas supposer la structure de la base de données.
