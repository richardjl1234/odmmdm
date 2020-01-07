# usage: ./deploy.sh [space] [odmmdm_docker_version] , example: ./deploy.sh dev 0.31
echo $#
if [ $# -lt 2 ]
then
   echo 'Missing space name or odmmdm docker image version number...' 
   echo 'Usage: ./deploy.sh space odmmdm_docker_version , example: ./deploy.sh dev 0.31'
   exit
fi


bluemix api https://api.w3ibm.bluemix.net
bluemix target -o ODMODMR -s $1
export ODMMDM_DOCKER_VERSION=$2
# following srcipt is to prepare the manifest.yml file based on the system env variables
( echo "cat <<EOF" ; cat manifest_bk.yml ; echo EOF ) | sh > manifest.yml
cat manifest.yml
echo
while true; do
    read -p "Do you wish to deploy this application to $1 space?" yn
    case $yn in
        [Yy]* ) bluemix app push; rm manifest.yml ; break;;
        [Nn]* ) rm manifest.yml; exit;;
        * ) echo "Please answer yes or no.";;
    esac
done
