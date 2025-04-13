set -x 

cd ../sra || exit
rm -fr build/
pwd 
cp -rf ../safrs-react-admin/{build,src} .
#npm run build
git add .
git commit -am up
git push
scp -r build t@192.168.109.130:/tmp

