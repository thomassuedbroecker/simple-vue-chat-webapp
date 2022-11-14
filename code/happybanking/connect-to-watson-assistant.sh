#!/bin/bash

# **************** Global variables

source ./.env

export OAUTHTOKEN=""
export IBMCLOUD_APIKEY=$APIKEY
export T_RESOURCEGROUP=$RESOURCE_GROUP
export T_REGION=$REGION

# **********************************************************************************
# Functions definition
# **********************************************************************************

function getToken() {
    export OAUTHTOKEN=$(ibmcloud iam oauth-tokens | awk '{print $4;}')
    echo "OAUTHTOKEN: $OAUTHTOKEN"
    ASSISTANT_SERVICE_INSTANCE_NAME=Watson-Demo-WatsonAssistant
    REQUESTMETHOD=POST
    ibmcloud resource service-keys --instance-name $ASSISTANT_SERVICE_INSTANCE_NAME
    INSTANCE_ID=$(ibmcloud resource service-keys --instance-name $ASSISTANT_SERVICE_INSTANCE_NAME --output json | grep "guid" | awk '{print $2;}' | head -n 1 | sed 's/"//g' | sed 's/,//g')
    curl -X $REQUESTMETHOD -u "apikey:$IBMCLOUD_APIKEY" "https://api.us-south.assistant.watson.cloud.ibm.com/instances/$INSTANCE_ID"
    curl -X POST -header "Content-Type: application/x-www-form-urlencoded" -data "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=$IBMCLOUD_APIKEY" "https://iam.cloud.ibm.com/identity/token"
}

function loginIBMCloud () {
    ibmcloud login  --apikey $IBMCLOUD_APIKEY
    ibmcloud target -g $T_RESOURCEGROUP
    ibmcloud target -r $T_REGION
    ibmcloud target
}

# **********************************************************************************
# Execution
# **********************************************************************************

loginIBMCloud

getToken
