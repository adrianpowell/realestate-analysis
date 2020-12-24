import './App.css';
import React, {useEffect, useState} from 'react';
import {Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip} from 'recharts';

function App() {

  const tableStyle = {
    border: "1px solid black",
    borderCollapse: "collapse"
  }
  const tableHeaderCellStyle = {
    border: "1px solid black",
    padding: "3px"
  }
  const tableCellStyle = {
    border: "1px solid black"
  }

  const [purchasePrice, setPurchasePrice] = useState(650000),
    [downPamentPercent, setDownPaymentPercent] = useState(20.0),
    [ammortizationPeriod, setAmmortizationPeriod] = useState(20),
    [mortgageRate, setMortgageRate] = useState(3.0),
    [annualPropertyTaxes, setAnnualPropertyTaxes] = useState(2000),
    [strataFees, setStrataFees] = useState(400),
    [annualMaintenance, setAnnualMaintenance] = useState(1000),
    [annualGrowthRate, setAnnualGrowthRate] = useState(0.0),
    
    // resale
    [realtorCommissionPercent, setRealtorCommissionPercent] = useState(6.0),
    
    // opportunity cost
    [investmentReturnPercentage, setInvestmentReturnPercentage] = useState(6.5),
    
    // rental comparison
    [comparableMonthlyRent, setComparableMonthlyRent] = useState(2400),

    // analysis
    [yearsToRun, setYearsToRun] = useState(20),

    // results
    [data, setData] = useState([[]]),
    [annualHouseExpense, setAnnualHouseExpense] = useState(0.0),
    [annualRent, setAnnualRent] = useState(0.0),
    [investmentDelta, setInvestmentDelta] = useState(0.0);

  const drawdownRate = [1, 0.95, 0.9, 0.8, 0.7];
  const currencyFormatter = new Intl.NumberFormat('en-US',
      {style: 'currency', currency: 'USD'});
  const handleChange = setter => event => setter(event.target.value);

  function regenerateCharts() {
    console.log("regenerating chart data, annual taxes:", annualPropertyTaxes);
    const downpayment = purchasePrice * (downPamentPercent/100.0);

    const mortgage = (purchasePrice - downpayment);
    const mortgageRateDec = mortgageRate/100.0;
    // https://www.mtgprofessor.com/formulas.htm
    const annualMortgagePayment = mortgage * (mortgageRateDec * Math.pow(1 + mortgageRateDec, ammortizationPeriod)) /
        (Math.pow(1 + mortgageRateDec, ammortizationPeriod) - 1);

    let tmpAnnualHouseExpense = (12 * strataFees) + annualMaintenance + annualPropertyTaxes;
    console.log("annual house expense: ", tmpAnnualHouseExpense, annualPropertyTaxes, (12 * strataFees),
        annualMaintenance, annualMortgagePayment);
    setAnnualHouseExpense(tmpAnnualHouseExpense);
    setAnnualRent(12 * comparableMonthlyRent);
    let tmpInvestmentDelta = tmpAnnualHouseExpense + annualMortgagePayment - (12*comparableMonthlyRent);
    setInvestmentDelta(tmpInvestmentDelta);

    //let newData = [];
    let i;
    let newStateData = drawdownRate.map(drawdown => {
      let currHousePrice = purchasePrice * drawdown;
      let currRemainingMortgage = purchasePrice - downpayment;
      let currInvestmentEquity = downpayment;
      let newData = [];
      let totalInvestmentInterest = 0;
      let totalHouseHoldingCosts = 0;
      let totalHousingInterest = 0;
      let totalInvestmentSavings = 0;
      yearRange = [...Array(yearsToRun).keys()];
      for (i = 1; i < yearsToRun; i++) {
        currHousePrice = currHousePrice * (1.0 + (annualGrowthRate/100.0));

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
      return newData;
    });
    console.log('Updating data: ', newStateData);
    setData(newStateData);
  };

  useEffect(() => {
    regenerateCharts();
  }, [purchasePrice, ammortizationPeriod, mortgageRate, annualPropertyTaxes, strataFees, annualMaintenance,
  realtorCommissionPercent, investmentReturnPercentage, comparableMonthlyRent, yearsToRun, annualGrowthRate]);

  let yearRange = [...Array(yearsToRun).keys()];

  // let tableData = this.state.data.map((yearData) =>
  //   <tr>
  //     <td>{yearData.name}</td>
  //     <td>{yearData.investmentNetEquity}</td>
  //   </tr>
  // );
  return (
    <div className="App">
      <header>
        Compare home ownership with renting
      </header>
      <form>
        <Container>
          <Row>
            <Col>
              <label>
                <span>Purchase price</span>
                <input type="number" onChange={handleChange(setPurchasePrice)} value={purchasePrice} />
              </label>
            </Col>
            <Col>
              <label>
                <span>Down payment (%)</span>
                <input type="number" onChange={handleChange(setDownPaymentPercent)} value={downPamentPercent} />
              </label>
            </Col>
          </Row>
          <Row>
            <Col>
              <label>
                <span>Ammortization Period</span>
                <input type="number" onChange={handleChange(setAmmortizationPeriod)} value={ammortizationPeriod} />
              </label>
            </Col>
            <Col>
              <label>
                <span>Mortgate Rate (%)</span>
                <input type="number" onChange={handleChange(setMortgageRate)} value={mortgageRate} />
              </label>
            </Col>
          </Row>
          <Row>
            <Col>
              <label>
                <span>Annual Property Taxes</span>
                <input type="number" onChange={handleChange(setAnnualPropertyTaxes)} value={annualPropertyTaxes} />
              </label>
            </Col>
            <Col>
              <label>
                <span>Strata Fees (monthly)</span>
                <input type="number" onChange={handleChange(setStrataFees)} value={strataFees} />
              </label>
            </Col>
          </Row>
          <Row>
            <Col>
              <label>
                <span>Annual Maintenance</span>
                <input type="number" onChange={handleChange(setAnnualMaintenance)} value={annualMaintenance} />
              </label>
            </Col>
            <Col/>
          </Row>
        </Container>
        <Container>
          <h1>Opportunity Costs</h1>
          <Row>
            <Col>
              <label>
                <span>Investment return (%)</span>
                <input type="number" onChange={handleChange(setInvestmentReturnPercentage)} value={investmentReturnPercentage} />
              </label>
            </Col>
            <Col>
              <label>
                <span>Realtor Commission (% of sale)</span>
                <input type="number" onChange={handleChange(setRealtorCommissionPercent)} value={realtorCommissionPercent} />
              </label>
            </Col>
          </Row>
          <Row>
            <Col>
              <label>
                <span>Comparable monthly rent</span>
                <input type="number" onChange={handleChange(setComparableMonthlyRent)} value={comparableMonthlyRent} />
              </label>
            </Col>
            <Col/>
          </Row>
        </Container>
        <Container>
          <h1>Analysis details</h1>
          <Row>
            <Col>
              <label>
                <span>Years to run</span>
                <input type="number" onChange={handleChange(setYearsToRun)} value={yearsToRun} />
              </label>
            </Col>
            <Col>
              <label>
                <span>Annual growth rate above inflation (%)</span>
                <input type="number" onChange={handleChange(setAnnualGrowthRate)} value={annualGrowthRate} />
              </label>
            </Col>
          </Row>
        </Container>
      </form>
      <hr/>
      <Tabs>
        { [0, 1, 2, 3, 4].map(index => {
          console.log('data[index]', data[index]);
          if (data[index] === undefined || data[index].length === 0) {
            return (<div></div>)
          }
          return (
            <Tab eventKey={index} title={"Drawdown: " + Math.round((1-drawdownRate[index])*100) + "%"}>
            <Container>
            <Row>
              <Col>
                <LineChart width={400} height={400} data={data[index]} margin={{top: 5, right: 20, bottom: 40, left: 20}}>
                  <Line type="monotone" dataKey="homeNetEquity" stroke="#8884d8" />
                  <Line type="monotone" dataKey="investmentNetEquity" stroke="#82ca9d" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Legend />
                  <Tooltip />
                </LineChart>
              </Col>
              <Col>
                <Row>Annual house expense: {currencyFormatter.format(annualHouseExpense)}</Row>
                <Row>Annual rent: {currencyFormatter.format(annualRent)}</Row>
                <Row>Annual investment delta: {currencyFormatter.format(investmentDelta)}</Row>
              </Col>
            </Row>
            <Row>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderCellStyle}>Year</th>
                    <th style={tableHeaderCellStyle}>Investment total</th>
                    <th style={tableHeaderCellStyle}>Investment total interest</th>
                    <th style={tableHeaderCellStyle}>Investment savings</th>
                    <th style={tableHeaderCellStyle}>House total value</th>
                    <th style={tableHeaderCellStyle}>House equity</th>
                    <th style={tableHeaderCellStyle}>House total interest paid</th>
                    <th style={tableHeaderCellStyle}>House total holding costs (ex mortgage)</th>
                  </tr>
                </thead>
                <tbody>
                { yearRange.map(yearIndex => {
                  let yearData = data[index][yearIndex];
                  console.log('yearData', yearData);
                  if (yearData === undefined) {
                    return(<tr></tr>)
                  }
                  return(
                    <tr key={yearIndex}>
                      <td style={tableCellStyle}>{yearData.name}</td>
                      <td style={tableCellStyle}>${yearData.investmentNetEquity}k</td>
                      <td style={tableCellStyle}>${Math.round(yearData.totalInvestmentInterest/1000)}k</td>
                      <td style={tableCellStyle}>${Math.round(yearData.investmentSavings/1000)}k</td>
                      <td style={tableCellStyle}>${yearData.housePrice}k</td>
                      <td style={tableCellStyle}>${yearData.homeNetEquity}</td>
                      <td style={tableCellStyle}>${Math.round(yearData.totalHousingInterestPaid/1000)}k</td>
                      <td style={tableCellStyle}>${Math.round(yearData.totalHouseHoldingCosts/1000)}k</td>
                    </tr>
                    )
                  })
                }
                </tbody>
              </table>
            </Row>
            </Container>
          </Tab>
          )
        }
        )}
      </Tabs>
    </div>
  );
}

export default App;
