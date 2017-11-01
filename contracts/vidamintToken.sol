pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import "./UpgradeableToken.sol";
contract vidamintToken is MintableToken,UpgradeableToken  {
  string public constant name="vidamint";
  string public constant symbol = "VIDA";
  uint8 public constant decimals = 9;
  string public constant version="V0.1";  
  
  function vidamintToken(address _owner)
    UpgradeableToken(_owner) {
    //owner = _owner;
    //totalSupply = 2 * (10**18); // need to enable to test migration
    //balances[owner] = 2 * (10**18); // need to enable to test migration
  }  
 
}
