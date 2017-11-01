pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./UpgradeableToken.sol";
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

/**
 * A sample token that is used as a migration testing target.
 *
 * This is not an actual token, but just a stub used in testing.
 */
contract vidamintTokenMigration is StandardToken, UpgradeAgent {

  using SafeMath for uint256;

  UpgradeableToken public oldToken;

  uint256 public originalSupply;

  function vidamintTokenMigration(UpgradeableToken _oldToken) {

    oldToken = _oldToken;

    // Let's not set bad old token
    if(address(oldToken) == 0) {
      revert();
    }

    // Let's make sure we have something to migrate
    originalSupply = _oldToken.totalSupply();
    if(originalSupply == 0) {
      revert();
    }
  }

  function upgradeFrom(address _from, uint256 _value) public {
    if (msg.sender != address(oldToken)) revert(); // only upgrade from oldToken

    // Mint new tokens to the migrator
    totalSupply = totalSupply.add(_value);
    balances[_from] = balances[_from].add(_value);
    Transfer(0, _from, _value);
  }

  function() public payable {
    revert();
  }

}
