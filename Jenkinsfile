pipeline {
  agent any
  
  tools {
    nodejs "nodeJS_22"
  }

  options { buildDiscarder(logRotator(numToKeepStr: '5')) }

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
  }
}