# usage: ./test.sh [version] example: ./test.sh 0.31
docker run \
   -e ODM_DB_NAME=$ODM_DATABASE_PROD \
   -e ODM_USERID=$USER \
   -e ODM_USERID_PASSWORD=$PASSWORD \
   -e ODM_HOST=$ODM_SERVER \
   -e ODM_PORT=$ODM_PORT_PROD \
   -v /Users/jianglei/Documents/GitHub/odmmdm/result:/app/result \
   -p 8080:8080 \
   -it odmmdm:$1 \

