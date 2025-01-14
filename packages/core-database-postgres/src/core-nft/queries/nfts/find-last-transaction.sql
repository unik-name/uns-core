SELECT id
FROM transactions
WHERE
(
    (
        type IN (0,1,2)
        AND transactions.type_group = 2000
    )
    OR
    (
        type IN (3,4,6)
        AND transactions.type_group = 2001
    )
)
AND asset -> 'nft' -> ${nftName} ->> 'tokenId' = ${id}
ORDER BY transactions.timestamp DESC, transactions.sequence DESC
LIMIT 1
