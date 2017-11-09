pragma solidity ^0.4.11;
import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "./UpgradeableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract VidamintToken is MintableToken, UpgradeableToken, UpgradeAgent {
    string public constant  name="vidamint";
    string public constant symbol = "VIDA";
    uint8 public constant decimals = 18;
    string public constant version="V1.0";
  
    using SafeMath for uint256;
    UpgradeableToken public oldToken;
    uint256 public originalSupply;

    function VidamintToken() UpgradeableToken(msg.sender) {
      //owner = _owner;
      //totalSupply = 2 * (10**18); // need to enable to test migration
      //balances[owner] = 2 * (10**18); // need to enable to test migration
    } 
    
    function vidamintTokenMigration(UpgradeableToken _oldToken) {

        oldToken = _oldToken;

        // Let's not set bad old token
        if (address(oldToken) == 0) {
            revert();
        }

        // Let's make sure we have something to migrate
        originalSupply = _oldToken.totalSupply();
        if (originalSupply == 0) {
            revert();
        }
    }

    function upgradeFrom(address _from, uint256 _value) public {
        if (msg.sender != address(oldToken)) 
            revert(); // only upgrade from oldToken

        // Mint new tokens to the migrator
        totalSupply = totalSupply.add(_value);
        balances[_from] = balances[_from].add(_value);
            
        Transfer(0, _from, _value);
    }
}
