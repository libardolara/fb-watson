# Simple serverless connector for IBM Watson and Facebook Messenger

The application demonstrate and IBM Cloud Function (based on Apache OpenWhisk) that connects Facebook Messenger with Watson Assitant, Visual Recognition and Watson Discovery saving the chat history in Cloudant database.

One function, or action, is invoked through a web endpoint provided by IBM Cloud Functions and called by the Facebook Messenger Webhook. The message is sent to Watson Assistant to interact with a virtual agent, if the message is an image its sent to Watson Visual Recognition.

After going through this pattern you will understand how to:

* Use Watson Assistant
* Use Watson Visual Recognition
* Create and Deploy Cloud Functions

![](docs/architecture.png)

## Flow

1. User interacts with Facebook Messenger
2. Facebook Messenger sends the payload to IBM Cloud Functions
3. The function (or action) looks up for a past chat history on Cloudant Database.
4. The function sends the text message to Watson Assistant.
5. If need the function will send an attached image to Watson Visual Recognition.
5. If need the function will fallback to Watson Discovery to find the answer for the user
6. The function saves the chat history to Cloudant Database.
7. The function sends the answer to Facebook Messenger.
8. The user gets the answer to his interaction.

## Included components

* [Cloudant](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db): A fully managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema.
* [Watson Visual Recognition](https://www.ibm.com/watson/developercloud/visual-recognition): Visual Recognition service uses deep learning algorithms to identify scenes, objects, and faces in images you upload to the service. You can create and train a custom classifier to identify subjects that suit your needs.
* [Watson Assistant](https://www.ibm.com/watson/developercloud/assistant): Assistant service combines machine learning, natural language understanding, and integrated dialog tools to create conversation flows between your apps and your users.
* [IBM Cloud Functions](https://console.ng.bluemix.net/openwhisk) (powered by Apache OpenWhisk): Execute code on demand in a highly scalable, serverless environment.

## Featured technologies

* [Watson](https://www.ibm.com/watson/developer/): Watson on the IBM Cloud allows you to integrate the world's most powerful AI into your application and store, train and manage your data in the most secure cloud.
* [Serverless](https://www.ibm.com/cloud-computing/bluemix/openwhisk): An event-action platform that allows you to execute code in response to an event.

# Prerequisites

* [IBM Cloud Functions CLI](https://console.bluemix.net/openwhisk/learn/cli) to create cloud functions from the terminal. Make sure you do the test action `ibmcloud wsk action invoke /whisk.system/utils/echo -p message hello --result` so that your `~/.wskprops` is pointing to the right account.

* [Whisk Deploy _(wskdeploy)_](https://github.com/apache/incubator-openwhisk-wskdeploy) is a utility to help you describe and deploy any part of the OpenWhisk programming model using a Manifest file written in YAML. You'll use it to deploy all the Cloud Function resources using a single command. You can download it from the [releases page](https://github.com/apache/incubator-openwhisk-wskdeploy/releases) and select the appropriate file for your system.

# Steps

### 1. Create Watson Assistant Service

Create a [Watson Assistant](https://console.bluemix.net/catalog/services/watson-assistant-formerly-conversation) instance.
* Copy the username and password in the Credentials section and paste them in the `params.json` file in the values `wa_username` and `wa_password`
* If the service uses IAM API Key authentication, then copy the API Key in the Credentials section and paste it in the `params.json` file in the value of `wa_api_key`

* Click the launch tool button on the serive main page

![](docs/wa_launchtool.png)
