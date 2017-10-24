pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
contract vidamintToken is MintableToken ,PausableToken {
  string public constant name="vidamint";
  string public constant symbol = "VIDA";
  uint8 public constant decimals = 9;
  string public constant version="V0.1";  
  uint256 public constant INITIAL_SUPPLY = 2 * (10 ** uint256(decimals));
//address public  me=address(0xf1b5f4822ee45fa8572b32da967d606bddc802aa);
  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function vidamintToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }  
  function transfer(address _to, uint256 _value) returns (bool success) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[msg.sender] >= _value && _value > 0) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            //Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }
}
