Importante
crear un archivo en la raiz del proyecto con el nombre de .env tomar de ejemplo el archivo .example.env y cargar las credenciales del entorno

npm run ssf :ejecuta el script para actualzar el security stock forced
Este scrip carga el archivo desde src/data con un formato de referencia tomar de ejemplo el siguiente file Modificaciones-ss-completo.csv, luego de cargarlo lo procesa leyendo cada linea del archivo para mas detalles ver el file desde src/security_stock/process.ts

npm run repeat : ejecuta el script para buscar los repetidos dentro del archivo cargado y genera un reporte en la raiz del proyecto con los items repetidos
para mas informacion consultar el file : src/security_stock/repetidos.ts

npm run pnull: ejecuta el script para actualzar el security stock forced cuando viene con la palabra ACTIVAR
tomar de referencia el archivo src/data/Modificaciones_SS-30.09.22.csv como ejemplo
para mas informacion consultar el file : src/security_stock/processNull.ts

npm run ssnull : ejecuta el script para actualzar el security stock forced y colocarlo en null, actualiza tambien el stock security con 0
tomar de referencia el archivo src/data/Eliminarstock001.csv como ejemplo
para mas informacion consultar el file : src/security_stock/processNullSS.ts
