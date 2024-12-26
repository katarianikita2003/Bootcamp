import { tokens, ether, amountGet, amountGive, EVM_REVERT, ETHER_ADDRESS } from './helper';
const { expectRevert } = require('@openzeppelin/test-helpers');

const Token = artifacts.require('./Token');
const Exchange = artifacts.require('./Exchange');

require('chai')
    .use(require('chai-as-promised'))
    .should();
    
contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
    let token;
    let exchange;
    const feePercent = 10;

    beforeEach(async () => {
        token = await Token.new();  // Deploy Token contract
        exchange = await Exchange.new(feeAccount, feePercent);  // Deploy Exchange contract with feeAccount and feePercent

        // Transfer tokens to user1
        await token.transfer(user1, tokens(100), { from: deployer });
    });

    describe('deployment', () => {
        it('tracks the feeAccount', async () => {
            const result = await exchange.feeAccount();
            result.should.equal(feeAccount);
        });

        it('tracks the feePercent', async () => {
            const result = await exchange.feePercent();
            result.toString().should.equal(feePercent.toString());
        });
    });

    describe('depositing Ether', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1);
            result = await exchange.depositEther({ from: user1, value: amount });
        });

        it('tracks the Ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1);
            balance.toString().should.equal(amount.toString());
        });

        it('emits a Deposit event', async () => {
            const log = result.logs[0];
            log.event.should.eq('Deposit');
            const event = log.args;
            event.token.should.equal(ETHER_ADDRESS, 'token address is correct');
            event.user.should.equal(user1, 'user address is correct');
            event.amount.toString().should.equal(amount.toString(), 'amount is correct');
            event.balance.toString().should.equal(amount.toString(), 'balance is correct');
        });
    });

    describe('withdrawing Ether', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1);
            await exchange.depositEther({ from: user1, value: amount });
        });

        describe('success', () => {
            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, { from: user1 });
            });

            it('withdraws Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1);
                balance.toString().should.equal('0');
            });

            it('emits a "Withdraw" event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const event = log.args;
                event.token.should.equal(ETHER_ADDRESS);
                event.user.should.equal(user1);
                event.amount.toString().should.equal(amount.toString());
                event.balance.toString().should.equal('0');
            });
        });

        describe('failure', () => {
            it('rejects withdraws for insufficient balances', async () => {
                await exchange.withdrawEther(ether(100), { from: user1 })
                    .should.be.rejectedWith('Insufficient balance');
            });
        });
    });

    describe('depositing tokens', () => {
        let result;
        let amount;

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, { from: user1 });
                result = await exchange.depositToken(token.address, amount, { from: user1 });
            });

            it('tracks the token deposit', async () => {
                let balance = await token.balanceOf(exchange.address);
                balance.toString().should.equal(amount.toString());

                balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal(amount.toString());
            });

            it('emits a Deposit event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Deposit');
                const event = log.args;
                event.token.should.equal(token.address, 'token address is correct');
                event.user.should.equal(user1, 'user address is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal(amount.toString(), 'balance is correct');
            });
        });

        describe('failure', () => {
            it('rejects Ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 })
                    .should.be.rejectedWith('Cannot deposit Ether in this function');
            });

            it('fails when no tokens are approved', async () => {
                await exchange.depositToken(token.address, tokens(10), { from: user1 })
                    .should.be.rejectedWith('Allowance exceeded');
            });
        });
    });

    describe('withdrawing tokens', () => {
        let result;
        let amount;

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, { from: user1 });
                await exchange.depositToken(token.address, amount, { from: user1 });
                result = await exchange.withdrawToken(token.address, amount, { from: user1 });
            });

            it('withdraws token funds', async () => {
                const balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal('0');
            });

            it('emits a "Withdraw" event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const event = log.args;
                event.token.should.equal(token.address);
                event.user.should.equal(user1);
                event.amount.toString().should.equal(amount.toString());
                event.balance.toString().should.equal('0');
            });
        });

        describe('failure', () => {
            it('rejects Ether withdraws', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 })
                    .should.be.rejectedWith('Cannot withdraw Ether with this function');
            });

            it('fails for insufficient balances', async () => {
                await exchange.withdrawToken(token.address, tokens(10), { from: user1 })
                    .should.be.rejectedWith('Insufficient balance');
            });
        });
    });

    describe('balanceOf', () => {
        it('returns the correct balance for Ether', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
            result.toString().should.equal('0');
        });

        it('returns the correct balance for tokens', async () => {
            const result = await exchange.balanceOf(token.address, user1);
            result.toString().should.equal('0');
        });
    });

    describe('fallback function', () => {
        it('should revert when calling the fallback function with data', async () => {
            await expectRevert(
                exchange.sendTransaction({ from: user1, data: '0x1234' }),
                'Fallback function called'
            );
        });

        it('should accept Ether sent directly to the contract', async () => {
            await exchange.sendTransaction({ from: user1, value: ether(1) });
            const balance = await exchange.tokens(ETHER_ADDRESS, user1);
            balance.toString().should.equal(ether(1).toString());
        });
    });

    describe('making orders', () => {
        let result
        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
        })

        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount()
            orderCount.toString().should.equal('1')
            const order = await exchange.orders('1')
            order.id.toString().should.equal('1', 'id is correct')
            order.user.toString().should.equal(user1, 'user is correct')
            order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
            order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            order.timeStamp.toString().length.should.be.greaterThan(0, 'timeStamp is set');
        })

        it('emits on "Order" event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Order')
            const event = log.args
            event.id.toString().should.equal('1', 'id is correct')
            event.user.toString().should.equal(user1, 'user is correct')
            event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
            event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            event.timeStamp.toString().length.should.be.greaterThan(0, 'timeStamp is set');
        })
    })

    describe('order actions', async () => {
        beforeEach(async () => {
            // user1 deposits Ether only
            await exchange.depositEther({ from: user1, value: ether(1) });

            // user2 receives tokens and deposits them
            await token.transfer(user2, tokens(100), { from: deployer });
            await token.approve(exchange.address, tokens(2), { from: user2 });
            await exchange.depositToken(token.address, tokens(2), { from: user2 });

            // user1 creates an order
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 });
        });

        describe('filling orders', async () => {
            let result;

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.fillOrder('1', { from: user2 });
                });

                it('executes the trade & charges fees', async () => {
                    let balance
                    balance = await exchange.balanceOf(token.address, user1)
                    balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
                    balance.toString().should.equal(ether(1).toString(), 'user2 received Ether')
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                    balance.toString().should.equal('0', 'user1 Ether deducted')
                    balance = await exchange.balanceOf(token.address, user2)
                    balance.toString().should.equal(tokens(0.9).toString(), 'user2 tokens deducted with fee applied')
                    const feeAccount = await exchange.feeAccount()
                    balance = await exchange.balanceOf(token.address, feeAccount)
                    balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount received fee')
                  })
                
                it('updates filled orders', async () => {
                    const orderFilled = await exchange.orderFilled(1);
                    orderFilled.should.equal(true);
                });

                it('emits a "Trade" event', async () => {
                    const tradeEvents = result.logs.filter(log => log.event === 'Trade');
                    tradeEvents.length.should.equal(1, 'Exactly one Trade event should be emitted');
                    const log = tradeEvents[0];
                    const event = log.args;

                    event.id.toString().should.equal('1', 'id is correct');
                    event.user.should.equal(user1, 'user is correct');
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct');
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct');
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
                    event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct');
                });
            });

            describe('failure', async () => {
                it('rejects invalid order IDs', async () => {
                    await exchange.fillOrder(9999, { from: user2 }).should.be.rejectedWith('Invalid order ID');
                });

                it('rejects already-filled orders', async () => {
                    await exchange.fillOrder('1', { from: user2 });
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith('Order already filled');
                });

                it('rejects cancelled orders', async () => {
                    await exchange.cancelOrder('1', { from: user1 });
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith('Order already cancelled');
                });
            });
        });
    });
});

