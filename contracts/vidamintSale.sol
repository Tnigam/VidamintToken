pragma solidity ^0.4.11;
import "./vidamintToken.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract VidamintSale is CappedCrowdsale, Pausable {
    using SafeMath for uint256;
    bool public preSaleIsStopped = false;
    bool public refundIsStopped = true;
    address[] public tokenVaults;
    mapping (address => uint256) public deposited;
    event TransferredPreBuyersReward(address  preBuyer, uint amount);
    event TransferredlockedTokens (address vault, uint amount);
    event Refunded(address indexed beneficiary, uint256 weiAmount);
    
    function VidamintSale(
        address _owner,
        uint256 _startTime, 
        uint256 _endTime, 
        uint256 _rate,
        uint256 _cap, 
        address _wallet)
        CappedCrowdsale(_cap)
        Crowdsale(_startTime, _endTime, _rate, _wallet) {
            owner = _owner;
            pause();
    
        }
 
    modifier preSaleRunning() {
        assert(preSaleIsStopped == false);
        _;
    }
  modifier refundIsRunning() {
        assert(refundIsStopped == false);
        _;
    }
    function () whenNotPaused payable {
        buyTokens(msg.sender);
    }

    // low level token purchase function
    function buyTokens(address beneficiary) public whenNotPaused payable {
        require(beneficiary != 0x0);
        require(validPurchase());

        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 tokens = weiAmount.mul(rate);
    
        // update state
        weiRaised = weiRaised.add(weiAmount);
        
        //tokens = tokens.mul(10**uint(18));
        require(tokens != 0);
        
        assert(token.mint(beneficiary, tokens));
        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
        deposited[msg.sender] = deposited[msg.sender].add(msg.value);
        forwardFunds();
    }

    /// @dev distributeFoundersRewards(): private utility function called by constructor
    /// @param _preBuyers an array of addresses to which awards will be distributed
    /// @param _preBuyersTokens an array of integers specifying preBuyers rewards
    function distributePreBuyersRewards(
        address[] _preBuyers,
        uint[] _preBuyersTokens
    ) public onlyOwner preSaleRunning { 
        for (uint i = 0; i < _preBuyers.length; i++) {
            uint tokenAmount = _preBuyersTokens[i].mul(10**uint(18));
            assert(token.mint(_preBuyers[i], tokenAmount));
            TransferredPreBuyersReward(_preBuyers[i], _preBuyersTokens[i]);
        }
        
    }
    function addToTokenVault(
        address _tokenVault,
        uint _tokensToBeAllocated
    ) public onlyOwner preSaleRunning {

        tokenVaults.push(_tokenVault);
        assert(token.mint(_tokenVault, _tokensToBeAllocated.mul(10**uint(18))));
        
    } 


     /*
     * Owner-only functions
     */
   function refund() public refundIsRunning {
       
        uint256 depositedValue = deposited[msg.sender];
        require(depositedValue > 0); 
        deposited[msg.sender] = 0;
        assert(deposited[msg.sender] == 0);
        wallet.transfer(depositedValue);
        Refunded(msg.sender, depositedValue);
     }
     function getTokenVaultsCount() public constant returns(uint)
    {
        return tokenVaults.length;
    }
    function changeTokenUpgradeMaster(address _upgradeMaster) onlyOwner {
        require(_upgradeMaster != 0);
        VidamintToken tokenInstance = VidamintToken(token);
        tokenInstance.setUpgradeMaster(_upgradeMaster);
    }

    function changeOwner(address _newOwner) onlyOwner {
        require(_newOwner != 0);
        owner = _newOwner;
    }

    function changeRate(uint _newRate) onlyOwner {
        require(_newRate != 0);
        rate = _newRate;
    }
    function changeCap(uint256 _newCap) onlyOwner {
        require(_newCap != 0);
        cap = _newCap;
    }
    function changeWallet(address _wallet) onlyOwner {
        require(_wallet != 0);
        wallet = _wallet;
    }

    function changeStartTime(uint _startTime) onlyOwner {
        require(_startTime != 0);
        startTime = _startTime;
    }

    function changeEndTime(uint _endTime) onlyOwner {
        require(_endTime != 0);
        endTime = _endTime;
    }

    function preSaleToggle() onlyOwner {
        preSaleIsStopped = !preSaleIsStopped;
    }
    function refundToggle() onlyOwner {
        refundIsStopped = !refundIsStopped;
    }

    function createTokenContract()  internal returns (MintableToken) {
        return  new VidamintToken();
    }

}
