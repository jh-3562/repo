-- Question Metabase « Interventions - informations différentes de l'abribus » (base Archives DB)
-- Ticket https://app.clickup.com/t/868mpff5e : ajout de NumIntervention, abribusID et Lien (Abribus)
WITH cte_interventions AS (
    SELECT
        f."FormID",
        f."Number",
        f."Active",
        s."Name",
        d1."Value" AS "NumAbribus",
        d2."Value" AS "NumArret",
        d3."Value" AS "Abribus_Adresse",
        d4."Value" AS "Abribus_Modele",
        d5."Value" AS "Arrondissement",
        d8."Value" AS "TypeIntervention",
        d9."Value" AS "CommandDate"
    FROM "Form" f
    JOIN "Status" s
        ON s."StatusID" = f."StatusID"
    JOIN "Data" d1
        ON d1."FormID" = f."FormID"
       AND d1."FieldKey" = 'NumAbribus'
    LEFT JOIN "Data" d2
        ON d2."FormID" = f."FormID"
       AND d2."FieldKey" = 'NumArret'
    LEFT JOIN "Data" d3
        ON d3."FormID" = f."FormID"
       AND d3."FieldKey" = 'Abribus_Adresse'
    LEFT JOIN "Data" d4
        ON d4."FormID" = f."FormID"
       AND d4."FieldKey" = 'Abribus_Modele'
    LEFT JOIN "Data" d5
        ON d5."FormID" = f."FormID"
       AND d5."FieldKey" = 'Arrondissement'
    LEFT JOIN "Data" d8
        ON d8."FormID" = f."FormID"
       AND d8."FieldKey" = 'TypeIntervention'
    LEFT JOIN "Data" d9
        ON d9."FormID" = f."FormID"
       AND d9."FieldKey" = 'CommandDate'
    WHERE
        f."Active" = TRUE
        AND f."FormLayoutID" = 'F7B9A59A-E708-45C4-B786-2A5130CFEE2B'
        AND s."Name" NOT IN ('Complété', 'Annulée', 'À refaire')
),

cte_abribus AS (
    SELECT
        f."FormID",
        f."Active",
        s."Name",
        d1."Value" AS "NumAbribus",
        d2."Value" AS "NumArret",
        d3."Value" AS "Abribus_Adresse",
        d4."Value" AS "Abribus_Modele",
        d5."Value" AS "Arrondissement"
    FROM "Form" f
    JOIN "Status" s
        ON s."StatusID" = f."StatusID"
    JOIN "Data" d1
        ON d1."FormID" = f."FormID"
       AND d1."FieldKey" = 'NumAbribus'
    LEFT JOIN "Data" d2
        ON d2."FormID" = f."FormID"
       AND d2."FieldKey" = 'NumArret'
    LEFT JOIN "Data" d3
        ON d3."FormID" = f."FormID"
       AND d3."FieldKey" = 'Abribus_Adresse'
    LEFT JOIN "Data" d4
        ON d4."FormID" = f."FormID"
       AND d4."FieldKey" = 'Abribus_Modele'
    LEFT JOIN "Data" d5
        ON d5."FormID" = f."FormID"
       AND d5."FieldKey" = 'Arrondissement'
    WHERE
        f."Active" = TRUE
        AND f."FormLayoutID" = '87CBDB19-0AD7-45CE-80D1-34D3A00DC174'
)

SELECT
    i."FormID" AS "formID",
    i."Number"::text AS "NumIntervention",
    'https://web.qbcor.fastercom.io/command/' || i."FormID" AS "Lien (Intervention)",

    i."NumAbribus",
    a."FormID" AS "abribusID",
    'https://web.qbcor.fastercom.io/command/' || a."FormID" AS "Lien (Abribus)",

    i."NumArret"        AS "Arret (Intervention)",
    a."NumArret"        AS "Arret (Abribus)",

    i."Abribus_Adresse" AS "Adresse (Intervention)",
    a."Abribus_Adresse" AS "Adresse (Abribus)",

    i."Abribus_Modele"  AS "Modele (Intervention)",
    a."Abribus_Modele"  AS "Modele (Abribus)",

    i."Arrondissement"  AS "Arrondissement (Intervention)",
    a."Arrondissement"  AS "Arrondissement (Abribus)",

    i."TypeIntervention",
    i."Name" AS "Statut",
    i."CommandDate"

FROM cte_interventions i
JOIN cte_abribus a
    ON a."NumAbribus" = i."NumAbribus"

WHERE
      i."NumArret"        IS DISTINCT FROM a."NumArret"
   OR i."Abribus_Adresse" IS DISTINCT FROM a."Abribus_Adresse"
   OR i."Arrondissement"  IS DISTINCT FROM a."Arrondissement"
   OR i."Abribus_Modele"  IS DISTINCT FROM a."Abribus_Modele";
