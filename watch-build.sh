fswatch -o -e "\\.css$" lib/ | xargs -n 1 sh ./cpbuild.sh
