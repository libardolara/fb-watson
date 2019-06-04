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
Al crear intenciones (Intents), capacita a su asistente para que reconozca las preguntas o los objetivos de los clientes. Y puede mejorarlos agregando diferentes formas en que las personas dicen lo que están buscando.

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
* Agrega una intencion para Expresar Aceptar o Asentir y una para Negar o Cancelar.
