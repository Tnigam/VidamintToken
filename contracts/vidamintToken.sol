pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
import 'zeppelin-solidity/contracts/token/TokenTimelock.sol';
contract vidamintToken is MintableToken ,PausableToken {
  string public constant name="vidamint";
  string public constant symbol = "VIDA";
  uint8 public constant decimals = 9;
  string public constant version="V0.1";  
  event TransferredlockedTokens (address indexed sender,address vault, uint amount);
  //uint256 public constant INITIAL_SUPPLY = 3 * (10 ** uint256(decimals));
//address public  me=address(0xf1b5f4822ee45fa8572b32da967d606bddc802aa);
  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */

    function transfer(address _to, uint256 _value) public returns (bool) {
      return super.transfer(_to,_value);
  } 
    
  function timeLockTokens(address beneficiary,uint64 _releaseTime) public payable returns (MintableToken){
    require(beneficiary != 0x0);
    require(_releaseTime > now);

    uint256 tokenAmount = msg.value;
    
    MintableToken newToken = new MintableToken();
    TokenTimelock timeVault = new TokenTimelock(newToken, beneficiary, _releaseTime);
    transfer(timeVault, tokenAmount);
    TransferredlockedTokens(msg.sender, beneficiary, tokenAmount);
    return newToken;
  }
 }
