#!/bin/bash

# if [ -v CODIO_HOSTNAME ]
# then
DU=`du -sb /home/codio/workspace/`
IFS='   ' read -ra SIZE <<< "$DU"
TIMESTAMP=`date +"%s"`
DATE=`date +"%D"`
TIME=`date +"%T"`
LOG="$TIMESTAMP,$DATE,$TIME,$SIZE"
echo $LOG >> /home/codio/log.csv
# fi
