# How to run code identity_service 

1. make sure installed node and run `npm install`
2. migrate db `npm run db:reset`
3. run `npm start` and check folder key, if you have both of private-key and public-key, you should run `npm run build` before start project
4. seed all data `npm run db:seed` (for the first time), note: please run `npm start` before seed data
Note: this project using RSA key, Please note that you SHOULD NOT commit both keys to git.