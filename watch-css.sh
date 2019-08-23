fswatch -e ".*" -i "\\.css$" lib | xargs -n 1 sh ./cpcss.sh
