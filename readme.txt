Current Docker image version is 0.1Y

1. build.sh is to build the docker image and then push it to the docker hub
usage: ./build.sh 0.1Y


2. deploy.sh is to deploy the application to the corresponding space
usage: ./deploy.sh dev 0.1Y

3. manifest_[env]_template.yml is to define the environment specific configurations. 
deploy.sh script will create the manifest.yml on the fly to evaluate the correct parameters to corresponding environment


