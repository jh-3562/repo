-- Question Metabase « Doublons d'interventions » (base Archives DB)
-- Ticket https://app.clickup.com/t/868mpff5e : ajout de Lien (Abribus)
WITH cte_interventions AS (
    SELECT
        f."FormID",
        d2."Value" AS "NumAbribus",
        d3."Value" AS "SousCatégorie1",

        -- Date de la commande / intervention
        d4."Value"::date AS "DateIntervention"

    FROM "Form" f
    JOIN "Status" s
        ON s."StatusID" = f."StatusID"

    JOIN "Data" d1
        ON d1."FormID" = f."FormID"
       AND d1."FieldKey" = 'TypeIntervention'

    LEFT JOIN "Data" d2
        ON d2."FormID" = f."FormID"
       AND d2."FieldKey" = 'NumAbribus'

    LEFT JOIN "Data" d3
        ON d3."FormID" = f."FormID"
       AND d3."FieldKey" = 'SousCatégorie1'

    LEFT JOIN "Data" d4
        ON d4."FormID" = f."FormID"
       AND d4."FieldKey" = 'CommandDate'

    WHERE
        f."Active" = TRUE
        AND f."FormLayoutID" = 'F7B9A59A-E708-45C4-B786-2A5130CFEE2B'
        AND s."Name" = 'À faire'
        AND d1."Value" = 'Entretien'
),

cte_doublons AS (
    SELECT
        "NumAbribus",
        "SousCatégorie1",
        "DateIntervention",
        COUNT(*) AS doublons
    FROM cte_interventions
    GROUP BY
        "NumAbribus",
        "SousCatégorie1",
        "DateIntervention"
    HAVING COUNT(*) > 1
)

SELECT
    d."NumAbribus",
    'https://web.qbcor.fastercom.io/command/' || ab."FormID" AS "Lien (Abribus)",
    d."SousCatégorie1",
    d."DateIntervention",
    d.doublons
FROM cte_doublons d
-- Fiche abribus active la plus récente pour ce numéro (sans dupliquer les lignes)
LEFT JOIN LATERAL (
    SELECT fa."FormID"
    FROM "Form" fa
    JOIN "Data" da
        ON da."FormID" = fa."FormID"
       AND da."FieldKey" = 'NumAbribus'
    WHERE fa."FormLayoutID" = '87CBDB19-0AD7-45CE-80D1-34D3A00DC174'
      AND fa."Active" = TRUE
      AND da."Value" = d."NumAbribus"
    ORDER BY fa."LastEdit" DESC
    LIMIT 1
) ab ON TRUE
ORDER BY
    d.doublons DESC,
    d."DateIntervention" DESC;
