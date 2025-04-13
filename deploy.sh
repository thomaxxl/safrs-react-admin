#cp -rf ../simple-spa/src/* src/landing2
set -x
scp -r t@192.168.109.130:/opt/webgenai/simple-spa/src/* src/landing2

npm run build || exit 1
tar cfz build.tgz build/
tar cfz src.tgz src/
#scp build.tgz ec2-user@hardened.be:/tmp
#ssh ec2-user@hardened.be "cd /tmp;rm -fr build; tar xvfz build.tgz; rm -fr /var/www/html/admin-app/admin-app ; mv /tmp/build /var/www/html/admin-app/admin-app"

scp -r build t@192.168.109.130:/tmp

if [[ $1 == "dev" ]]; then
    exit
fi

if [[ -z $DEV ]]; then
scp build.tgz src.tgz azureuser@apifabric.ai:/tmp
ssh azureuser@apifabric.ai "cd /tmp && rm -fr build ; tar xvfz build.tgz && rm -fr /var/www/html/admin-app; mv /tmp/build /var/www/html/admin-app; cp /tmp/build.tgz /var/www/html/builds/build-$(date +%m%d).tgz"
fi

cd ../sra || exit
rm -fr build/
pwd
cp -rf ../safrs-react-admin/{build,src} .
#npm run build
git add .
git commit -am up
git push

ssh t@192.168.109.130 "cp -rf /tmp/build/* ~/ApiLogicServer-src/api_logic_server_cli/create_from_model/safrs-react-admin-npm-build"
