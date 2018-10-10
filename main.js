/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const cloudant = require('@cloudant/cloudant');
const request = require('request');

function errorResponse(reason) {
  return {
    text: 400,
    message: reason || 'An unexpected error occurred. Please try again later.'
  }
}

// Using some globals for now
let conversation;
let db;
let cloudantClient
let context;
let dbName = 'watson';
let doc;
let deleteContext = false;

/**
 *  Inicializa las principales variables para que se ejecute la aplicación
 *  Conexion con Watson Assistant y Conexion con la Base de Datos
 *
 *  @args  {JSON} Argumentos de inicio de la función
 */
function initClients(args) {
  // Connect a client to Watson Assistant
  conversation = new ConversationV1({
    username: args.wa_username,
    password: args.wa_password,
    version_date: ConversationV1.VERSION_DATE_2017_04_21
  });
  console.log('Connected to Watson Conversation');

  // Connect a client to Cloudant
  if (args.cloudant_url) {
    cloudantClient = cloudant(args.cloudant_url);
  } else {
    console.error('Could not Connect to de Cloudant, please provide the url');
  }

  return new Promise(function(resolve, reject){
    // check if DB exists if not create
    cloudantClient.db.create(dbName, function(err, res) {
        if (err) {
            console.log('Could not create new db: ' + dbName + ', it might already exist.');
        }
        var a_db = cloudantClient.use(dbName);
        resolve(a_db);
    });

  });


/*
  var go = true;
  while (go) {
    try {
      db = cloudantClient.use(dbName);
      go = false;
    } catch (e) {

    }
  }

  console.log('Connected to Cloudant');
  */
}


/**
 *  Realiza una consulta a Watson Discovery
 *
 *  @wds_query  {JSON} Consulta completa para ser enviada al WDS
 *  @params  {Json} Parametros de Conexion al WDS
 *
 *  @return - Json con la respuesta del WDS
 */
function callDiscovery(wds_query, params){
  console.log("llamando a Discovery");
  console.log(wds_query);

  return new Promise(function(resolve, reject){

    var discovery = new DiscoveryV1({
      username: params.wds_username,
      password: params.wds_password,
      version_date: '2017-11-07'
    });

    discovery.query(wds_query,
      function(error, data) {
        if (error) {
          console.error(error);
          reject(error);
        }else {
          console.log(JSON.stringify(data, null, 2));
          resolve(data);
        }

      });

  })
}

/**
 *  Realiza una evaluacion de una Imagen contra el Visual Recognition
 *  Hace una clasificación de la imagen contra el modelo especificado en la variale vr_model_id del archivo de parametros
 *
 *  @params  {JSON} Resultado con la clasificacion de la imagen
 *
 *  @return - status of post request sent to Facebook POST API
 */
function callVisualRecognition(params){
  return new Promise(function(resolve, reject){
    if (params.entry[0].messaging[0].message.attachments && params.entry[0].messaging[0].message.attachments[0].type == 'image') {

      var postUrl = params.entry[0].messaging[0].message.attachments[0].payload.url;
      var visualRecognition = new VisualRecognitionV3({
        iam_apikey: params.vr_api_key,
        version_date: '2018-03-19'
      });

      var classifier_ids = [params.vr_model_id];
      var threshold = 0.5;

      var args = {
        url: postUrl,
        classifier_ids: classifier_ids
      };

      visualRecognition.classify(args, function(err, response) {
        if (err)
          console.log(err);
        else
          console.log(JSON.stringify(response, null, 2));
          context.images = response;

          resolve("image");
      });


    }else {
      var request = params.entry[0].messaging[0].message.text;
      resolve(request);
    }
  })
}

/**
 *  Realiza el llamado al Watson Assistant
 *  Hace un llamado al WA con el texto de entrada
 *
 *  @request  {JSON} Resultado con la clasificacion de la imagen
 *  @workspaceId  {string} Id del Workspace con la conversacion
 *
 *  @return - Respuesta del Watson Assistant
 */
function conversationMessage(request, workspaceId) {
  return new Promise(function(resolve, reject) {
    const input = request ? request : '';
    console.log('WORKSPACE_ID: ' + workspaceId);
    console.log('Input text: ' + input);

    conversation.message(
      {
        input: { text: input },
        workspace_id: workspaceId,
        context: context
      },
      function(err, watsonResponse) {
        if (err) {
          console.error(err);
          reject('Error talking to Watson.');
        } else {
          console.log(watsonResponse);
          context = watsonResponse.context; // Update global context
          resolve(watsonResponse);
        }
      }
    );
  });
}

/**
 *  Realiza una evaluación de que accion viene desde el Watson Assistant
 *  Las acciones son procedimientos del back-end que vienen ordenados desde el WA
 *
 *  @args  {JSON} Parametros para conexiones
 *  @watsonResponse  {JSON} Respuesta que vino desde WA
 *
 *  @return - status of post request sent to Facebook POST API
 */
function actionHandler(args, watsonResponse) {
  console.log('Begin actionHandler');
  //console.log(args);
  //console.log(watsonResponse);

  return new Promise((resolve, reject) => {
    switch (watsonResponse.output.action) {
      // Hace una busqueda en el Discovery para buscar los mejores talleres
      case 'wds_opiniones':
        console.log("Calling action 'wds_opiniones'");

        var wds_query = {
          environment_id: args.wds_enviroment,
          collection_id: args.wds_collection_reviews,
          filter:'sentiment_label::"positive"',
          aggregation:"term(taller,count:3)",
          passages:false
        };

        return callDiscovery(wds_query, args)
        .then(result => {
          console.log("Tiene respuesta");
          const talleres = result.aggregations[0].results.map( t => t.key + "(" + t.matching_results + ")" ).join(", ");
          watsonResponse.output.text.push(talleres);
          resolve(watsonResponse);
        })
        .catch( err => {
          reject({
            text: 400,
            message: 'Error invocando wds_opiniones' + err
          })}
        );
      // Realiza una consulta de Long-Tail sobre la cobertura de la poliza
      case 'wds_cobertura':
        console.log("Calling action 'wds_cobertura'")
        //// TODO: Codigo para hacer una consulta en lenguage natural
      // Indica que al finalizar no se debe guardar la conversacion y debe borrarse de la DB
      case 'fn_chao':
        deleteContext = true;
      /* Other actions could be implemented with this switch or using watsonResponse values.
      case "addMoreActionsHere":
          return resolve(watsonResponse);
      */
      default:
        // No action. Resolve with watsonResponse as-is.
        console.log('No action');
        return resolve(watsonResponse);
    }
  });
}

/**
 *  Poste la respuesta de la convesacion al messenger usando el Facebook API https://graph.facebook.com/v2.6/me/messages
 *
 *  @params  {JSON} Parametros para el post de Facebook
 *  @postUrl  {string} Url para postear la respuesta
 *  @accessToken  {string} Token de autenticacion de la pagina en Facebook
 *
 *  @return - Status del request al POST API
 */
function postFacebook(response, params, postUrl, accessToken) {
  console.log('Entro a enviar a facebook');

  const facebookParams = {
    recipient: {
      id: params.entry[0].messaging[0].sender.id
    },
    // Get payload for regular text message or interactive message
    message: getMessageType(response)
  };


  return new Promise(function(resolve, reject){
    request(
      {
        url: postUrl,
        qs: { access_token: accessToken },
        method: 'POST',
        json: facebookParams
      },
      function(error, response)  {
        if (error) {
          return reject(error.message);
        }
        if (response) {
          if (response.statusCode === 200) {
            // Facebook expects a "200" string/text response instead of a JSON.
            // With Cloud Functions if we have to return a string/text, then we'd have to specify
            // the field "text" and assign it a value that we'd like to return. In this case,
            // the value to be returned is a statusCode.
            return resolve({
              text: response.statusCode,
              params,
              url: postUrl
            });
          }
          return reject(
            `Action returned with status code ${response.statusCode}, message: ${response.statusMessage}`
          );
        }
        reject(`An unexpected error occurred when sending POST to ${postUrl}.`);
      }
    );
  });
}


/**
 *  Cada vez que facebook usa el Webhook espera un texto "200"
 *
 *  @return - Status del request al POST API
 */
function sendResponse(resolve) {
  console.log('Begin sendResponse');

  // Everytime facebook pings the "receive" endpoint/webhook, it expects a
  // "200" string/text response in return. In Cloud Functions, if we'd want to return
  // a string response, then it's necessary that we add a field "text" and the
  // response "200" as the value. The field "text" tells Cloud Functions that this
  // endpoint must return a "text" response.
  // Response code 200 only tells us that receive was able to execute it's code
  // successfully but it doesn't really tell us if the sub-pipeline or the
  // batched-messages pipeline that are invoked as a part of it returned a successful
  // response or not. Hence, we return the activation id of the appropriate action so
  // that the user can retrieve it's details for debugging purposes.
  resolve({
    text: 200,
    message: `Response code 200 above only tells you that receive action was invoked successfully.
    However, it does not really say if the Facebook API was invoked successfully. `
  });

}

/**
 * Evalua los mensajes para extraer el payload interactivo o el mensaje de texto
 *
 * @params {JSON} Parametros de la accion
 * @return {JSON} - El archivo adjunto o el mensaje de texto
 */
function getMessageType(params) {
  const interactiveMessage = params.output.facebook;
  const textMessage = params.output.text.join(' ');
  // If dialog node sends back output.facebook (used for interactive messages such as
  // buttons and templates)
  if (interactiveMessage) {
    // An acceptable interactive JSON could either be of form -> output.facebook or
    // output.facebook.message. Facebook's Send API accepts the "message" payload. So,
    // if you already wrap your interactive message inside "message" object, then we
    // accept it as-is. And if you don't wrap your interactive message inside "message"
    // object, then the code wraps it for you.
    if (interactiveMessage.message) {
      console.log('Output interactive: ' + interactiveMessage.message);
      return interactiveMessage.message;
    }
    console.log('Output interactive: ' + interactiveMessage);
    return interactiveMessage;
  }
  console.log('Output text: ' + textMessage);
  // if regular text message is received
  return { text: textMessage };
}

/**
 *  Busca el historial de una conversación usando el ID de Session de Facebook
 *
 *  @sessionID  {String} ID de Session de Facebook
 *
 *  @return - Json con la conversacion
 */
function getSessionContext(a_db, sessionId) {
  console.log('sessionId: ' + sessionId);
  db = a_db;
  return new Promise(function(resolve, reject) {

    db.find({selector:{_id:sessionId}}, function(err, result) {
      if (err) {
        console.error(err);
        reject('Error getting context from Cloudant.');
      }
      context = result.docs[0] ? result.docs[0].context : {};
      doc = result.docs[0] ? result.docs[0]: {};
      console.log('context:');
      console.log(context);
      resolve();
    });



  });
}


/**
 * Guarda la conversacion utilizando el ID de Session o la borra si la accion fue activada
 *
 * @sessionId {JSON} Parametros de la accion
 */
function saveSessionContext(sessionId) {
  console.log('Begin saveSessionContext');
  console.log(sessionId);
  console.log(deleteContext);

  return new Promise(function(resolve, reject) {

    if(deleteContext){
      console.log('Begin action delete context ');
      return deleteContextDB(sessionId)
      .then(a_msg => {
        return resolve(a_msg)
      });
    }else {
      console.log('Begin insertUpdateContext');
      return insertUpdateContext(sessionId)
      .then(a_msg => {
        return resolve(a_msg)
      });
    }
  });
}


/**
 * Borra la conversacion utilizando el ID de Session
 *
 * @sessionId {JSON} Parametros de la accion
 */
function deleteContextDB(sessionId){
  return new Promise(function(resolve, reject) {
    if(doc && doc._rev){
      db.destroy(sessionId,doc._rev,function(err){
        if(err){
          console.error(err);
        }else {
          console.log('Deleted context in Cloudant');
        }
        return resolve("Borrado");
      });
    }else {
      return resolve("No hay doc para borrar");
    }
  });
}


/**
 * Guarda la conversacion utilizando el ID de Session
 *
 * @sessionId {JSON} Parametros de la accion
 */
function insertUpdateContext(sessionId){
  return new Promise(function(resolve, reject) {
    // Save the context in Cloudant. Can do this after resolve(response).
    if (context) {
      if(doc && doc._rev){
        //Realiza un Update en Cloudant
        db.insert({
            _id: sessionId ,
            _rev: doc._rev,
            context: context
        }, function(err, doc) {
            if (err) {
                console.error(err);
                return resolve(err);
            } else {
                console.log('Updated context in Cloudant');
                console.log(sessionId);
                console.log(context);
                return resolve("Actualizado");
              }

        });
      }else{
        //Realiza un Insert en Cloudant
        db.insert({
            _id: sessionId ,
            context: context
        }, function(err, doc) {
            if (err) {
                console.error(err);
                return resolve(err);
            } else{
                console.log('Saved context in Cloudant');
                console.log(sessionId);
                console.log(context);
                return resolve("Insertado");
              }
        });
      }
    }
  });
}

/**
 *  Verifica si el llamado viene desde una URL de Verificación
 *
 *  @args  {JSON} Parametros de la accion
 *  @return {boolean} - true o false
 */
function isURLVerificationEvent(args) {
  if (
    args['hub.mode'] !== 'subscribe' ||
    args['hub.verify_token'] !== args.fb_verification_token
  ) {
    return false;
  }
  return true;
}

/**
 *  Verifica si object es de tipo "Page"
 *
 * @params  {JSON} Parametros pasados a la accion
 * @return {boolean} - true o false
 */
function isPageObject(params) {
  if (!(params.object === 'page')) {
    return false;
  }
  return true;
}

/**
 * Receives a either a url-verification-type message or a regular page request from Facebook
 *   and returns the appropriate response depending on the type of event that is detected.
 *
 * @param  {JSON} params - Facebook Callback API parameters as outlined by
 *                       https://developers.facebook.com/docs/graph-api/webhooks#callback
 * @return {Promise} - Result of the Facebook callback API
 */
function main(args) {
  console.log('Begin action');
  //console.log(args);

  return new Promise(function(resolve, reject) {

    try {
      if (isURLVerificationEvent(args)) {
        // Challege value is returned
          return resolve( { text: args['hub.challenge'] } );

      } else if (isPageObject(args)) {

        // Every time facebook makes a POST request to the webhook endpoint, it sends along
        // x-hub-signature header which basically contains SHA1 key. In order to make sure, that
        // the request is coming from facebook, it is important to calculate the HMAC key using
        // app-secret and the request payload and compare it against the x-hub-signature header.
        // TODO

          const sessionId = args.entry[0].messaging[0].sender.id;
          const postUrl = 'https://graph.facebook.com/v2.6/me/messages';


          initClients(args)
          .then(a_db => getSessionContext(a_db, sessionId))
          .then(()=>callVisualRecognition(args))
          .then(request => conversationMessage(request, args.wa_workspace_id))
          .then(watsonResponse => actionHandler(args, watsonResponse))
          .then(actionResponse => postFacebook(actionResponse, args, postUrl, args.fb_page_access_token))
          .then(() => saveSessionContext(sessionId))
          .then(() => sendResponse( resolve))
          .catch(err => { reject(errorResponse(err)) })

      } else {
        reject({
          text: 400,
          message: 'Neither a page type request nor a verfication type request detected'
        });
      }

    } catch (err) {
      console.error('Caught error: ');
      console.log(err);
      reject(errorResponse(err));
    }


  });
}

exports.main = main;
