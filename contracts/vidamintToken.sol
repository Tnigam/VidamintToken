pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import "./UpgradeableToken.sol";
contract VidamintToken is MintableToken,UpgradeableToken  {
  string public constant  name="vidamint";
  string public constant symbol = "VIDA";
  uint8 public constant decimals = 18;
  string public constant version="V1.0";  
    /** Name and symbol were updated. */
  //event UpdatedTokenInformation(string newName, string newSymbol, string _version);

  function VidamintToken(address _owner)
    UpgradeableToken(_owner) {
    //owner = _owner;
    //totalSupply = 2 * (10**18); // need to enable to test migration
    //balances[owner] = 2 * (10**18); // need to enable to test migration
  }  
 /* function setTokenInformation(string _name, string _symbol, string _version ) onlyOwner {
    name = _name;
    symbol = _symbol;
    version=_version;
    UpdatedTokenInformation(name, symbol,version);
  } */
}
