#!/bin/sh

while inotifywait -r -e modify "/home/codio/workspace"
do
  DU=`du -sb /home/codio/workspace/`
  SIZE=${DU%	/home/codio/workspace/}
  TIMESTAMP=`date +"%s"`
  DATE=`date +"%D"`
  TIME=`date +"%T"`
  LOG="$TIMESTAMP,$DATE,$TIME,$SIZE"
  echo $LOG >> /home/codio/changes.csv
done

# TODO: https://linuxadmin.io/using-inotifywait-to-monitor-a-directory-and-move-files-to-another-directory/
