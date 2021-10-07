## 1. Event and log record

### a. What's the event and it used for?

Solidity events allow a contract to log blockchain state change and relevant data for easy retrieval and indexing by the EVM. Protocols such as The Graph, a dapp front-end or any other application connected to an Ethereum JSON-RPC interface can listen to these events and act accordingly when they occur.

### What parts does the log record have to store?

Logs are the result of LOG opcodes being executed in the EVM to create log records consisting of both topics (indexed parameters limited to a maximum of 32 bytes) and data which have a name, type and indexed Boolean value. Records are limited to four topics, with the first usually being the event signature in the case of a non-anonymous event. It is also possible to retrieve the logIndex, transactionLogIndex, block/transaction data and event params.

## 2. Where are the variables of different types stored?

Storage, memory and calldata are the three data locations in Solidity. Storage variables are stored permanently in the contract whereas memory is temporary and calldata is non-modifiable and non-persistent storage for function arguments. The EVM is stack-based machine and so performs all computations in a data structure in memory. The stack has a maximum depth of 1024 elements, each of size 32 bytes.

Local variables of value type (Booleans, integers, addresses, fixed-size byte arrays, etc) are stored in memory on the stack whereas the default location for complex reference types (strings, arrays, structs, etc) depends on the context and can be overridden by memory and storage keywords. Solidity mappings for example can only be declared globally in storage however they can be accessed in memory for read-only operations.

## 3. Call and DelegateCall

### a. What are Call and DelegateCall?

Call and DelegateCall are low-level methods used to call functions on another contract. Note that to use DelegateCall both the calling and target contracts must have compatible storage layout.

### b. What’s the relationship between them?

Context is important when the target contract logic is executed. The context is on the target contract when using Call to execute the target function directly, such that state changes are reflected in the target contract storage. In the case of a DelegateCall to the target contract function on behalf of the calling contract, the context is on the calling contract such that all state changes are reflected in the calling contract storage (e.g. poxy pattern).

## 4. What’s the Reentrancy attack/recursive call and how to avoid it?

A contract is susceptible to reentrancy attacks or recursive calling vulnerabilities when making external calls to another contract prior to resolving any effects such as updating internal state/balances. A vulnerable function will typically make external calls using transfer, send, or call which can be exploited by inadvertently calling the fallback function on an attacker’s contract, though transfer and send are considered safer than call due to the 2,300 gas limit which helps to prevent recursive calls. The most effective way to prevent reentrancy attack is to update state prior to making external calls in conjunction with the OpenZeppelin ReentrancyGuard nonReentrant modifier.

## 5. What’s the relationship and difference between Bytes and String? What are they used for respectively? When to use Bytes instead of String and String instead of Bytes? What’s the relationship and difference between Bytes and String? What are they used

for respectively? When to use Bytes instead of String and String instead of Bytes?
As per the Solidity docs, variables of type bytes and string are special arrays. String is equal to Bytes but does not allow length or index access, so Bytes is generally used for arbitrary-length raw byte data and String for arbitrary-length string (UTF-8) data.

## 6. What do you know about Solidity Bitwise Operations? When should we use them?

Storing data via the SSTORE opcode is the most expensive computation in Ethereum. Use of bitmaps is one technique for optimizing storage and access in certain use cases, resulting in lower gas costs. In this example the bitwise AND operator is utilised in conjunction with the left-shift operator to get the value of the n-th bit of uint256[] public bitmap: bitmap & (1 << n).
