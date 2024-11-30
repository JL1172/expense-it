# Directions

This is a very light weight terminal based expense tracker. I only made this for me and to solve my problems, which describes why it is minimal. If you want to use it, run this command at the root of your project:

```
touch src/expenses.json
mkdir src/backups 

npm install
npm run start:dev
```

All data storage is local, before you commit, ensure that you did not omit the expenses.json and backups in your .gitignore file lest you leak you personal expenses

Will clean up and optimize, just wanted an mvp, sorry for ugly code.