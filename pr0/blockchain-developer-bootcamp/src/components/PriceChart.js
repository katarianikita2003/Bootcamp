import React from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import { chartOptions } from './PriceChart.config'
import {
  priceChartLoadedSelector,
  priceChartSelector
} from '../store/selectors'

const priceSymbol = (lastPriceChange) => (
  <span className={lastPriceChange === '+' ? "text-success" : "text-danger"}>
    {lastPriceChange === '+' ? '▲' : '▼'}
  </span>
)

const renderPriceChart = (priceChart) => (
  <div className="price-chart">
    <div className="price">
      <h4>BZen/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h4>
    </div>
    <Chart
      options={chartOptions}
      series={priceChart.series}
      type='candlestick'
      width='100%'
      height={250}
    />
  </div>
)

const PriceChart = ({ priceChartLoaded, priceChart }) => (
  <div className="card bg-dark text-white">
    <div className="card-header">
      Price Chart
    </div>
    <div className="card-body">
      {priceChartLoaded ? renderPriceChart(priceChart) : <Spinner />}
    </div>
  </div>
)

const mapStateToProps = (state) => ({
  priceChartLoaded: priceChartLoadedSelector(state),
  priceChart: priceChartSelector(state),
})

export default connect(mapStateToProps)(PriceChart)





// import React, { Component } from 'react'
// import { connect } from 'react-redux'
// import Chart from 'react-apexcharts'
// import Spinner from './Spinner'
// import { chartOptions } from './PriceChart.config'
// import {
//   priceChartLoadedSelector,
//   priceChartSelector
// } from '../store/selectors'

// const priceSymbol = (lastPriceChange) => {
//   let output
//   if(lastPriceChange === '+') {
//     output = <span className="text-success">&#9650;</span> // Green up tiangle
//   } else {
//     output = <span className="text-danger">&#9660;</span> // Red down triangle
//   }
//   return(output)
// }

// const showPriceChart = (priceChart) => {
//   return(
//     <div className="price-chart">
//       <div className="price">
//         <h4>BZen/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h4>
//       </div>
//       <Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%' />
//     </div>
//   )
// }


// class PriceChart extends Component {
//   render() {
//     return (
//       <div className="card bg-dark text-white">
//         <div className="card-header">
//           Price Chart
//         </div>
//         <div className="card-body">
//           {this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner />}
//         </div>
//       </div>
//     )
//   }
// }

// function mapStateToProps(state) {

//   return {
//     priceChartLoaded: priceChartLoadedSelector(state),
//     priceChart: priceChartSelector(state),
//   }
// }


// export default connect(mapStateToProps)(PriceChart)
