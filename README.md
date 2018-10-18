# Conector serverless sencillo para IBM Watson y Facebook Messenger
> For english instructions click [English](README_EN.md)

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

## Componentes Incluidos

* [Cloudant](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db): Una base de datos completamente manejada diseñada para aplicaciones web y mobile modernas que usan documentos como JSON.
* [Watson Visual Recognition](https://www.ibm.com/watson/developercloud/visual-recognition): Visual Recognition usa algoritmos de deep learning para identificar escenas, objetos y rostros en una imagen. Pudes crear y entrenar clasificadores customizados para identificar patrones para tus necesidades.
* [Watson Assistant](https://www.ibm.com/watson/developercloud/assistant): Watson Assistant service combina machine learning, natural language understanding e integra herramientas de dialogo para crear flujos conversacionales entre los usuarios y las aplicaciones.
* [IBM Cloud Functions](https://console.ng.bluemix.net/openwhisk) (basado en Apache OpenWhisk): Ejecuta codigo bajo demand en un ambiente serverless y altamente escalable.

## Tecnologias Importantes

* [Watson](https://www.ibm.com/watson/developer/): Watson en IBM Cloud permite integrar herramientas de AI en tu aplicación y guardar, entrenar y manejar tu data en una nube segura.
* [Serverless](https://www.ibm.com/cloud-computing/bluemix/openwhisk): Una plataforma basada en eventos que permite ejecutra codigo como respuesta a un evento.

# Prerequisitos

* [IBM Cloud Functions CLI](https://console.bluemix.net/openwhisk/learn/cli) para crear cloud functions desde la terminal. Haz una prueba de una acción `ibmcloud wsk action invoke /whisk.system/utils/echo -p message hello --result` para que tu `~/.wskprops` apunte a la cuenta correcta.

* [Whisk Deploy _(wskdeploy)_](https://github.com/apache/incubator-openwhisk-wskdeploy) es una herramienta que ayuda a describir y desplegar cualquier componente de OpenWhisk usando un archivo Manifest escirto en YAML. Lo usuaras si deseas hacer el despliege despliegue de todos los recursos de Cloud Functions en una sola linea de comandos. Puedes descargar en [releases page](https://github.com/apache/incubator-openwhisk-wskdeploy/releases) y seleccionar el archivo correcto para tu sistema operativo.

# Paso a Paso

### 1. Clonar el repo

Clona el repositorio `fb-watson` localmente. En una terminal, ejecuta:

```
$ git clone https://github.com/libardolara/fb-watson
```

### 2. Crear el servicio Watson Assistant

Crea un servicio de [Watson Assistant](https://console.bluemix.net/catalog/services/watson-assistant-formerly-conversation).
* Copia el username y password en las Credenciales y pegalos en el archivo `params.json` en los valores `wa_username` y `wa_password`
* Si el serivicio usa autenticación IAM API Key, entonces copia el API Key en las Credencials the Credentials y pegala en el archivo `params.json` en el valor `wa_api_key`
* Haz click en el boton *Lanzar Herramienta* en la pagina principal del servicio.

![](docs/wa_launchtool.png)

* Crea un nuevo workspace en el lenguaje preferido o importa el ejemplo en español `sample_workspace.json` 
* Despues de crear y/o desarrollar el asistente, abre las credenciales de servicios, copia el Workspace ID y pegalas en el archivo `params.json` en el valor `wa_workspace_id`

![](docs/wa_workspaceid.png)

### 3. Crear el servicio Watson Visual Recognition

Crea un servicio de [Watson Visual Recognition](https://console.bluemix.net/catalog/services/visual-recognition).
* Copia el API Key en las Credenciales y pegala en el archivo `params.json` en el valor `vr_api_key`
* Haz click en el boton *Lanzar Herramienta* en la pagina principal del servicio.
* Si es laprimera vez que usas Watson Studio, esto preparará el ambiente de trabajo creando un Cloud Object Storage.
* Haz click en el boton Create Model para un custom classifier

![](docs/vr_create_model.png)

* Dele un nombre al proyecto.
* Asegurate que el Storage y Watson Visual Recognition esten configurados.

![](docs/vr_create_project.png)

* Haz click en el boton Create
* Cambia el nombre del modelo de Visual Recognition

![](docs/vr_name.png)

* Sube los archivos `.zip` con las clases positivas y las clases negativas.

![](docs/vr_upload_images.png)

* Haz click en el menu con los 3 puntos y despues selecciona la opción Add Model solamente con las clases positivas.

![](docs/vr_add_models.png)

* Haz click en la clase del sistema Negative

![](docs/vr_negative_class.png)

* Arrastra el `.zip` con las imagenes negativas al centro de la pantalla
* Retorna a la pagina principal del modelo y haz click en el boton Train Model
* Cuando el entrenamiento termine, ve a los detalles del modelo.
* Copia el Model ID y pegalo en el archivo `params.json` en el valor `vr_model_id`
* Puedes probar el modelo en la pestaña Test, arrastrando una nueva imagen para clasificar

### 4. Crear el servicio Cloudant Database

Crea el servicio [**Cloudant**](https://console.bluemix.net/catalog/services/cloudant) escogiendo `Use both legacy credentials and IAM` para la opción _Available authentication method_.
* Crea las credenciales para esta instancia y copia la **url** en el archivo `params.json` en el valor `cloudant_url`

### 5. Desplegar a Cloud Functions
> Escoge un metodo de despliegue

## Desplegar a través de DevOps Toolchain

Haz click en el boton [![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://console.bluemix.net/devops/setup/deploy/?repository=https%3A//github.com/libardolara/fb-watson-toolchain) y sigue las [instrucciones para desplegar usando el toolchain](README-Deploy-Toolchain.md).

Tambien puedes desplegar directamente desde el CLI siguiendo los pasos de la siguiente sección.

## Desplegar usando `wskdeploy` 

Este metodo despliega a Cloud Functions con un comando usando el archivo manifest que especifica el ambiente de despliegue.

Asegurate tener los parametros correctos en el archivo `params.json`. Despliega a Cloud Functions usando `wskdeploy`. Esto usa el archivo `manifest.yaml` en la raiz del directorio.

```
$ wskdeploy
```

> Si quieres deshacer el despliegue puedes usar `wskdeploy undeploy`

