pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
contract vidamintToken is MintableToken ,PausableToken {
  string public constant name="vidamint";
  string public constant symbol = "VIDA";
  uint8 public constant decimals = 9;
  string public constant version="V0.1";  
  uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function vidamintToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }  
  
}
