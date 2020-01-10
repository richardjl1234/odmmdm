# usage: ./test.sh [version] example: ./test.sh 0.31
docker run \
   -e ODM_DATABASE_PROD=$ODM_DATABASE_PROD \
   -e USER=$USER \
   -e PASSWORD=$PASSWORD \
   -e ODM_SERVER=$ODM_SERVER \
   -e ODM_PORT_PROD=$ODM_PORT_PROD \
   -v /Users/jianglei/Documents/GitHub/odmmdm/result:/app/result \
   -p 8080:8080 \
   -it odmmdm:$1 \
   node app.js

