#!/bin/bash

# Alert the user of a failed build
errored () {
	errcode=$?
	echo "Deploy encountered errors."
	exit $errcode
}

trap errored ERR

# the folder this script is in (*/bootplate/tools)
TOOLS=$(cd `dirname $0` && pwd)

# application root
SRC="$TOOLS/.."

# enyo location
ENYO="$SRC/../bower_components/enyo"

# Custom addition, as the lib is pointing to /lib directory by default
# lib location
LIB="$SRC/../bower_components"

# deploy script location
DEPLOY="$ENYO/tools/deploy.js"

# check for node, but quietly
if command -v node >/dev/null 2>&1; then
	# use node to invoke deploy with imported parameters
	echo "node $DEPLOY -T -s $SRC -o $SRC/deploy  -e "$ENYO" $@" -l "$LIB"
	node "$DEPLOY" -T -s "$SRC" -o "$SRC/deploy"  -e "$ENYO" $@ -l "$LIB" -v #-v for verbose
else
	echo "No node found in path"
	exit 1
fi

# copy files and package if deploying to cordova webos
while [ "$1" != "" ]; do
	case $1 in
		-w | --cordova-webos )
			# copy appinfo.json and cordova*.js files
			DEST="$TOOLS/../deploy/"${PWD##*/}
			
			cp "$SRC"/appinfo.json "$DEST" -v
			cp "$SRC"/cordova*.js "$DEST" -v
			
			# package it up
			mkdir -p "$DEST/bin"
			palm-package "$DEST/bin"
			;;
	esac
	shift
done
