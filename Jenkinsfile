pipeline {
  agent any
  
  tools {
    nodejs "nodeJS_22"
  }

  options { buildDiscarder(logRotator(numToKeepStr: '5')) }

  environment {
    DOCKER_CREDENTIALS = credentials('codevertDocker')
    DOCKER_TAG = "${env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME}"
    DISCORD_WEBHOOK = credentials('osg-discord-webhook')
  }

  stages {
    stage('Clean') {
      steps {
        cleanWs()
      }
    }

    stage('Pull sources') {
      steps {
        git branch: '${BRANCH_NAME}',
        credentialsId: 'github_key',
        url: 'git@github.com:WhitedogWarren/OldSchoolGamesV2_frontend.git'
        script {
          env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
        }
      }
    }

    stage('install') {
      steps {
        echo 'performing install...'
        sh '''
          npm install
        '''
      }
    }

    stage('lint') {
      steps {
        sh '''
          npm run lint
        '''
      }
    }

    stage('build & push docker image') {
      when {
        expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
      }
      steps {
        sh '''
          npm run build
        '''
        //connect to docker hub, build image and push to registry
        sh '''
          echo $DOCKER_CREDENTIALS_PSW | docker login localhost:5000 -u $DOCKER_CREDENTIALS_USR --password-stdin
          docker build -t "localhost:5000/oldschoolgames:frontend_${DOCKER_TAG}" .
          docker push localhost:5000/oldschoolgames:frontend_${DOCKER_TAG}
        '''
      }
    }

    stage('Update stack portainer') {
      when {
        expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
      }
      steps {
        //stop and restart portainer stack via api
        withCredentials([string(credentialsId: 'portainer_token', variable: 'TOKEN')]) { //set SECRET with the credential content
          sh '''
            curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/19/stop?endpointId=2 &&
            curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/19/start?endpointId=2
          '''
        }
      }
    }
    
  }
  post {
    changed {
      script {
        def messageResult = "is unknown"
        def footer = "What happened ?"
        def smiley = "🤔"
        if (currentBuild.currentResult == 'SUCCESS') {
          messageResult = "succeed"
          footer = "Good job !"
          smiley = "😎"
        }
        if (currentBuild.currentResult == 'UNSTABLE') {
          messageResult = "is unstable"
          footer = "Let's make it cleaner !"
          smiley = "🫤"
        }
        if (currentBuild.currentResult == 'FAILURE') {
          messageResult = "failed"
          footer = "Better luck next try ?"
          smiley = "😭"
        }
        sh 'echo ${GIT_COMMIT_MSG}'
        discordSend description: "Jenkins Pipeline Build for Old School Games Frontend ${BRANCH_NAME} ${messageResult} ! ${smiley}\n\ngit commit message :\n${GIT_COMMIT_MSG}",
        footer: "${footer}",
        link: "$BUILD_URL",
        result: currentBuild.currentResult,
        title: JOB_NAME,
        webhookURL: "${DISCORD_WEBHOOK}"
      }
    }
  }
}