#!/bin/sh

# Perform automatic database upgrade
echo " ### BEGIN Database Upgrade ### "
flask --app gameServer db upgrade
RETURN_CODE=$?
echo " ### END Database Upgrade ### "
echo " "

# Launch the game if upgrade was successful, otherwise exit with error.
if [ $RETURN_CODE -eq 0 ]
then
	uwsgi --ini /usr/var/reversim-instance/conf/reversim_uwsgi.ini --strict
else
	echo "ERROR: Unable to update Database, command exited with code $RETURN_CODE !!!" >&2
fi
