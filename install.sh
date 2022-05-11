#!/bin/bash

# INSTALLATION SCRIPT FOR THE API/SPA TEMPLATE

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`

echo
echo "======= CHECKING WE ARE ON A CODIO BOX ======="
if [ -v CODIO_HOSTNAME ]
then
	echo "Codio box detected"
	echo "continuing setup"
else
	echo "no Codio box detected"
	echo "exiting setup"
	exit 1
fi

type=${CODIO_TYPE:-assignment}

if [ $type = "lab" ];
then
	echo "YOU ARE TRYING TO RUN THIS IN A CODIO **LAB**"
	echo "script should only be run in your assignment box"
	exit 1
fi

sudo chown -R codio:codio .
sudo chmod -R 775 .
echo
echo "============== ${green}DELETING${reset} OLD FILES ==================="
rm -rf *
rm -rf .*
rm -rf .guides
echo
echo "============== CLONING ${green}REPOSITORY${reset} ==================="
git clone https://github.coventry.ac.uk/web/Codio-Deno-SPA-Template-V2.git .
chmod +x .githooks/*
git remote rm origin
rm -rf install.sh # delete this script so it can't be run from inside the project!
rm .codio
mv codio.json .codio
echo
echo "============= DELETING ${green}TEMPORARY FILES${reset} =============="
rm -rf *.db  # delete any old database files
rm -rf package-lock.json
rm -rf .settings
rm -rf .sqlite_history
rm -rf .bash_history
rm -rf .git # delete the repository we have cloned (if any)

echo
echo "============ MOVING LOGGER TOOLS ============"

mv -f /home/codio/workspace/logger.sh /home/codio/logger.sh
chmod +x /home/codio/logger.sh
mv -f /home/codio/workspace/setenv /home/codio/setenv
chmod +x /home/codio/setenv

echo
echo "============ INSTALLING PACKAGES ============"

sudo add-apt-repository -y ppa:git-core/ppa
sudo apt update -y
sudo apt upgrade -y

sudo apt install -y psmisc lsof tree build-essential gcc g++ make jq curl git unzip inotify-tools dnsutils lcov tilde bash-completion
sudo apt autoremove -y

echo
echo "============= INSTALLING MYSQL =============="
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password p455w0rd'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password p455w0rd'
sudo apt -y install mysql-server mysql-client

FILENAME="/etc/mysql/mysql.conf.d/mysqld.cnf"
SEARCH="127.0.0.1"
REPLACE="0.0.0.0"
sudo sed -i "s/$SEARCH/$REPLACE/gi" $FILENAME

# disable secure file privileges (so we can import a csv file)
echo 'secure_file_priv=""' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf

mysql -u root -pp455w0rd website -e "DROP DATABASE IF EXISTS website; DROP USER IF EXISTS websiteuser;"
mysql -u root -pp455w0rd -e "create database website";
mysql -u root -pp455w0rd website < setup.sql

sudo /etc/init.d/mysql restart

echo
echo "====== INSTALLING ${green}DENO${reset} ======"
# version 1.7.1 works!
curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.20.3

echo
echo "===== INSTALLING ${green}HEROKU${reset} TOOL ====="
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

echo
echo "========= CUSTOMISING SHELL PROMPT =========="
if grep PS1 ~/.profile
then
  echo "correct prompt found"
else
  echo "prompt needs updating"
  echo "PS1='$ '" >> ~/.profile
fi

if grep deno ~/.profile
then
  echo "path to deno executable found"
else
  echo "path to deno executable needs adding"
  echo "PATH='$PATH:$HOME/.deno/bin'" >> ~/.profile
fi

if grep ACC ~/.profile
then
  echo "group env var already set"
else
  echo "group env var needs adding"
	ACC="A"$RANDOM
  echo "export ACC=$ACC" >> ~/.profile
	sudo groupadd $ACC
	sudo chgrp -R $ACC * .[^.]*
	sudo chgrp -R $ACC .git
fi

if grep clear ~/.profile
then
  echo "clear command found"
else
  echo "clear command needs adding"
  echo "clear" >> ~/.profile
fi

echo
echo "================= CONFIGURING ${green}GIT${reset} =================="
git init
git config core.hooksPath .githooks
git config --global merge.commit no
git config --global merge.ff no
git config --global --unset user.email
git config --global --unset user.name
git config --global core.editor tilde

source ~/.profile

# crontab -l lists crontabs
# adds a 15 min crontab to log project size
touch /home/codio/log.csv
sudo chmod 775 /home/codio/log.csv

# set up the crontab job in the sudo crontab needs to be run as root
sudo -s <<EOF
(crontab -l ; echo "*/5 * * * * /home/codio/logger.sh")| crontab -
EOF

sudo service cron reload

# and here is a different version using inotify events.

touch /home/codio/changes.csv
sudo chmod 775 /home/codio/changes.csv
mv -f /home/codio/workspace/notify.sh /home/codio/notify.sh
chmod +x /home/codio/notify.sh
mv -f /home/codio/workspace/stats.js /home/codio/stats.js

source ~/.profile

# ask student for their details and store as env vars
# /home/codio/setenv

TIMESTAMP=`date +"%s"`
DATE=`date +"%D"`
TIME=`date +"%T"`
LOG="$TIMESTAMP,$DATE,$TIME"
echo $LOG >> /home/codio/reset_history.csv
