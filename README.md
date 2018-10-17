# Conector serverless sencillo para IBM Watson y Facebook Messenger

Esta aplicación demuestra una funcion en IBM Cloud (basado en Apache OpenWhisk) que conecta Facebook Messenger con Watson Assitant, Visual Recognition y Watson Discovery guardando el historial de la conversación en una base de datos Cloudant.

Una función, o acción, es invocada atrabves de un web endpoint provisto por IBM Cloud Functions y este es llamado por Facebook Messenger atraves de su Webhook. El mensaje es evnado a Watson Assistant para interacturar con un virtual agent, si el mensage es una imagen es enviado a Watson Visual Recognition.

Despues de teminar este pattern usted entendera como: 

* Usar Watson Assistant
* Usar Watson Visual Recognition
* Crear y Desplegar Cloud Functions

![](docs/architecture.png)

## Flujo

1. El usuario interactua con Facebook Messenger
2. Facebook Messenger envia al payload a IBM Cloud Functions
3. La función (o acción) busca por un historial de chat en la base de datos Cloudant.
4. La función envia el mensaje de texto a Watson Assistant.
5. Si es necesario la función enviaria una imagen adjunto a Watson Visual Recognition.
5. Si es necesario la funcion buscará en Watson Discovery la respuesta para el usuario.
6. La función guarda el historial del chat en la base de datos Cloudant.
7. La función envia la respuesta a Facebook Messenger.
8. El usuario obtiene la respuesta para su interacción.

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

### 1. Clone the repo

Clone the `fb-watson` locally. In a terminal, run:

```
$ git clone https://github.com/libardolara/fb-watson
```

### 2. Create Watson Assistant Service

Create a [Watson Assistant](https://console.bluemix.net/catalog/services/watson-assistant-formerly-conversation) instance.
* Copy the username and password in the Credentials section and paste them in the `params.json` file in the values `wa_username` and `wa_password`
* If the service uses IAM API Key authentication, then copy the API Key in the Credentials section and paste it in the `params.json` file in the value of `wa_api_key`
* Click the launch tool button on the service main page

![](docs/wa_launchtool.png)

* Create a new Workspace in your preferred language or import the `sample_workspace.json` 
* After creating and/or developing the assistant open the service credentials, copy the Workspace ID and paste it in the `params.json` file in the values `wa_workspace_id`

![](docs/wa_workspaceid.png)

### 3. Create Watson Visual Recognition Service

Create a [Watson Visual Recognition](https://console.bluemix.net/catalog/services/visual-recognition) instance.
* Copy the API Key in the Credentials section and paste it in the `params.json` file in the value of `vr_api_key`
* Click the launch tool button on the service main page
* If its the first time you use Watson Studio, this will prepare the environment creating a Cloud Object Storage.
* Click the Create Model button for a custom classifier

![](docs/vr_create_model.png)

* Give a name to the project
* Make sure that the Storage and Watson Visual Recognition are set

![](docs/vr_create_project.png)

* Click the Create button
* Change the name of the Visual Recognition Model

![](docs/vr_name.png)

* Upload the `.zip` files with the positive classes and the negative class

![](docs/vr_upload_images.png)

* Click the 3 button menu and then click the  Add Model only for the positive classes

![](docs/vr_add_models.png)

* Click the Negative default class

![](docs/vr_negative_class.png)

* Drag the negative `.zip` into the center of the screen
* Return to the main page of the model and click the Train Model button
* When the trainig is done, go to the model detail view.
* Copy the Model ID and paste it in the `params.json` file in the value of `vr_model_id`
* You can test the model in the Test tab, draging a new image to classify

### 4. Create Cloudant Database

Create a [**Cloudant**](https://console.bluemix.net/catalog/services/cloudant) instance and choose `Use both legacy credentials and IAM` for the _Available authentication method_ option.
* Create credentials for this instance and copy the **url** in the `params.json` file in the value of `cloudant_url`

### 5. Deploy to Cloud Functions
> Choose one of the deployment methods

## Deploy through DevOps Toolchain

Click [![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://console.bluemix.net/devops/setup/deploy/?repository=https%3A//github.com/libardolara/fb-watson-toolchain) and follow the [instructions to deploy using the toolchain](README-Deploy-Toolchain.md).

You can also deploy them directly from the CLI by following the steps in the next section.

## Deploy using the `wskdeploy` command line tool

This approach deploy the Cloud Functions with one command driven by the runtime-specific manifest file available in this repository.

Make sure you have the right parameter variables in the `params.json` file. Deploy the Cloud Functions using `wskdeploy`. This uses the `manifest.yaml` file in this root directory.

```
$ wskdeploy
```

> You may want to undeploy them later with `wskdeploy undeploy`

