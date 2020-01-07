echo $#
if [ $# -eq 0 ]
then
   echo 'Missing odmmdm docker image version number....' 
   echo 'Usage: ./build.sh odmmdm_docker_version , example: ./build.sh 0.1'
   exit
fi
docker build -t odmmdm:$1 . 
docker tag odmmdm:$1 richardjl/odmmdm:$1
docker push richardjl/odmmdm:$1

