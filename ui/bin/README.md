# How to run code ui_web

1. install package identity_service, ui_web and bin 

2. Make sure you have installed the necessary libraries in the 3 projects (identity_service, ui_web, bin) 
and run `npm build` ui_web project (for the first time) after that only `npm start` all of them

3. If you don't need to change code UI no need to `npm start` ui_web, just run `npm start` 2 project (identity_service, bin) 

4. For FE development, you need to run `npm start` 3 project (identity_service, ui_web, bin), after that you can change code ui_web directly, and access address "http://127.0.0.1:3002", note: don not access "http://127.0.0.1:3000" 
