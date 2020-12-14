#!/bin/sh
gnome-terminal --tab -- bash -c "python3 -m http.server"
xdg-open 'http://localhost:8000/'

