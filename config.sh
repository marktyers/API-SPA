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

sudo add-apt-repository -y ppa:git-core/ppa
sudo apt update -y
sudo apt upgrade -y

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
	sudo chgrp -R $ACC . .. *
	sudo chmod g+s . .. api api/modules .git .githooks spa spa/js spa/style spa/uploads testing testing/integration testing/routes testing/unit testing/unit/mocks
fi

touch /home/codio/changes.csv
sudo chmod 775 /home/codio/changes.csv
mv -f /home/codio/workspace/notify.sh /home/codio/notify.sh
chmod +x /home/codio/notify.sh
mv -f /home/codio/workspace/stats.js /home/codio/stats.js

source ~/.profile

if grep clear ~/.profile
then
  echo "clear command found"
else
  echo "clear command needs adding"
  echo "clear" >> ~/.profile
fi

echo
echo "====== ADDING CRONTAB ======"
cron_entry=$(crontab -l 2>&1)
is_in_cron='logger.sh'
new_cron_entry='*/5 * * * * /home/codio/logger.sh'

if [[ $cron_entry != *"$is_in_cron"* ]]; then
	echo "crontab missing"
	printf '%s\n' "$cron_entry" "$new_cron_entry" | crontab -
fi

# check the flags and run the appropriate parts of the script

while getopts "bf:" OPTION
do
	case $OPTION in
		d)
			echo "${red}INSTALLING THE DATABASE${reset}"
			echo "============= INSTALLING MYSQL =============="
			sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password p455w0rd'
			sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password p455w0rd'
			sudo apt -y install mysql-server mysql-client
			echo "===== ALLOW EXTERNAL MYSQL CONNECTIONS ====="
			FILENAME="/etc/mysql/mysql.conf.d/mysqld.cnf"
			SEARCH="127.0.0.1"
			REPLACE="0.0.0.0"
			sudo sed -i "s/$SEARCH/$REPLACE/gi" $FILENAME
			echo "===== DISABLE SECURE FILE PRIVILEGES ====="
			echo 'secure_file_priv=""' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
			echo "=========== SET UP THE SCHEMA ============"
			mysql -u root -pp455w0rd website -e "DROP DATABASE IF EXISTS website; DROP USER IF EXISTS websiteuser;"
			mysql -u root -pp455w0rd -e "create database website";
			mysql -u root -pp455w0rd website < setup.sql
			sudo /etc/init.d/mysql restart
			exit
			;;
		f)
			echo "${red}UPDATING THE FILES${reset}"
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
			exit
			;;
		s)
			echo "${red}INSTALLING THE SOFTWARE${reset}"
			sudo apt install -y psmisc lsof tree build-essential gcc g++ make jq curl git unzip inotify-tools dnsutils lcov tilde bash-completion
			sudo apt autoremove -y
			echo "====== INSTALLING ${green}DENO${reset} ======"
			curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.22.0
			echo
			echo "===== INSTALLING ${green}HEROKU${reset} TOOL ====="
			curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
			exit
			;;
		\?)
			echo "Used for the help menu"
			exit
			;;
	esac
done