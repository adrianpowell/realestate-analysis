import './App.css';
import React, {useEffect, useState} from 'react';
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip} from 'recharts';

function App() {

  const [purchasePrice, setPurchasePrice] = useState(650000),
    [downPaymentPercent, setDownPaymentPercent] = useState(20.0),
    [ammortizationPeriod, setAmmortizationPeriod] = useState(20),
    [mortgageRate, setMortgageRate] = useState(3.0),
    [annualPropertyTaxes, setAnnualPropertyTaxes] = useState(2000),
    [strataFees, setStrataFees] = useState(400),
    [annualMaintenance, setAnnualMaintenance] = useState(1000),
    [annualGrowthRate, setAnnualGrowthRate] = useState(0.0),
    [drawdown, setDrawdown] = useState(0),
    
    // resale
    [realtorCommissionPercent, setRealtorCommissionPercent] = useState(6.0),
    
    // opportunity cost
    [investmentReturnPercentage, setInvestmentReturnPercentage] = useState(6.5),
    
    // rental comparison
    [comparableMonthlyRent, setComparableMonthlyRent] = useState(2400),
    [annualRentIncrease, setAnnualRentIncrease] = useState(0.0),

    // analysis
    [yearsToRun, setYearsToRun] = useState(20),

    // results
    [data, setData] = useState([[]]),
    [annualHouseExpense, setAnnualHouseExpense] = useState(0.0);

  const currencyFormatter = new Intl.NumberFormat('en-US',
      {style: 'currency', currency: 'USD'});
  const handleChange = setter => event => setter(event.target.value);

  const regenerateCharts = () => {
    console.log("regenerating charts: ", annualMaintenance, annualPropertyTaxes);
    const downpayment = purchasePrice * (downPaymentPercent/100.0);

    const mortgage = (purchasePrice - downpayment);
    const mortgageRateDec = mortgageRate/100.0;
    // https://www.mtgprofessor.com/formulas.htm
    const annualMortgagePayment = mortgage * (mortgageRateDec * Math.pow(1 + mortgageRateDec, ammortizationPeriod)) /
        (Math.pow(1 + mortgageRateDec, ammortizationPeriod) - 1);

    let tmpAnnualHouseExpense = (12 * strataFees)
        + (!annualMaintenance ? 0 : parseInt(annualMaintenance))
        + (!annualPropertyTaxes ? 0 : parseInt(annualPropertyTaxes));
    setAnnualHouseExpense(tmpAnnualHouseExpense);

    let i;
    let currHousePrice = purchasePrice * (1.0-(drawdown*1.0/100.0));
    let currRemainingMortgage = purchasePrice - downpayment;
    let currInvestmentEquity = downpayment;
    let newData = [];
    let totalInvestmentInterest = 0;
    let totalHouseHoldingCosts = 0;
    let totalHousingInterest = 0;
    let totalInvestmentSavings = 0;
    let currAnnualRent = 12 * comparableMonthlyRent;
    yearRange = [...Array(yearsToRun).keys()];
    for (i = 1; i < yearsToRun; i++) {
      currAnnualRent = currAnnualRent * (1.0 + (annualRentIncrease/100.0));
      currHousePrice = currHousePrice * (1.0 + (annualGrowthRate/100.0));
      let tmpInvestmentDelta = tmpAnnualHouseExpense + annualMortgagePayment - (currAnnualRent);

      // https://www.mtgprofessor.com/formulas.htm
      const remainingLoanBalance = mortgage
          * (Math.pow(1 + mortgageRateDec, ammortizationPeriod) - Math.pow(1 + mortgageRateDec, i))
          / (Math.pow(1 + mortgageRateDec, ammortizationPeriod) - 1);
      // the difference between what we paid and how much loan decreases
      let currHousingInterestPaid = annualMortgagePayment - (currRemainingMortgage - remainingLoanBalance);
      currRemainingMortgage = remainingLoanBalance;
      totalHousingInterest = totalHousingInterest + currHousingInterestPaid;
      totalHouseHoldingCosts = totalHouseHoldingCosts + tmpAnnualHouseExpense;

      let currInvestmentInterest = (currInvestmentEquity + tmpInvestmentDelta) * (investmentReturnPercentage/100.0);
      currInvestmentEquity = (currInvestmentEquity + tmpInvestmentDelta) + currInvestmentInterest;
      totalInvestmentInterest = totalInvestmentInterest + currInvestmentInterest;
      totalInvestmentSavings = totalInvestmentSavings + tmpInvestmentDelta;

      let currHouseEquity = (currHousePrice - remainingLoanBalance) -
          (currHousePrice * realtorCommissionPercent / 100.0);

      newData.push({
        name: i,
        investmentNetEquity: Math.round(currInvestmentEquity/1000),
        homeNetEquity: Math.round(currHouseEquity/1000),
        totalHousingInterestPaid: totalHousingInterest,
        currHousingInterestPaid: currHousingInterestPaid,
        housePrice: Math.round(currHousePrice/1000),
        totalHouseHoldingCosts: totalHouseHoldingCosts,
        investmentSavings: totalInvestmentSavings,
        totalInvestmentInterest: totalInvestmentInterest
      });
    }
    setData(newData);
  };

  useEffect(() => {
    regenerateCharts();
  }, [purchasePrice, downPaymentPercent,
      ammortizationPeriod, mortgageRate,
      annualPropertyTaxes, strataFees,
      annualMaintenance, drawdown,
      investmentReturnPercentage, realtorCommissionPercent,
      comparableMonthlyRent, annualRentIncrease,
      yearsToRun, annualGrowthRate]);

  let yearRange = [...Array(yearsToRun).keys()];

  return (
    <div className="App">
      <header>
        <h1 className="ui header">Compare home ownership with renting</h1>
      </header>
      <form className="ui form">
        <div className="two fields">
          <div className="field">
            <label>Purchase price</label>
            <input type="number" onChange={handleChange(setPurchasePrice)} value={purchasePrice} />
          </div>
          <div className="field">
            <label>Downpayment (%)</label>
            <input type="number" onChange={handleChange(setDownPaymentPercent)} value={downPaymentPercent} />
          </div>
        </div>
        <div className="two fields">
          <div className="field">
            <label>Ammortization Period</label>
            <input type="number" onChange={handleChange(setAmmortizationPeriod)} value={ammortizationPeriod} />
          </div>
          <div className="field">
            <label>Mortgate Rate (%)</label>
            <input type="number" onChange={handleChange(setMortgageRate)} value={mortgageRate} />
          </div>
        </div>
        <div className="two fields">
          <div className="field">
            <label>Annual Property Taxes</label>
            <input type="number" onChange={handleChange(setAnnualPropertyTaxes)} value={annualPropertyTaxes} />
          </div>
          <div className="field">
            <label>Strata Fees (monthly)</label>
            <input type="number" onChange={handleChange(setStrataFees)} value={strataFees} />
          </div>
        </div>
        <div className="two fields">
          <div className="field">
            <label>Annual Maintenance</label>
            <input type="number" onChange={handleChange(setAnnualMaintenance)} value={annualMaintenance} />
          </div>
          <div className="field">
            <label>Drawdown</label>
            <select className="ui fluid dropdown" value={drawdown} onChange={(event)=> setDrawdown(event.target.value)}>
              { [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(index => {
                return(<option key={index} value={index}>{index}</option>);
              })}
            </select>
          </div>
        </div>
        <h4>Opportunity Costs</h4>
        <div className="two fields">
          <div className="field">
            <label>Investment return (%)</label>
            <input type="number" onChange={handleChange(setInvestmentReturnPercentage)} value={investmentReturnPercentage} />
          </div>
          <div className="field">
            <label>Realtor Commission (% of sale)</label>
            <input type="number" onChange={handleChange(setRealtorCommissionPercent)} value={realtorCommissionPercent} />
          </div>
        </div>
        <div className="two fields">
          <div className="field">
            <label>Comparable monthly rent</label>
            <input type="number" onChange={handleChange(setComparableMonthlyRent)} value={comparableMonthlyRent} />
          </div>
          <div className="field">
            <label>Annual rent increase %</label>
            <input type="number" onChange={handleChange(setAnnualRentIncrease)} value={annualRentIncrease} />
          </div>
        </div>
        <h4>Analysis details</h4>
        <div className="two fields">
          <div className="field">
            <label>Years to run</label>
            <input type="number" onChange={handleChange(setYearsToRun)} value={yearsToRun} />
          </div>
          <div className="field">
            <label>Annual growth rate above inflation (%)</label>
            <input type="number" onChange={handleChange(setAnnualGrowthRate)} value={annualGrowthRate} />
          </div>
        </div>
      </form>
      <hr/>
      <LineChart width={400} height={400} data={data} margin={{top: 5, right: 20, bottom: 40, left: 20}}>
        <Line type="monotone" dataKey="homeNetEquity" stroke="#8884d8" />
        <Line type="monotone" dataKey="investmentNetEquity" stroke="#82ca9d" />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Legend />
        <Tooltip />
      </LineChart>
      <table className="ui celled table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Investment total</th>
            <th>Investment total interest</th>
            <th>Investment savings</th>
            <th>House total value</th>
            <th>House equity</th>
            <th>House total interest paid</th>
            <th>House total holding costs (ex mortgage)</th>
          </tr>
        </thead>
        <tbody>
        { yearRange.map(yearIndex => {
          let yearData = data[yearIndex];
          if (yearData === undefined) {
            return(<tr></tr>)
          }
          return(
            <tr key={yearIndex}>
              <td>{yearData.name}</td>
              <td>${yearData.investmentNetEquity}k</td>
              <td>${Math.round(yearData.totalInvestmentInterest/1000)}k</td>
              <td>${Math.round(yearData.investmentSavings/1000)}k</td>
              <td>${yearData.housePrice}k</td>
              <td>${yearData.homeNetEquity}</td>
              <td>${Math.round(yearData.totalHousingInterestPaid/1000)}k</td>
              <td>${Math.round(yearData.totalHouseHoldingCosts/1000)}k</td>
            </tr>
            )
          })
        }
        </tbody>
      </table>
    </div>
  );
}

export default App;
