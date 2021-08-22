#!/bin/bash
# Bodge to get qode **to actually fucking start rblxRP.**.
eval "$(dirname $0)/qode $(dirname $0)/../Resources/index.js" > $TMPDIR/rblxRP_log.txt 2>&1