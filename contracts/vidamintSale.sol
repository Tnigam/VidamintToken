pragma solidity ^0.4.11;
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/TokenTimelock.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './vidamintToken.sol';
contract vidamintSale is CappedCrowdsale,RefundableCrowdsale,Pausable 
 {
  function vidamintSale(uint256 _startTime, uint256 _endTime, uint256 _rate,uint256 _goal, uint256 _cap, address _wallet)
    CappedCrowdsale(_cap)
    FinalizableCrowdsale()
    RefundableCrowdsale(_goal)
    Crowdsale(_startTime, _endTime, _rate, _wallet)
  {
    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap);
   // pause();
  }
  bool public preSaleTokensDisbursed = false;
  bool public foundersTokensDisbursed = false;
  event TransferredPreBuyersReward(address indexed preBuyer, uint amount);
  event TransferredFoundersTokens(address vault, uint amount);
  event TransferredlockedTokens (address indexed sender,address vault, uint amount);
 

  
function () whenNotPaused payable  {
buyTokens(msg.sender);
}


  // low level token purchase function
  function buyTokens(address beneficiary) public whenNotPaused payable {
    require(beneficiary != 0x0);
    //require(validPurchase());

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }
   
  function createTokenContract()  internal returns (MintableToken) {
   return  new vidamintToken();
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
       
        for(uint i = 0; i < _preBuyers.length; i++) {
           require(token.mint(_preBuyers[i], _preBuyersTokens[i]));
            TransferredPreBuyersReward(_preBuyers[i], _preBuyersTokens[i]);
        }
        preSaleTokensDisbursed = true;
    }

 function distributeFoundersRewards(
        address[] _founders,
        uint[] _foundersTokens
    ) 
        public
        onlyOwner
    { 
        assert(preSaleTokensDisbursed);
        assert(!foundersTokensDisbursed);
       
        for(uint j = 0; j < _founders.length; j++) {
            require(token.mint(_founders[j], _foundersTokens[j]));
            TransferredFoundersTokens(_founders[j], _foundersTokens[j]);
        }

        foundersTokensDisbursed = true;
    }
 function timeLockTokens(address beneficiary,uint64 _releaseTime) public payable returns (MintableToken){
    require(beneficiary != 0x0);
    require(_releaseTime > now);

    uint256 tokenAmount = msg.value;
    
    MintableToken newToken = createTokenContract();
    TokenTimelock timeVault = new TokenTimelock(newToken, beneficiary, _releaseTime);
    //token.transfer(timeVault, tokenAmount);
    TransferredlockedTokens(msg.sender, beneficiary, tokenAmount);
    return newToken;
  }

     /*
     * Owner-only functions
     */
   
    function changeOwner(address _newOwner)
        onlyOwner
    {
        require(_newOwner != 0);
        owner = _newOwner;
    }

    function changePrice(uint _newRate)
        onlyOwner
        
    {
        require(_newRate != 0);
        rate = _newRate;
    }

    function changeWallet(address _wallet)
        onlyOwner
        
    {
        require(_wallet != 0);
        wallet = _wallet;
    }

    function changeStartdate(uint _startTime)
        onlyOwner
        
    {
        require(_startTime != 0);

        
        startTime = _startTime;
    }

    
}
