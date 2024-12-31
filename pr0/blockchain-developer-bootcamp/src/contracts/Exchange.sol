// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.21;

import "./Token.sol";

contract Exchange {
    // Variables
    address public feeAccount;
    uint256 public feePercent;
    address constant ETHER = address(0); // Represents Ether as a token in the exchange
    mapping(address => mapping(address => uint256)) public tokens; // Tracks token balances
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    // New arrays to track order status
    uint256[] public allOrders;       // Tracks all order IDs
    uint256[] public cancelledOrders; // Tracks cancelled orders
    uint256[] public filledOrders;    // Tracks filled orders

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timeStamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timeStamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timeStamp
    );

    // Structs
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timeStamp;
    }

    uint256 public nextOrderId; // To track the next order ID

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Handle direct Ether transfers
    receive() external payable {
        depositEther(); // Deposit Ether directly if sent to the contract
    }

    // Fallback function to handle any calls with invalid data
    fallback() external payable {
        revert("Fallback function called"); // Reverts any call with data
    }

    // Deposit Ether into the exchange
    function depositEther() public payable {
        tokens[ETHER][msg.sender] += msg.value; // Add Ether to the user's balance
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    // Withdraw Ether from the exchange
    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount, "Insufficient balance");
        tokens[ETHER][msg.sender] -= _amount; // Deduct Ether from user's balance
        payable(msg.sender).transfer(_amount); // Send Ether back to the user
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    // Deposit Tokens into the exchange
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER, "Cannot deposit Ether in this function");
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        tokens[_token][msg.sender] += _amount; // Update user's token balance
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Withdraw Tokens from the exchange
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER, "Cannot withdraw Ether with this function");
        require(tokens[_token][msg.sender] >= _amount, "Insufficient balance");
        tokens[_token][msg.sender] -= _amount; // Deduct token balance
        require(
            Token(_token).transfer(msg.sender, _amount),
            "Token transfer failed"
        );
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Get the balance of a particular token for a user
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    // Make an order and add it to the allOrders array
    // function makeOrder(
    //     address _tokenGet,
    //     uint256 _amountGet,
    //     address _tokenGive,
    //     uint256 _amountGive
    // ) public {
    //     orderCount++;
    //     orders[orderCount] = _Order(
    //         orderCount,
    //         msg.sender,
    //         _tokenGet,
    //         _amountGet,
    //         _tokenGive,
    //         _amountGive,
    //         block.timestamp
    //     );
    //     allOrders.push(orderCount); // Add order to allOrders array
    //     emit Order(
    //         orderCount,
    //         msg.sender,
    //         _tokenGet,
    //         _amountGet,
    //         _tokenGive,
    //         _amountGive,
    //         block.timestamp
    //     );
    // }

    function makeOrder(address _tokenGet,uint256 _amountGet,address _tokenGive,uint256 _amountGive) public {
        orderCount++;
        allOrders.push(orderCount); // Add order to allOrders array
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }


    // Cancel order
    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(_order.id == _id, "Invalid order ID");
        require(_order.user == msg.sender, "Unauthorized cancellation");
        orderCancelled[_id] = true;
        cancelledOrders.push(_id); // Add cancelled order to cancelledOrders array
        emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            _order.timeStamp
        );
    }

    // Fill order and update filledOrders array
    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount, 'Invalid order ID');
        require(!orderFilled[_id], 'Order already filled');
        require(!orderCancelled[_id], 'Order already cancelled');
        _Order storage _order = orders[_id];
        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
        orderFilled[_order.id] = true;
        filledOrders.push(_order.id); // Add filled order to filledOrders array
    }

    function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
        // Fee paid by the user that fills the order, a.k.a. msg.sender.
        uint256 _feeAmount = _amountGet * feePercent / 100;

        tokens[_tokenGet][msg.sender] -= _amountGet + _feeAmount;
        tokens[_tokenGet][_user] += _amountGet;
        tokens[_tokenGet][feeAccount] += _feeAmount;
        tokens[_tokenGive][_user] -= _amountGive;
        tokens[_tokenGive][msg.sender] += _amountGive;

        emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, block.timestamp);
    }

    // Getters for tracking orders
    function getAllOrders() public view returns (_Order[] memory) {
        _Order[] memory ordersArray = new _Order[](orderCount);
        for (uint256 i = 0; i < orderCount; i++) {
            ordersArray[i] = orders[i + 1]; // Assuming the order IDs start from 1
        }
        return ordersArray;
    }


    function getCancelledOrders() public view returns (uint256[] memory) {
        return cancelledOrders;
    }

    function getFilledOrders() public view returns (uint256[] memory) {
        return filledOrders;
    }
}
