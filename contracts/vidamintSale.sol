pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './vidamintToken.sol';
contract vidamintSale is CappedCrowdsale ,RefundableCrowdsale
 {
  function vidamintSale(uint256 _startTime, uint256 _endTime, uint256 _rate,uint256 _goal, uint256 _cap, address _wallet)
    CappedCrowdsale(_cap)
    FinalizableCrowdsale()
    RefundableCrowdsale(_goal)
    Crowdsale(_startTime, _endTime, _rate, _wallet)
  {
    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    //require(_goal <= _cap);
  }
  bool public preSaleTokensDisbursed = false;
  bool public foundersTokensDisbursed = false;
  vidamintToken private token;
  event TransferredPreBuyersReward(address indexed preBuyer, uint amount);
  event TransferredFoundersTokens(address vault, uint amount);
  event PurchasedTokens(address indexed purchaser, uint amount);

  
  function createTokenContract()  internal returns (MintableToken) {
    token = new vidamintToken();
    return token;
  }

    /// @dev distributeFoundersRewards(): private utility function called by constructor
    /// @param _preBuyers an array of addresses to which awards will be distributed
    /// @param _preBuyersTokens an array of integers specifying preBuyers rewards
    function distributePreBuyersRewards(
        address[] _preBuyers,
        uint[] _preBuyersTokens
    ) 
        public
        onlyOwner
    { 
        assert(!preSaleTokensDisbursed);
        for(uint i = 0;i < _preBuyers.length;i++) {
            require(token.transfer(_preBuyers[i], _preBuyersTokens[i]));
            TransferredPreBuyersReward(_preBuyers[i], _preBuyersTokens[i]);
        }
        preSaleTokensDisbursed = true;
    }

}
