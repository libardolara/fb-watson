# Instrucciones para el Despliegue con el Toolchain

Para desplegar esta función puedes usar el toolchain haciendo click en el boton [![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)]

# Paso a Paso

### 1. Configurar el Toolchain

1. En la pagina principal de la configuración del toolchain selecciona la region de IBM Cloud donde quieres guardar el toolchain
2. Si deseas puedes cambiar el nombre del toolchain

![](docs/tc_initial_setup.png)

### 2. Configurar el repositorio Git

1. En la sección de Tool Integration esta seleccionado el nodo Git Repo
2. Si deseas puedes cambiar el nombre del repositorio

![](docs/tc_git.png)

### 3. Configurar el Pipeline

1. En la sección de Tool Integration selecciona el nodo Delivery Pipeline
2. Has click en *Create* para crear un un IBM Cloud API Key

![](docs/tc_pipeline_init.png)

3. Cambia el nombre de la App, es decir de la función que se desplegará en IBM Cloud
4. Asegurate que la Region, Organizacion y Espacio esten definidos adecuadamente.

![](docs/tc_pipeline.png)

5. Has click en Create para crear el toolchain

### 4. Revisar el Toolchain

![](docs/tc_toolchain.png)

1. Espera que el Toochain se cree completamente
2. Has click en el nodo de Git
3. En la pagina del repositorio Git, revisa los archivos y has click en el archivo `params.json`

![](docs/tc_git_files.png)

4. Has click en Edit

![](docs/tc_git_params.png)

5. Modifica estos valores con los que habias guardado a lo largo de las instrucciones de pattern
6. Has click en Commit para publicar los cambios
7. Para volver al toolchain, has click en el nombre del toolchain en la esquina superior izquierda

![](docs/tc_git_button.png)

8. Has click en el link del toolchain

![](docs/tc_git_toolchain.png)

7. Has click en el nodo Delivery Pipeline
8. Asegurate de que haya corrido el nodo BUILD que despliega tu funcion en IBM Cloud
9. Para revisar tu funcion puedes ir a https://console.bluemix.net/openwhisk/actions
