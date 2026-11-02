-- Question Metabase « Complétions de la semaine passée » : requête SQL de base (sans les filtres Équipe/Date du tableau de bord)
-- Ticket https://app.clickup.com/t/868mpff5e : ajout de "Lien (Abribus)"
WITH base AS (
  SELECT
    f."FormID" AS Intervention,
    MAX(CASE WHEN d."FieldKey" = 'NumAbribus' THEN d."Value" END) AS Abribus,
    MAX(CASE WHEN d."FieldKey" = 'NumArret' THEN d."Value" END) AS Arret,
    MAX(CASE WHEN d."FieldKey" = 'Abribus_Adresse' THEN d."Value" END) AS Adresse,
    MAX(CASE WHEN d."FieldKey" = 'Arrondissement' THEN d."Value" END) AS Arrondissement,
    MAX(CASE WHEN d."FieldKey" = 'NumAbribus' THEN d."Value" END) AS NumAbribus,
    MAX(CASE WHEN d."FieldKey" = 'EquipeAbribus' THEN d."Value" END) AS Equipe,
    MAX(CASE WHEN d."FieldKey" = 'TypeIntervention' THEN d."Value" END) AS TypeIntervention,
    MAX(CASE WHEN d."FieldKey" = 'SousCatégorie1' THEN d."Value" END) AS SousCat,
    MAX(CASE WHEN d."FieldKey" = 'RN' THEN d."Value" END) AS RN,
    MAX(CASE WHEN d."FieldKey" = 'DateHeureComplete' AND d."Value" <> '' THEN d."Value"::timestamp END) AS CompletionTS
  FROM "Form" f
  JOIN "Data" d ON d."FormID" = f."FormID"
  WHERE f."FormLayoutID" = 'f7b9a59a-e708-45c4-b786-2a5130cfee2b'
    AND f."StatusID" = 'eb3c83f3-c865-48e8-9a02-a02a522fea7a'
  GROUP BY f."FormID"
),
-- Fiche abribus active la plus récente par numéro, calculée une seule fois (une sous-requête par ligne dépassait le délai de Metabase)
abribus AS (
  SELECT DISTINCT ON (da."Value")
    da."Value" AS num_abribus,
    fa."FormID"
  FROM "Form" fa
  JOIN "Data" da
    ON da."FormID" = fa."FormID"
   AND da."FieldKey" = 'NumAbribus'
  WHERE fa."FormLayoutID" = '87CBDB19-0AD7-45CE-80D1-34D3A00DC174'
    AND fa."Active" = TRUE
  ORDER BY da."Value", fa."LastEdit" DESC
)
SELECT
  b.Intervention,
  b.Abribus,
  'https://web.qbcor.fastercom.io/command/' || ab."FormID" AS "Lien (Abribus)",
  b.Arret,
  b.Adresse,
  b.Arrondissement,
  b.NumAbribus,
  b.Equipe,
  b.TypeIntervention,
  b.SousCat,
  b.CompletionTS AS "Completion"
FROM base b
LEFT JOIN abribus ab ON ab.num_abribus = b.Abribus
WHERE b.CompletionTS IS NOT NULL
ORDER BY b.CompletionTS DESC;
