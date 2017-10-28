pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract vidamintToken is MintableToken  {
  string public constant name="vidamint";
  string public constant symbol = "VIDA";
  uint8 public constant decimals = 9;
  string public constant version="V0.1";  
  //uint256 public constant INITIAL_SUPPLY = 3 * (10 ** uint256(decimals));
//address public  me=address(0xf1b5f4822ee45fa8572b32da967d606bddc802aa);
  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function vidamintToken() {
   /*  totalSupply = INITIAL_SUPPLY;
    balances[owner] = INITIAL_SUPPLY; */
  }  
         // low level token purchase function
 
}
