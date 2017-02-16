How to Install Angular CLI:

Global package:

npm uninstall -g angular-cli @angular/cli
npm cache clean
npm install -g @angular/cli@latest

Local project package:

rm -rf node_modules dist # use rmdir on Windows
npm install --save-dev @angular/cli@latest
npm install
ng update

-----------------------------------------------------------------------------------------------------------------------
How to build the WebUI
 npm start

-----------------------------------------------------------------------------------------------------------------------


