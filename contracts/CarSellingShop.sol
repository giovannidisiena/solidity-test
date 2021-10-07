//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CarSellingShop is Ownable, Pausable {

    struct Car {
        address seller;
        address buyer;
        uint256 price;
        uint256 numSales;
        bool forSale;
    }

    uint256[] public cars;
    mapping(uint256 => Car) public carsForSale;

    event NewCarAddedForSale(uint256 _carId, uint256 _price);
    event NewCarSaleRecorded(uint256 _carId, address _seller, address _buyer, uint256 _price, uint256 _numSales);
    event CarPurchased(uint256 _carId, address _seller, address _buyer, uint256 _price, uint256 _numSales);
    event CarListedForSale(uint256 _carId, address _seller, uint256 _price);
    event ListingPriceUpdated(uint256 _carId, uint256 _price);
    event ListingStatusUpdated(uint256 _carId, bool _forSale);

    /**
     * @dev add new cars for sale
     * @param _carId unique car identifier
     * @param _price listing price in wei
     */
    function addNewCarForSale(uint256 _carId, uint256 _price) external onlyOwner() {
        require(carsForSale[_carId].forSale == false, "already for sale");
        carsForSale[_carId] = Car({seller:msg.sender, buyer:address(0), price:_price, numSales:0, forSale:true});
        cars.push(_carId);
        emit NewCarAddedForSale(_carId, _price);
    }

    /**
     * @dev record new car sale settled externally to this contract
     * @param _carId unique car identifier
     * @param _buyer address of buyer
     * @param _price listing price
     */
    function recordNewCarSale(uint256 _carId, address _buyer, uint256 _price) external onlyOwner() {
        Car storage car = carsForSale[_carId];
        require(car.forSale == true, "not for sale");
        require(_price >= car.price, "insufficient ether");
        car.forSale = false;
        car.numSales++;
        car.price = _price;
        car.buyer = _buyer;
        emit NewCarSaleRecorded(_carId, car.seller, _buyer, _price, car.numSales);
    }

    /**
     * @dev purchase a car available for sale
     * @param _carId unique car identifier
     */
    function purchaseCar(uint256 _carId) external payable whenNotPaused() {
        Car storage car = carsForSale[_carId];
        require(car.forSale == true, "not for sale");
        require(car.seller != msg.sender, "bad buyer address");
        require(msg.value >= car.price, "insufficient ether");
        car.forSale = false;
        car.numSales++;
        car.price = msg.value; // TODO: could take a percentage of secondary sales
        car.buyer = msg.sender;
        emit CarPurchased(_carId, car.seller, msg.sender, msg.value, car.numSales);
    }

    /**
     * @dev list a car for sale
     * @param _carId unique car identifier
     * @param _price listing price
     */
    function listCarForSale(uint256 _carId, uint256 _price) external whenNotPaused() {
        Car storage car = carsForSale[_carId];
        require(car.buyer == msg.sender, "only owner");
        require(car.forSale == false, "already for sale");
        car.seller = msg.sender;
        car.buyer = address(0);
        car.price = _price;
        car.forSale = true;
        emit CarListedForSale(_carId, msg.sender, _price);
    }

    /**
     * @dev update listing price on a car for sale
     * @param _carId unique car identifier
     * @param _price listing price
     */
    function updateListingPrice(uint256 _carId, uint256 _price) external whenNotPaused() {
        Car storage car = carsForSale[_carId];
        require(car.seller == msg.sender, "only owner");
        require(car.forSale == true, "not for sale");
        car.price = _price;
        emit ListingPriceUpdated(_carId, _price);
    }

    /**
     * @dev upadte listing status on a car for sale
     * @param _carId unique car identifier
     * @param _forSale for sale bool
     */
    function updateListingStatus(uint256 _carId, bool _forSale) external whenNotPaused() {
        Car storage car = carsForSale[_carId];
        require(car.seller == msg.sender, "only owner");
        car.forSale = _forSale;
        emit ListingStatusUpdated(_carId, _forSale);
    }
}
