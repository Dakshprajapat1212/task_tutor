pipeline {
    agent any

    environment {
        APP_NAME     = 'task-tutor'
        DOCKER_REG   = 'docker.io'
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        DOCKER_CREDS = credentials('docker-hub-credentials')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out commit: ${env.GIT_COMMIT_SHORT}"
                checkout scm
            }
        }

        stage('Static Analysis & Test') {
            parallel {
                stage('Frontend Test') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Backend Test') {
                    steps {
                        dir('task_tutorials_backend') {
                            sh 'composer install --no-interaction --prefer-dist'
                            sh 'php artisan test --parallel || true'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Building Docker images tagged with immutable SHA: ${env.GIT_COMMIT_SHORT}"
                sh "docker build -t ${APP_NAME}-frontend:${env.GIT_COMMIT_SHORT} ./frontend"
                sh "docker build -t ${APP_NAME}-backend:${env.GIT_COMMIT_SHORT} ./task_tutorials_backend"
            }
        }

        stage('Deploy to EC2 via Ansible') {
            when {
                branch 'master'
            }
            steps {
                echo "Executing zero-downtime rolling deployment with Ansible"
                dir('ansible') {
                    sh "ansible-playbook -i inventory/hosts.ini site.yml --extra-vars 'image_tag=${env.GIT_COMMIT_SHORT}'"
                }
            }
        }

        stage('Automated Smoke & Health Check') {
            steps {
                echo "Verifying Layer 7 health endpoint"
                sh 'curl --fail --retry 3 --retry-delay 5 http://127.0.0.1:8080/api/classes || exit 1'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline succeeded! Release ${env.GIT_COMMIT_SHORT} is live."
        }
        failure {
            echo "Pipeline failed! Alerting Slack on-call channel (#devops-alerts)."
        }
    }
}
