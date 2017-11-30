This is the code for the initial vidamint Registry token distribution.

# Initialize
This was developed using Node 7.5.0, Truffle 3.2.4 and TestRPC 3.0.5.

```
npm install
truffle compile
```


#Steps to follow

1. truffle migrate --network development
2. truffle exec ./script/checkInitialSaleSetup.js --network development
3. truffle exec ./script/CreateTimeVault.js --network development
4. truffle exec ./script/MigrateTokens.js --network development

