#!/bin/bash

# Export .env variables.
while read line; do
	firstCharacter=${line:0:1}
	#* Check the first character with "N" for NEXT_PUBLIC_ variable name.
	[[ "$firstCharacter" =~ [N] ]] && export $line
done <.env

# echo ${NEXT_PUBLIC_SETTLE_AUTH_KEY}

curl -d "{\"auth_key\":\"${NEXT_PUBLIC_SETTLE_AUTH_KEY}\", \"usd_amount\":\"0.1\"}" \
	-H "Content-Type: application/json" \
	-X POST http://localhost:3000/api/change-payment-nft-rent-price
