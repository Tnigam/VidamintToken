pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import "./UpgradeableToken.sol";
contract vidamintToken is MintableToken,UpgradeableToken  {
  string public constant name="vidamint";
  string public constant symbol = "VIDA";
  uint8 public constant decimals = 9;
  string public constant version="V0.1";  
  
  function vidamintToken()
    UpgradeableToken(msg.sender) {
  }  
 
}
