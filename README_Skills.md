# Crear un Skill para Watson Assistant

Los Skills se agregan a tu asistente virtual, que dirige los problemas de los usuarios finales para proporcionar la respuesta adecuada. 
Por lo cual un Skill es un conjuto especifica de habilidades que posee tu asistente virtual para resolver consultas/problemas de tus clientes.

## Paso a Paso

### 1. Crear un Skill

* En la pagina principal del servicio Watson Assistant, haz click en la pestaña **Skills**
* Llena el campo **Name** con el nombre `Asistente de Seguros`
* Selecciona el lenguage español
* Haz click en el botón **Create dialog skill**

![](docs/wa_create_skill.png)

### 2. Entrenando Intents

Al crear intenciones (Intents), capacita a tu asistente para que reconozca las preguntas o los objetivos de los clientes. Y puedes mejorarlos agregando diferentes formas en que las personas dicen lo que están buscando.

* En la pestaña Intent haz click en el botón **Create intent**
* El nombre de la intención sera `PresentarReclamacion`

> Esta Intencioón representara el objetivo que un cliente tiene para hacer uso de su seguro de vehiculos. Un usuario expresara su deseo de presentar una reclamación sobre un daño o accidente sobre su carro.

* Haz click en el botón **Create intent**
* Agrega ejemplos de como un usuario expresaria su deseo de presentar una reclamació a su seguro vehicular, como por ejemplo:

```
Presentar un reclamo por daños causados
¿Cuál es el proceso para presentar un reclamo?
¿Qué se debe hacer para presentar un reclamo?
¿Cuáles son los pasos para presentar una reclamación por un vehículo?
Quiero reparar mi carro
Quiero hacer uso de mi seguro de vehiculo
quiero realizar una reclamacion
Sufrí un accidente y requiero asistencia para el arreglo
Quiero presentar la solicitud de reparación de mi carro
Le pegue a mi carro, ¿Como puedo solicitar el arreglo?
```

> Estos ejemplos seran usados por Watson Assistant para crear un sistema de classificacion basado en la gramatica y linguistica de los ejemplos. Es importante comentar que los errores de ortografia podrian ser entendidos pero no es una garantia completa, si la palabra cambia drasticamente es buena idea agregar una oración de ejemplo usandola.

* Cuando tengas mas de 10 ejemplos haz click en la flecha hacia la izquierda, que se encuentra en la esquina superior izquierda
* Agrega una intención para Expresar Aceptar o Asentir y una para Negar o Cancelar. Por Ejemplo:

**Aceptar-Si**
```
Si
Claro
Por supuesto
de una
hagale
```

**Negar-No**
```
No
Paila
cancele
ya no
me arrepenti
```

* Ahora vamos a hacer uso del catalogo de contenido que IBM dispone para nosotros como una biblioteca para agilizar el desarrollo de un asistente virtual.
* Haz click en la pestaña **Content Catalog**
* IBM dispone un catalogo con contenido para Banca, Comercio Electronico, Telecomunicaciones, Utilidades, Atención al cliente asi como intenciones para el control del asistente y genericos.
* Haz click en el botón **Add to skill** para la categoria **General**
* Regresa a la pestaña Intents. Deberias ver 10 nuevas intenciones.
* Haz click en la intención **General_Greetings** y modificala agregando dos ejemplos regionales de como saludan en tu país.
* Regresa a la pestaña de Intents.
* Puedes revisar el resto de intenciones genericas para agregar ejemplos mas regionales.

### 3. Entrenando Entities

Las entidades son como los sustantivos o palabras clave. Trabajan para identificar la naturaleza específica de la solicitud de un cliente. Al construir los términos de tu negocio en entidades, tu asistente puede proporcionar respuestas dirigidas a una variedad más amplia de consultas.

#### 3.1. Entities basadas en Sinónimos

* Haz click en la pestaña **Entities**
* Haz click en el botón **Create entity**
* El nombre de la primera entidad sera `Marca`
* Despues de ingresar el nombre de la entidad, haz click en el botón **Create entity**
* Agrega marcas de carros, tales como Toyota, Mazda, Audi, BMW, etc. como valores. Si es necesario puedes ingresar ejemplos de sinonimos con los cuales los usuarios se pueden referir a una marca.

#### 3.2. Entities basadas en Patrones

* Ahora vamos a crear una entidad utilizando un patron linguistico. Vuelve a la pestaña de entidades (haciendo click en la flecha que queda en la esquina superior izquierda)
* Haz click en el botón **Create entity**
* El nombre de la primera entidad sera `Placa`
* Agrega un valor llamado `Carro`
* Cambia la opción **Synonyms** por **Patterns**
* En el campo Patterns ingresa el patrón `\b[a-zA-Z]{3}.?\d{3}\b` y haz click en el botón **Add value**

#### 3.3. Entities del Sistema

> Para mayor información puedes revisar la [Documentación de Entidades](https://cloud.ibm.com/docs/services/assistant?topic=assistant-entities#entities-create-dictionary-based)






