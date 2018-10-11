echo 'Usage: ./switch2env.sh [dev|local]'
cp .env_$1 .env
cp .profile_$1 .profile
cp manifest_$1.yml manifest.yml

echo "The environment is switched to $1, you can use ./deploy.sh $1 to deploy the application to $1 space in dedicated bluemix"
