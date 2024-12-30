import React, { Component } from 'react'
import { connect } from 'react-redux'
// import Spinner from './Spinner'
import { loadBalances } from '../store/interactions'
import {
    exchangeSelector,
    tokenSelector,
    accountSelector,
    web3Selector,
    etherBalanceSelector,
    tokenBalanceSelector,
    exchangeEtherBalanceSelector,
    exchangeTokenBalanceSelector,
    // balancesLoadingSelector,
    // etherDepositAmountSelector,
    // etherWithdrawAmountSelector,
    // tokenDepositAmountSelector,
    // tokenWithdrawAmountSelector,
  } from '../store/selectors'

class Balance extends Component {
    componentDidMount() {
        this.loadBlockchainData()
      }
    
      async loadBlockchainData(props) {
        const { dispatch, web3, exchange, token, account } = this.props
        await loadBalances(dispatch, web3, exchange, token, account)
      }

    render() {
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Balance
                </div>
                <div className="card-body">
                    {/*  */}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    console.log({
        account: accountSelector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEtherBalance: exchangeEtherBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    })
    return {
        account: accountSelector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEtherBalance: exchangeEtherBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    }
}

export default connect(mapStateToProps)(Balance)








