# MakeFiles

Aplicación en **Google Apps Script** para crear y actualizar carpetas de Google Drive de forma jerárquica.

## Funcionalidades

- Crear árbol de carpetas por niveles con botones:
  - `↳ Agregar nivel`
  - `+ Mismo nivel`
- Importar estructura desde texto con guiones (`-`, `--`, `---`, etc.).
- Listar carpetas raíz de "Mi unidad".
- Cargar una carpeta existente y reconstruir su jerarquía en pantalla.
- Generar o actualizar estructura (crea faltantes, reutiliza existentes y renombra por ID cuando corresponde).

## Archivos

- `Code.gs`: lógica de servidor y operaciones con Drive.
- `Index.html`: interfaz web jerárquica.
- `appsscript.json`: configuración del proyecto Apps Script.

## Despliegue rápido

1. Crea un proyecto de Apps Script.
2. Copia estos archivos en tu proyecto.
3. Implementa como **Web App**.
4. Abre la URL de la app y comienza a definir tu árbol de carpetas.
