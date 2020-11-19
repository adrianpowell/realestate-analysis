import './App.css';
import React, {useEffect, useState} from 'react';
import {Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip} from 'recharts';

function App() {

  const [purchasePrice, setPurchasePrice] = useState(650000),
    [downPamentPercent, setDownPaymentPercent] = useState(20.0),
    [ammortizationPeriod, setAmmortizationPeriod] = useState(25),
    [mortgageRate, setMortgageRate] = useState(2.0),
    [annualPropertyTaxes, setAnnualPropertyTaxes] = useState(2000),
    [strataFees, setStrataFees] = useState(750),
    [annualMaintenance, setAnnualMaintenance] = useState(1000),
    [annualGrowthRate, setAnnualGrowthRate] = useState(0.0),
    
    // resale
    [realtorCommissionPercent, setRealtorCommissionPercent] = useState(6.0),
    
    // opportunity cost
    [investmentReturnPercentage, setInvestmentReturnPercentage] = useState(5.0),
    
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

    let tmpAnnualHouseExpense = (12 * strataFees) + annualMaintenance + annualMortgagePayment + annualPropertyTaxes;
    console.log("annual house expense: ", tmpAnnualHouseExpense, annualPropertyTaxes, (12 * strataFees),
        annualMaintenance, annualMortgagePayment);
    setAnnualHouseExpense(tmpAnnualHouseExpense);
    setAnnualRent(12 * comparableMonthlyRent);
    let tmpInvestmentDelta = tmpAnnualHouseExpense - (12*comparableMonthlyRent);
    setInvestmentDelta(tmpInvestmentDelta);

    //let newData = [];
    let i;
    setData(drawdownRate.map(drawdown => {
      let currHousePrice = purchasePrice * drawdown;
      let currInvestmentEquity = downpayment;
      let newData = [];
      for (i = 1; i < yearsToRun; i++) {
        currHousePrice = currHousePrice * (1.0 + (annualGrowthRate/100.0));

        // https://www.mtgprofessor.com/formulas.htm
        const remainingLoanBalance = mortgage
            * (Math.pow(1 + mortgageRateDec, ammortizationPeriod) - Math.pow(1 + mortgageRateDec, i))
            / (Math.pow(1 + mortgageRateDec, ammortizationPeriod) - 1);
        currInvestmentEquity = (currInvestmentEquity + tmpInvestmentDelta) * (1.0 + (investmentReturnPercentage/100.0));

        let currHouseEquity = (currHousePrice - remainingLoanBalance) -
            (currHousePrice * realtorCommissionPercent / 100.0);

        newData.push({
          name: i,
          investmentNetEquity: Math.round(currInvestmentEquity/1000),
          homeNetEquity: Math.round(currHouseEquity/1000)
        });
      }
      return newData;
    }));
  };

  useEffect(() => {
    regenerateCharts();
  }, [purchasePrice, ammortizationPeriod, mortgageRate, annualPropertyTaxes, strataFees, annualMaintenance,
  realtorCommissionPercent, investmentReturnPercentage, comparableMonthlyRent, yearsToRun, annualGrowthRate]);

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
        { [0, 1,2,3,4].map(index =>
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
            </Container>
          </Tab>
        )}
      </Tabs>
    </div>
  );
}

export default App;
