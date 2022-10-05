export class AdminCommonData {
  get stageList() {
      let data = {
          incomplete: 'Incomplete',
          pending: "Pending",
          approved: 'Approved',
          denied:'Denied',
          fundingcontract: 'Funding Contract',
          performingcontract: 'Performing Contract',
          canceled: 'canceled',
      }
      return data;
  }
}
export class FinanceMath {
  findPaymentAmount(loanAmount: number, arr :number, duration: number) :number {
      var monthly :any;
      var principal = (loanAmount) ? loanAmount : 0;
      var interest = Number((arr) ? arr : 0) / 100 / 12;
      var payments = Number((duration) ? duration : 0);
      var x = Math.pow(1 + interest, payments);
      monthly = (principal * x * interest) / (x - 1);
      if (! isNaN(monthly) && (monthly != Number.POSITIVE_INFINITY) && (monthly != Number.NEGATIVE_INFINITY)) {
          monthly = this.round(monthly);
      }
      return monthly;
  }
  round(x) :number {
      //let res = parseFloat(parseFloat(x).toFixed(2));
      let res = Math.round(x * 100) / 100;
      return res;
  }
  get durationMonths() :any {
      let data = [12, 24, 36, 42, 48, 49, 50, 60];
      return data;
  }

  RealAPR(loanAmount,monthlyPayment, term, apr, originFess) {
    var rate_per_period = apr / 100 /12;
    var interest = rate_per_period;
    var futureValue = 0;
    var dueEndOrBeginning = 0;
    var paymentsPerYear = term;
    var paymentAmount = -monthlyPayment.toFixed(2);
    var presentValue = loanAmount - originFess;
    var FINANCIAL_MAX_ITERATIONS = 128;//Bet accuracy with 128
    var FINANCIAL_PRECISION = 0.0000001;//1.0e-8

    var y, y0, y1, x0, x1 = 0, f = 0, i = 0;
    var rate = interest;
    if (Math.abs(rate) < FINANCIAL_PRECISION) {
        y = presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue;
    } else {
        f = Math.exp(paymentsPerYear * Math.log(1 + rate));
        y = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue;
    }
    y0 = presentValue + paymentAmount * paymentsPerYear + futureValue;
    y1 = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue;

    // find root by Newton secant method
    i = x0 = 0.0;
    x1 = rate;
    while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION) && (i < FINANCIAL_MAX_ITERATIONS)) {
        rate = (y1 * x0 - y0 * x1) / (y1 - y0);
        x0 = x1;
        x1 = rate;
        if (Math.abs(rate) < FINANCIAL_PRECISION) {
            y = presentValue * (1 + paymentsPerYear * rate) + paymentAmount * (1 + rate * dueEndOrBeginning) * paymentsPerYear + futureValue;
        } else {
            f = Math.exp(paymentsPerYear * Math.log(1 + rate));
            y = presentValue * f + paymentAmount * (1 / rate + dueEndOrBeginning) * (f - 1) + futureValue;
        }
        y0 = y1;
        y1 = y;
        ++i;
    }
    return (rate * 100 * 12);
}

  /*
  https://www.calculator.net/personal-loan-calculator.html?cloanamount=10000&cinterestrate=12&cinsurance=0&cyears=0&cmonths=24&cstartmonth=10&cstartyear=2021&corigpaid=deduct&corigisa=amount&corigamount=2000&printit=0&x=42&y=26#result
  fta = monthpayment*term+orge;
  RealAPR
  originationAmount must be less then loanAmount
  */
  findPaymentAmountWithOrigination(loanAmount: number, apr :number, duration: number, originationAmount: number) {
    let result:any = {}, realAPR, monthlyAmount, totalAmount;
    monthlyAmount = this.findPaymentAmount(loanAmount, apr, duration);
    totalAmount = monthlyAmount * duration;
    realAPR = this.RealAPR(loanAmount, monthlyAmount, duration, apr, originationAmount);
    //result
    result.monthlyAmount = this.round(monthlyAmount);
    result.totalAmount = this.round(totalAmount);
    result.realAPR = this.round(realAPR);
    result.totalInerst = this.round(totalAmount - loanAmount);
    result.totalInerstPlusFee = this.round(result.totalInerst + originationAmount);
    result.actuallyReceived = this.round(totalAmount - result.totalInerstPlusFee)
    return result;
  }
  createPaymentSchedule(amount, apr, term, createdAt, paymentfrequency = 'M'){
      let paymentScheduler = [];
      var principal = Number(amount);
      var interest = Number(apr) / 100 / 12;
      var payments = Number(term)
      var x = Math.pow(1 + interest, payments);
      var monthly:any = (principal * x * interest) / (x-1);
      if (!isNaN(monthly) && (monthly != Number.POSITIVE_INFINITY) && (monthly != Number.NEGATIVE_INFINITY)) {
        monthly = this.round(monthly);
        for (let i = 0; i < payments; i++) {
          let inter = this.round((principal * Number(apr)) / 1200)
          let pri = this.round(monthly - inter)
          let scheduleDate:any = ""
          if (paymentfrequency == 'M'){
            scheduleDate = new Date(new Date(createdAt).setMonth(new Date(createdAt).getMonth() + (i + 0)))
          }
          if (paymentfrequency == 'B') {
            scheduleDate = new Date(new Date(createdAt).setDate(new Date(createdAt).getDate() + (i * 14)))
          }
          if (paymentfrequency == 'S') {
            scheduleDate = new Date(new Date(createdAt).setDate(new Date(createdAt).getDate() + (i * 15)))
          }
          if (paymentfrequency == 'W') {
            scheduleDate = new Date(new Date(createdAt).setDate(new Date(createdAt).getDate() + (i * 7)))
          }
          paymentScheduler.push({
            //loan_id: this.loanId,
            unpaidPrincipal:principal,
            principal:pri,
            interest:inter,
            fees:0,
            amount:monthly,
            scheduleDate: scheduleDate
          })
          principal = this.round(principal- pri);
        }
        
      }
      return paymentScheduler;
  }
}

export class EquifaxCommonData {
get reportlist1() {
  let setreport1 ={
    "creditScore": 696,
    "equaifax": {
      "status": "completed",
      "consumers": {
        "equifaxUSConsumerCreditReport": [
          {
            "identifier": "Individual Report 1",
            "customerReferenceNumber": "JSON",
            "customerNumber": "325FZ01726",
            "consumerReferralCode": "394",
            "multipleReportIndicator": "F",
            "ecoaInquiryType": "I",
            "hitCode": {
              "code": "1",
              "description": "Hit"
            },
            "fileSinceDate": "07012004",
            "lastActivityDate": "10272021",
            "reportDate": "11292021",
            "subjectName": {
              "firstName": "MARGARITTA",
              "lastName": "FXZKKKBXG",
              "middleName": null
            },
            "subjectSocialNum": "666016313",
            "birthDate": "07151979",
            "nameMatchFlags": null,
            "doNotCombineIndicator": null,
            "addressDiscrepancyIndicator": "N",
            "fraudIDScanAlertCodes": [
              {
                "code": "S",
                "description": "IDENTITY SCAN DID NOT DETECT ANY ALERTS"
              }
            ],
            "fraudVictimIndicator": null,
            "addresses": [
              {
                "addressType": "current",
                "houseNumber": "760",
                "streetName": "NIXON",
                "streetType": "RD",
                "stateAbbreviation": "KY",
                "cityName": "SHARPSBURG",
                "zipCode": "40374",
                "sourceOfAddress": {
                  "code": "T",
                  "description": "AUT**"
                },
                "dateFirstReported": "11002013",
                "dateLastReported": "10272021",
                "addressLine1": "760 NIXON RD"
              },
              {
                "addressType": "former",
                "houseNumber": "2515",
                "streetName": "FOX",
                "streetType": "RD",
                "stateAbbreviation": "KY",
                "cityName": "JEFFERSONVILLE",
                "zipCode": "40337",
                "sourceOfAddress": {
                  "code": "T",
                  "description": "AUT**"
                },
                "dateFirstReported": "08002008",
                "dateLastReported": "07282008",
                "addressLine1": "2515 FOX RD"
              },
              {
                "addressType": "additional",
                "houseNumber": "554",
                "streetName": "MAGNOLIA",
                "streetType": "DR",
                "stateAbbreviation": "KY",
                "cityName": "MOUNT STERLING",
                "zipCode": "40353",
                "sourceOfAddress": {
                  "code": "T",
                  "description": "AUT**"
                },
                "dateFirstReported": "06002006",
                "dateLastReported": "05282006",
                "addressLine1": "554 MAGNOLIA DR"
              }
            ],
            "formerNames": [
              {
                "firstName": "MARGARITTA",
                "lastName": "FLWNLF"
              }
            ],
            "employments": [
              {
                "identifier": "current",
                "occupation": null,
                "employerName": null
              },
              {
                "identifier": "former",
                "occupation": null,
                "employerName": null
              }
            ],
            "bankruptcies": null,
            "collections": null,
            "alertContacts": null,
            "trades": [
              {
                "customerNumber": "458ON13374",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "14",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "JPMCB - CARD SERVICE",
                "dateReported": "09002021",
                "dateOpened": "06002020",
                "highCredit": 9914,
                "balance": 8952,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "O",
                  "description": "Open Account (entire balance is due upon demand)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "08002021",
                "scheduledPaymentAmount": 179,
                "termsDurationCode": null
              },
              {
                "customerNumber": "402BB48257",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "01",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "AMERICAN EXPRESS",
                "dateReported": "09002021",
                "dateOpened": "05002014",
                "highCredit": 5644,
                "balance": 1532,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "O",
                  "description": "Open Account (entire balance is due upon demand)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "08002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "655BB37694",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "17",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "CHASE HOME LENDING",
                "dateReported": "08002021",
                "dateOpened": "03002020",
                "highCredit": 15150,
                "balance": 14000,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "I",
                  "description": "Installment (fixed number of payments)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "EC",
                    "description": "HOME EQUITY"
                  }
                ],
                "rawNarrativeCodes": [
                  "EC"
                ],
                "accountTypeCode": {
                  "code": "6D",
                  "description": "Home Equity"
                },
                "lastPaymentDate": "08002021",
                "scheduledPaymentAmount": 201,
                "termsDurationCode": {
                  "code": "120M",
                  "description": "Months"
                }
              },
              {
                "customerNumber": "636BB02079",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "36",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "US BANK NA RETAIL LE",
                "dateReported": "08002021",
                "dateOpened": "08002018",
                "highCredit": 22410,
                "balance": 9248,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "I",
                  "description": "Installment (fixed number of payments)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AO",
                    "description": "AUTO"
                  },
                  {
                    "code": "BT",
                    "description": "LEASE"
                  }
                ],
                "rawNarrativeCodes": [
                  "AO",
                  "BT"
                ],
                "accountTypeCode": {
                  "code": "3A",
                  "description": "Auto Lease"
                },
                "lastPaymentDate": "08002021",
                "scheduledPaymentAmount": 355,
                "termsDurationCode": {
                  "code": "63M",
                  "description": "Months"
                }
              },
              {
                "customerNumber": "910UG02850",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "49",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "PEOPLES GAS",
                "dateReported": "06002020",
                "dateOpened": "02002015",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "O",
                  "description": "Open Account (entire balance is due upon demand)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "92",
                  "description": "Utility Company"
                },
                "lastPaymentDate": "06002016",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "162BB10365",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "13",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "WELLS FARGO CARD SER",
                "dateReported": "09002021",
                "dateOpened": "08002020",
                "highCredit": 8492,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "180FM00931",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "29",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "BANK OF AMERICA, N.A",
                "dateReported": "09002021",
                "dateOpened": "02002019",
                "highCredit": 287000,
                "balance": 310761,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "M",
                  "description": "Mortgage (fixed number of payments - usually for real estate)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "EF",
                    "description": "REAL ESTATE MORTGAGE"
                  },
                  {
                    "code": "HR",
                    "description": "CONVENTIONAL MORTGAGE"
                  }
                ],
                "rawNarrativeCodes": [
                  "EF",
                  "HR"
                ],
                "accountTypeCode": {
                  "code": "26",
                  "description": "Conventional Real Estate Mortgage"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 1639,
                "termsDurationCode": {
                  "code": "30Y",
                  "description": "Years"
                }
              },
              {
                "customerNumber": "458ON13374",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "14",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "JPMCB - CARD SERVICE",
                "dateReported": "09002021",
                "dateOpened": "07002020",
                "highCredit": 9914,
                "balance": 8952,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "O",
                  "description": "Open Account (entire balance is due upon demand)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 179,
                "termsDurationCode": null
              },
              {
                "customerNumber": "402BB48257",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "01",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "AMERICAN EXPRESS",
                "dateReported": "09002021",
                "dateOpened": "03002014",
                "highCredit": 4415,
                "balance": 4415,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "402BB48257",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "01",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "AMERICAN EXPRESS",
                "dateReported": "09002021",
                "dateOpened": "06002014",
                "highCredit": 5644,
                "balance": 1532,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "O",
                  "description": "Open Account (entire balance is due upon demand)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "801ON00119",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "29",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "BANK OF AMERICA",
                "dateReported": "09002021",
                "dateOpened": "04002019",
                "highCredit": 4636,
                "balance": 4,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 4,
                "termsDurationCode": null
              },
              {
                "customerNumber": "180FA01189",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "62",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "AMERICAN HONDA FINAN",
                "dateReported": "09002021",
                "dateOpened": "07002016",
                "highCredit": 19839,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "I",
                  "description": "Installment (fixed number of payments)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FA",
                    "description": "CLOSED OR PAID ACCOUNT/ZERO BALANCE"
                  },
                  {
                    "code": "AO",
                    "description": "AUTO"
                  }
                ],
                "rawNarrativeCodes": [
                  "FA",
                  "AO"
                ],
                "accountTypeCode": {
                  "code": "00",
                  "description": "Auto"
                },
                "lastPaymentDate": "08002019",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": {
                  "code": "60M",
                  "description": "Months"
                }
              },
              {
                "customerNumber": "906FA00232",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "24",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "TD AUTO FINANCE",
                "dateReported": "09002021",
                "dateOpened": "08002019",
                "highCredit": 15485,
                "balance": 573,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "I",
                  "description": "Installment (fixed number of payments)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AO",
                    "description": "AUTO"
                  },
                  {
                    "code": "BT",
                    "description": "LEASE"
                  }
                ],
                "rawNarrativeCodes": [
                  "AO",
                  "BT"
                ],
                "accountTypeCode": {
                  "code": "3A",
                  "description": "Auto Lease"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 573,
                "termsDurationCode": {
                  "code": "27M",
                  "description": "Months"
                }
              },
              {
                "customerNumber": "655BB37694",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "17",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "CHASE HOME LENDING",
                "dateReported": "09002021",
                "dateOpened": "04002020",
                "highCredit": 15150,
                "balance": 14000,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "I",
                  "description": "Installment (fixed number of payments)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "EC",
                    "description": "HOME EQUITY"
                  }
                ],
                "rawNarrativeCodes": [
                  "EC"
                ],
                "accountTypeCode": {
                  "code": "6D",
                  "description": "Home Equity"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 201,
                "termsDurationCode": {
                  "code": "120M",
                  "description": "Months"
                }
              },
              {
                "customerNumber": "404DC02316",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "34",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "SYNCB/MERVYN'S",
                "dateReported": "09002021",
                "dateOpened": "11002018",
                "highCredit": 175,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AV",
                    "description": "CHARGE"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "AV",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "636BB02079",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "36",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "US BANK NA RETAIL LE",
                "dateReported": "09002021",
                "dateOpened": "09002018",
                "highCredit": 22410,
                "balance": 9248,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "I",
                  "description": "Installment (fixed number of payments)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AO",
                    "description": "AUTO"
                  },
                  {
                    "code": "BT",
                    "description": "LEASE"
                  }
                ],
                "rawNarrativeCodes": [
                  "AO",
                  "BT"
                ],
                "accountTypeCode": {
                  "code": "3A",
                  "description": "Auto Lease"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 355,
                "termsDurationCode": {
                  "code": "63M",
                  "description": "Months"
                }
              },
              {
                "customerNumber": "636DC26977",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "20",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "MACY'S/DSNB",
                "dateReported": "09002021",
                "dateOpened": "01002013",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": null,
                "rawNarrativeCodes": null,
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": "12002013",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "636DC26977",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "18",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "MACY'S/DSNB",
                "dateReported": "09002021",
                "dateOpened": "09002015",
                "highCredit": 500,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "BV",
                    "description": "CONSUMER DISPUTE FOLLOWING RESOLUTION"
                  }
                ],
                "rawNarrativeCodes": [
                  "BV"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": "02002017",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "668DC04557",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "16",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "KOHLS/CHASE",
                "dateReported": "09002021",
                "dateOpened": "05002020",
                "highCredit": 389,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "404DC02316",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "38",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "SYNCB/MERVYN'S",
                "dateReported": "09002021",
                "dateOpened": "08002004",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AV",
                    "description": "CHARGE"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "AV",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": null,
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "613DC15759",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "33",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "TARGET NATIONAL BANK",
                "dateReported": "09002021",
                "dateOpened": "04002017",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "DA",
                    "description": "ACCOUNT CLOSED BY CONSUMER"
                  }
                ],
                "rawNarrativeCodes": [
                  "DA"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": null,
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "404CG01431",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "07",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "SYNCB/GAP",
                "dateReported": "09002021",
                "dateOpened": "02002021",
                "highCredit": 106,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AV",
                    "description": "CHARGE"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "AV",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "645DC09286",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "90",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "SEARS/CBNA",
                "dateReported": "09002021",
                "dateOpened": "12002013",
                "highCredit": 1895,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AV",
                    "description": "CHARGE"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "AV",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": "01002018",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "850BB01498",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "29",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "CAPITAL ONE BANK USA",
                "dateReported": "09002021",
                "dateOpened": "04002019",
                "highCredit": 1438,
                "balance": 977,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FE",
                    "description": "CREDIT CARD"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "FE",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "09002021",
                "scheduledPaymentAmount": 29,
                "termsDurationCode": null
              },
              {
                "customerNumber": "155BB03747",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "92",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "DISCOVER BANK",
                "dateReported": "07002021",
                "dateOpened": "11002013",
                "highCredit": 3888,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "06002021",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "458ON13962",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "75",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "JPMCB - CARD SERVICE",
                "dateReported": "10002020",
                "dateOpened": "07002014",
                "highCredit": 6231,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "05002020",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "163BB30271",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "33",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "WASHMUTUAL/PROVIDIAN",
                "dateReported": "10002020",
                "dateOpened": "12002017",
                "highCredit": 3643,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "10002020",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "906BB00040",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "82",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "CITICARDS CBNA",
                "dateReported": "09002020",
                "dateOpened": "11002013",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "CW",
                    "description": "ACCOUNT CLOSED BY CREDIT GRANTOR"
                  }
                ],
                "rawNarrativeCodes": [
                  "CW"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": null,
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "910UG02850",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "49",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "PEOPLES GAS",
                "dateReported": "07002020",
                "dateOpened": "03002015",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "O",
                  "description": "Open Account (entire balance is due upon demand)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "92",
                  "description": "Utility Company"
                },
                "lastPaymentDate": "07002016",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "190HF00511",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "27",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "RC WILLEY",
                "dateReported": "02002020",
                "dateOpened": "08002017",
                "highCredit": 2200,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "AV",
                    "description": "CHARGE"
                  },
                  {
                    "code": "AZ",
                    "description": "AMOUNT IN H/C COLUMN IS CREDIT LIMIT"
                  }
                ],
                "rawNarrativeCodes": [
                  "AV",
                  "AZ"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": "02002020",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "181FC00014",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "77",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "NORTH ISLAND FINANCI",
                "dateReported": "06002019",
                "dateOpened": "02002012",
                "highCredit": 2500,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "15",
                  "description": "Line of Credit"
                },
                "lastPaymentDate": "03002019",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "416BB01228",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "90",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "BANK OF AMERICA",
                "dateReported": "05002019",
                "dateOpened": "11002011",
                "highCredit": 2506,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  },
                  {
                    "code": "CW",
                    "description": "ACCOUNT CLOSED BY CREDIT GRANTOR"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR",
                  "CW"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "01002019",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "180FM00931",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": null,
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "BANK OF AMERICA, N.A",
                "dateReported": "02002019",
                "dateOpened": "06002018",
                "highCredit": 221530,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "M",
                  "description": "Mortgage (fixed number of payments - usually for real estate)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FA",
                    "description": "CLOSED OR PAID ACCOUNT/ZERO BALANCE"
                  },
                  {
                    "code": "EF",
                    "description": "REAL ESTATE MORTGAGE"
                  }
                ],
                "rawNarrativeCodes": [
                  "FA",
                  "EF"
                ],
                "accountTypeCode": {
                  "code": "26",
                  "description": "Conventional Real Estate Mortgage"
                },
                "lastPaymentDate": null,
                "scheduledPaymentAmount": 0,
                "termsDurationCode": {
                  "code": "30Y",
                  "description": "Years"
                }
              },
              {
                "customerNumber": "168BB01571",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "07",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "FLAGSTAR BANK",
                "dateReported": "02002019",
                "dateOpened": "06002018",
                "highCredit": 55380,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "FA",
                    "description": "CLOSED OR PAID ACCOUNT/ZERO BALANCE"
                  },
                  {
                    "code": "EC",
                    "description": "HOME EQUITY"
                  }
                ],
                "rawNarrativeCodes": [
                  "FA",
                  "EC"
                ],
                "accountTypeCode": {
                  "code": "89",
                  "description": "Home Equity Line of Credit"
                },
                "lastPaymentDate": "02002019",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "850BB01498",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "38",
                "accountDesignator": {
                  "code": "J",
                  "description": "Joint Account"
                },
                "accountNumber": null,
                "customerName": "CAPITAL ONE BANK USA",
                "dateReported": "02002018",
                "dateOpened": "12002014",
                "highCredit": 561,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "18",
                  "description": "Credit Card"
                },
                "lastPaymentDate": "11002017",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "667CG32413",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "21",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "COMENITYBANK/JCREW",
                "dateReported": "11002017",
                "dateOpened": "02002016",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": null,
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              },
              {
                "customerNumber": "667CG30022",
                "automatedUpdateIndicator": "*",
                "monthsReviewed": "71",
                "accountDesignator": {
                  "code": "I",
                  "description": "Individual Account"
                },
                "accountNumber": null,
                "customerName": "COMENITYBANK/VICTORI",
                "dateReported": "09002017",
                "dateOpened": "10002011",
                "highCredit": 0,
                "balance": 0,
                "pastDueAmount": 0,
                "portfolioTypeCode": {
                  "code": "R",
                  "description": "Revolving (payment amounts based on the outstanding balance)"
                },
                "rate": {
                  "code": "1",
                  "description": "Pays account as agreed"
                },
                "narrativeCodes": [
                  {
                    "code": "IR",
                    "description": "ACCOUNT CLOSED AT CONSUMER'S REQUEST"
                  }
                ],
                "rawNarrativeCodes": [
                  "IR"
                ],
                "accountTypeCode": {
                  "code": "07",
                  "description": "Charge Account"
                },
                "lastPaymentDate": "08002017",
                "scheduledPaymentAmount": 0,
                "termsDurationCode": null
              }
            ],
            "inquiries": [
              {
                "type": "inquiry",
                "industryCode": "BB",
                "inquiryDate": "10272021",
                "customerNumber": "999BB20271",
                "customerName": "HUNTINGTON BANK"
              },
              {
                "type": "inquiry",
                "industryCode": "FA",
                "inquiryDate": "09282021",
                "customerNumber": "484FA00732",
                "customerName": "CAPITAL ONE"
              },
              {
                "type": "inquiry",
                "industryCode": "FP",
                "inquiryDate": "09192021",
                "customerNumber": "999FP02420",
                "customerName": "ONEMAIN FINANCIAL"
              },
              {
                "type": "inquiry",
                "industryCode": "BB",
                "inquiryDate": "09022021",
                "customerNumber": "372BB02367",
                "customerName": "THE HUNTINGTON NATIO"
              },
              {
                "type": "inquiry",
                "industryCode": "BB",
                "inquiryDate": "08282021",
                "customerNumber": "372BB02367",
                "customerName": "THE HUNTINGTON NATIO"
              },
              {
                "type": "inquiry",
                "industryCode": "FA",
                "inquiryDate": "02112021",
                "customerNumber": "484FA00732",
                "customerName": "CAPITAL ONE"
              },
              {
                "type": "inquiry",
                "industryCode": "FF",
                "inquiryDate": "01112021",
                "customerNumber": "404FF09065",
                "customerName": "SYNCB/GAP"
              },
              {
                "type": "inquiry",
                "industryCode": "FF",
                "inquiryDate": "09192020",
                "customerNumber": "404FF09065",
                "customerName": "SYNCB/GAP"
              },
              {
                "type": "inquiry",
                "industryCode": "UZ",
                "inquiryDate": "08192020",
                "customerNumber": "910UZ53141",
                "customerName": "COX COMM - LAS VEGAS"
              },
              {
                "type": "inquiry",
                "industryCode": "UZ",
                "inquiryDate": "08022020",
                "customerNumber": "910UZ53141",
                "customerName": "COX COMM - LAS VEGAS"
              },
              {
                "type": "inquiry",
                "industryCode": "ON",
                "inquiryDate": "07022020",
                "customerNumber": "164ON00069",
                "customerName": "WF CRD SVC"
              }
            ],
            "models": [
              {
                "type": "FICO",
                "ficoScoreIndicatorCode": {
                  "code": "J",
                  "description": "FICO Score 5 based on Equifax Data (NF)"
                },
                "score": "696",
                "reasons": [
                  {
                    "code": "00039"
                  },
                  {
                    "code": "00018"
                  },
                  {
                    "code": "00005"
                  },
                  {
                    "code": "00010"
                  }
                ],
                "inquiryKeyFactor": null,
                "riskBasedPricingOrModel": null
              }
            ],
            "identification": {
              "subjectSocialNum": "666016313",
              "socialNumConfirmed": null,
              "socialMatchFlags": null,
              "inquirySocialNum": "666016313",
              "inquirySocialNumStateIssued": "GA",
              "inquirySocialNumYearIssued": "P 51",
              "socialNumMatch": null
            },
            "attributes": null,
            "onlineGeoCode": null,
            "ofacAlerts": null,
            "consumerReferralLocation": {
              "bureauCode": "394",
              "bureauName": "EQUIFAX INFORMATION SERVICES LLC",
              "address": {
                "cityName": "ATLANTA",
                "stateAbbreviation": "GA",
                "zipCode": "303740241"
              },
              "telephoneNumber": {
                "telephoneNumber": "8006851111"
              }
            },
            "alternateDataSources": null
          }
        ]
      },
      "links": null
    },
    "success": true,
    "loanOffersResponse": {
      "status": "Declined",
      "rulesCount": 11,
      "ruleResults": [
        {
          "rules": "Months of Credit History <  12",
          "ruleMessage": "Months of Credit History : 208",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Active Trade Lines <  1",
          "ruleMessage": "Active Trade Lines : 0",
          "ruleStatus": "Rejected"
        },
        {
          "rules": "Revolving Trade Lines <  1",
          "ruleMessage": "Revolving Trade Lines : 0",
          "ruleStatus": "Rejected"
        },
        {
          "rules": "Foreclosures in the Last 24 Months >  12",
          "ruleMessage": "Foreclosures in the Last 24 Months : 0",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Inquiries in the Last 6 Months >  0",
          "ruleMessage": "Inquiries in the Last 6 Months : 0",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Bankruptcies in the Last 24 Months >  0",
          "ruleMessage": "Bankruptcies in the Last 24 Months : 0",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Public Records in the Last 24 Months >  5",
          "ruleMessage": "Public Records in the Last 24 Months : 0",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Trades with 60+ DPD in the Last 24 Months >  4",
          "ruleMessage": "Trades with 60+ DPD in the Last 24 Months : 0",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Trades with 60+ DPD in the Last 6 Months >  2",
          "ruleMessage": "Trades with 60+ DPD in the Last 6 Months : 0",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Utilization of Revolving Trades >  0",
          "ruleMessage": "Utilization of Revolving Trades : 0",
          "ruleStatus": "Approved"
        },
        {
          "rules": "Credit Score <  1",
          "ruleMessage": "Credit Score : 696",
          "ruleStatus": "Approved"
        }
      ],
      "offers": [
        {
          "apr": 119.99,
          "finalRequestedLoanAmount": 2000,
          "financedAmount": 2000,
          "fullNumberAmount": 0,
          "interestFeeAmount": 0,
          "interestRate": 0,
          "loanAmount": 2000,
          "loanGrade": "C",
          "offerType": "Loan Amount",
          "offerValue": "1500",
          "maxCreditScore": 1000,
          "minCreditSCore": 665,
          "maxDTI": 40,
          "minDTI": 30,
          "maximumAmount": 2000,
          "minimumAmount": 1200,
          "totalLoanAmount": 0
        },
        {
          "apr": 119.99,
          "finalRequestedLoanAmount": 2000,
          "financedAmount": 2000,
          "fullNumberAmount": 0,
          "interestFeeAmount": 0,
          "interestRate": 0,
          "loanAmount": 2000,
          "loanGrade": "C",
          "offerType": "Loan Amount",
          "offerValue": "4000",
          "maxCreditScore": 1000,
          "minCreditSCore": 665,
          "maxDTI": 40,
          "minDTI": 30,
          "maximumAmount": 2000,
          "minimumAmount": 1200,
          "totalLoanAmount": 0
        },
        {
          "apr": 119.99,
          "finalRequestedLoanAmount": 2000,
          "financedAmount": 2000,
          "fullNumberAmount": 0,
          "interestFeeAmount": 0,
          "interestRate": 0,
          "loanAmount": 2000,
          "loanGrade": "C",
          "offerType": "Loan Amount",
          "offerValue": "4000",
          "maxCreditScore": 1000,
          "minCreditSCore": 665,
          "maxDTI": 40,
          "minDTI": 30,
          "maximumAmount": 2000,
          "minimumAmount": 1200,
          "totalLoanAmount": 0
        }
      ],
      "terms": [
        {
          "termDuration": "10",
          "termDescription": "Term1",
          "gradeDescription": "C",
          "monthlyPayment": 45.6,
          "maxMonthlyPayment": 43.2
        }
      ],
      "approvedUpTo": 2000,
      "requestedloanamount": 2000,
      "message": "Offers retrieved."
    }
  }
  
  return setreport1;
}
get reportlist() {
    let setreport2 = {
      "EfxTransmit": {
        "ProductCode": [
          "Commercial - Hit",
          "BCIR 2.0 Plus",
          "CFN Commercial Insight Origination Score"
        ],
        "CustomerSecurityInfo": {
          "ProductCode": [
            "Commercial Insight Delinquency Score",
            "BCIR 2.0 Plus"
          ]
        },
        "StandardRequest": {
          "Folder": {
            "FolderActivity": {
              "FileActivityDate": "12/21/2021",
              "FileCreationDate": "12/21/2021"
            },
            "IdTrait": {
              "AddressTrait": {
                "TraitActivity": {
                  "InformationSource": {
                    "IndustryCode": "Industry Code Masked"
                  },
                  "ReportedDate": "12/21/2021",
                  "DateCreated": "12/21/2021",
                  "PrimaryIndicator": "PRIMARY"
                },
                "AddressLine1": "957445 IGNATOV MD PA RD",
                "City": "MECHANICSVILLE",
                "State": "VA",
                "Country": "USA",
                "PostalCode": 23111
              },
              "CompanyNameTrait": {
                "TraitActivity": {
                  "InformationSource": {
                    "IndustryCode": "Industry Code Masked"
                  },
                  "ReportedDate": "12/21/2021",
                  "DateCreated": "12/21/2021",
                  "PrimaryIndicator": "PRIMARY"
                },
                "BusinessName": "FODERA"
              }
            }
          }
        },
        "CommercialCreditReport": {
          "Header": {
            "CustomerNumber": "999FZ06924",
            "DateOfRequest": "12/21/2021"
          },
          "Folder": {
            "EfxId": 570551439,
            "FolderActivity": {
              "FileActivityDate": "10/14/2021",
              "FileCreationDate": "06/13/2002"
            },
            "Alert": {
              "AlertCode": 840,
              "AlertDescription": "Additional information was limited to inquired and headquarters site aliases/akas and corresponding ID information."
            },
            "ReportAttributes": {
              "RecentSinceDate": "09/01/2021",
              "AsOfDate3Mo": "09/01/2021",
              "AsOfDate24Mo": "12/01/2019",
              "AsOfDateToday": "12/21/2021",
              "FinancialSummary": {
                "SummaryAttributes": {
                  "NumberOfActiveTrades": 3,
                  "CurrentCreditLimitTotals": 318000,
                  "HiCreditOrOrigLoanAmtTotals": 323640,
                  "BalanceTotals": 6268,
                  "PastDueAmtTotals": 0,
                  "NewChargeOffAmt": 0,
                  "NewDelinquencies": 0,
                  "NewAccounts": 0,
                  "NewInquiries": 0,
                  "NewUpdates": 2,
                  "NumberOfAccounts": 2,
                  "NumberOfChargeOffs": 0,
                  "CreditActiveSince": "12/19/1991",
                  "TotalPastDue": 0,
                  "MostSevereStatus": "Current",
                  "HighestCredit": 18000,
                  "TotalExposure": 18000,
                  "AverageOpenBalance": 3134,
                  "MostSevereStatus24Months": "Current",
                  "TotBal": 6268,
                  "AtRiskBal": 0,
                  "NewChargeOffAccts": 0,
                  "AcctOpen": 2,
                  "NewAcctClosed": 0,
                  "NonChargeOffDel": 0,
                  "NewMostSevStatus": "Current",
                  "NewHiCreditExt": 18000,
                  "NumClosed": 0,
                  "BalDue": 6268,
                  "ChargeOffAmt": 0,
                  "NewNonChargeOffDel": 0
                },
                "CreditUtilization": {
                  "AvailableCredit": 11732,
                  "PercentAvailableCredit": 65.2,
                  "PercentBalance": 34.8,
                  "TotalBalance": 6268,
                  "TotalCreditLimit": 18000
                }
              },
              "NonFinancialSummary": {
                "SummaryAttributes": {
                  "NumberOfActiveTrades": 2,
                  "BalanceTotals": 8024,
                  "PastDueAmtTotals": 0,
                  "NewChargeOffAmt": 0,
                  "NewDelinquencies": 0,
                  "NewAccounts": 0,
                  "NewInquiries": 0,
                  "NewUpdates": 1,
                  "NumberOfAccounts": 1,
                  "NumberOfChargeOffs": 0,
                  "TotalPastDue": 0,
                  "MostSevereStatus": "Current",
                  "HighestCredit": 24,
                  "TotalExposure": 24,
                  "MostSevereStatus24Months": "Current",
                  "TotBal": 24,
                  "AtRiskBal": 0,
                  "NewChargeOffAccts": 0,
                  "AcctOpen": 1,
                  "NewAcctClosed": 0,
                  "NonChargeOffDel": 0,
                  "NewMostSevStatus": "Current",
                  "NewHiCreditExt": 24,
                  "NumClosed": 0,
                  "BalDue": 24,
                  "ChargeOffAmt": 0,
                  "NewNonChargeOffDel": 0
                },
                "RecentDBT": 0,
                "AvgDBT": [
                  {
                    "dateDBT": "12/01/2020"
                  },
                  {
                    "dateDBT": "01/01/2021",
                    "DBT": 0
                  },
                  {
                    "dateDBT": "02/01/2021",
                    "DBT": 0
                  },
                  {
                    "dateDBT": "03/01/2021",
                    "DBT": 0
                  },
                  {
                    "dateDBT": "04/01/2021"
                  },
                  {
                    "dateDBT": "05/01/2021"
                  },
                  {
                    "dateDBT": "06/01/2021",
                    "DBT": 0
                  },
                  {
                    "dateDBT": "07/01/2021"
                  },
                  {
                    "dateDBT": "08/01/2021",
                    "DBT": 0
                  },
                  {
                    "dateDBT": "09/01/2021"
                  },
                  {
                    "dateDBT": "10/01/2021",
                    "DBT": 0
                  },
                  {
                    "dateDBT": "11/01/2021"
                  }
                ],
                "IndustryDBT": {
                  "Industry": 17,
                  "DataPoint": [
                    {
                      "Date": "02/01/2014",
                      "Value": 6
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    },
                    {
                      "Date": "02/01/2014",
                      "Value": 6
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    },
                    {
                      "Date": "02/01/2014",
                      "Value": 6
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    },
                    {
                      "Date": "02/01/2014",
                      "Value": 6
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    },
                    {
                      "Date": "02/01/2014",
                      "Value": 6
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    },
                    {
                      "Date": "02/01/2014",
                      "Value": 6
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    },
                    {
                      "Date": "02/01/2014",
                      "Value": 6
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    }
                  ]
                },
                "CountryDBT": {
                  "Country": "USA",
                  "DataPoint": [
                    {
                      "Date": "02/01/2014",
                      "Value": 8
                    },
                    {
                      "Date": "03/01/2014",
                      "Value": 8
                    },
                    {
                      "Date": "04/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "05/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "06/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "07/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "08/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "09/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "10/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "11/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "12/01/2014",
                      "Value": 7
                    },
                    {
                      "Date": "01/01/2015",
                      "Value": 7
                    }
                  ]
                }
              },
              "PaymentIndexInfo": {
                "PaymentIndexBusiness": 100,
                "PaymentIndexIndustry": 86
              },
              "OpenFiByAcctType": {
                "TimePeriod": 24,
                "OpenSummaryAttributes": {
                  "SingleHiCreditExtOrBalOwed": 18000,
                  "SingleMostSevereStatus": "Current",
                  "NumOpenAccts": 2,
                  "SingleHighestTotalPastDue": 0,
                  "SumOfBalances": 6268,
                  "SumOfAtRiskBalances": 0,
                  "SumOfPastDue": 0,
                  "AgingDollarsSlow30": 0,
                  "AgingDollarsSlow60": 0,
                  "AgingDollarsSlow90": 0,
                  "AgingDollarsSlow120": 0,
                  "AgingDollarsSlow120Plus": 0,
                  "AcctType": "Commercial card"
                },
                "OpenSummaryAttributesTotals": {
                  "NumOpenAccts": 2,
                  "SumOfBalances": 6268,
                  "SumOfAtRiskBalances": 0,
                  "SumOfPastDue": 0,
                  "AgingDollarsSlow30": 0,
                  "AgingDollarsSlow60": 0,
                  "AgingDollarsSlow90": 0,
                  "AgingDollarsSlow120": 0,
                  "AgingDollarsSlow120Plus": 0
                }
              },
              "OpenNonFiByIndGroup": {
                "TimePeriod": 24,
                "OpenSummaryAttributes": {
                  "SingleHiCreditExtOrBalOwed": 24,
                  "SingleMostSevereStatus": "Current",
                  "IndustryGroup": "Communications",
                  "NumOpenAccts": 1,
                  "SingleHighestTotalPastDue": 0,
                  "SumOfBalances": 24,
                  "SumOfPastDue": 0,
                  "AgingDollarsSlow30": 0,
                  "AgingDollarsSlow60": 0,
                  "AgingDollarsSlow90": 0
                },
                "OpenSummaryAttributesTotals": {
                  "NumOpenAccts": 1,
                  "SumOfBalances": 24,
                  "SumOfPastDue": 0,
                  "AgingDollarsSlow30": 0,
                  "AgingDollarsSlow60": 0,
                  "AgingDollarsSlow90": 0
                }
              }
            },
            "DecisionTools": {
              "ScoreData": {
                "ReasonCode": [
                  "Number of Satisfactory Financial Payment Experiences",
                  "No Qualified Trades Present"
                ]
              }
            },
            "IdTrait": {
              "AddressTrait": [
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "01/19/2019",
                    "DateCreated": "02/11/2019",
                    "PrimaryIndicator": "PRIMARY",
                    "MatchQuality": {
                      "MatchQualityAttribute": [
                        {
                          "AttributeValue": "MECHANICSVILLE,VA,23111",
                          "MatchValue": 4
                        },
                        {
                          "AttributeValue": "640132 3101 RD",
                          "MatchValue": 1
                        }
                      ]
                    }
                  },
                  "AddressLine1": "640132 3101 RD",
                  "City": "MECHANICSVILLE",
                  "State": "VA",
                  "Country": "UNITED STATES OF AMERICA",
                  "PostalCode": "23111-6428",
                  "AddressType": "BUSINESS_PREMISE",
                  "StandardizationStatus": "Standardized",
                  "TelephoneTrait": {
                    "TelephoneNumber": 1111124824
                  },
                  "CountryCode": 840
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "10/01/2021",
                    "DateCreated": "06/13/2002",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "AddressLine1": "C3202 ROYAL GLEN DDR RD",
                  "City": "MECHANICSVLLE",
                  "State": "VA",
                  "Country": "USA",
                  "PostalCode": 23111,
                  "StandardizationStatus": "Standardized",
                  "TradeLinkInfo": [
                    {
                      "AccountReference": 1000009866,
                      "ReportedDate": "10/01/2021"
                    },
                    {
                      "AccountReference": 1000009867,
                      "ReportedDate": "10/01/2021"
                    },
                    {
                      "AccountReference": 1000009849,
                      "ReportedDate": "10/01/2021"
                    }
                  ]
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "01/28/2020",
                    "DateCreated": "03/18/2009",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "AddressLine1": "957445 IGNATOV MD PA RD",
                  "City": "MECHANICSVILLE",
                  "State": "VA",
                  "Country": "USA",
                  "PostalCode": "23111-6428",
                  "AddressType": "BUSINESS_PREMISE",
                  "StandardizationStatus": "Standardized"
                }
              ],
              "IdNumberTrait": [
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "04/16/2019",
                    "DateCreated": "04/21/2005",
                    "PrimaryIndicator": "PRIMARY"
                  },
                  "IdNumber": "XXXXX5838",
                  "IdNumberIndicator": "Tax ID",
                  "TradeLinkInfo": [
                    {
                      "AccountReference": 1000009867,
                      "ReportedDate": "04/16/2019"
                    },
                    {
                      "AccountReference": 1000009866,
                      "ReportedDate": "05/02/2018"
                    }
                  ]
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "06/04/2018",
                    "DateCreated": "06/13/2002",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "IdNumber": "XXXXX5840",
                  "IdNumberIndicator": "Tax ID"
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "04/03/2020",
                    "DateCreated": "03/06/2018",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "IdNumber": "XXXXX5841",
                  "IdNumberIndicator": "Tax ID",
                  "TradeLinkInfo": {
                    "AccountReference": 1000009866,
                    "ReportedDate": "04/03/2020"
                  }
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "04/28/2020",
                    "DateCreated": "07/03/2020",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "IdNumber": "XXXXX3456",
                  "TradeLinkInfo": {
                    "AccountReference": 1000009849,
                    "ReportedDate": "04/28/2020"
                  }
                }
              ],
              "InternetTrait": [
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "01/19/2019",
                    "DateCreated": "02/11/2019",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "EmailAddress": "FODERA@gmail.com"
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "04/04/2020",
                    "DateCreated": "02/18/2019",
                    "PrimaryIndicator": "PRIMARY"
                  },
                  "URLName": "http://FODERA.com",
                  "EmailAddress": "FODERA@gmail.com"
                }
              ],
              "CompanyNameTrait": [
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "01/19/2019",
                    "DateCreated": "02/11/2019",
                    "PrimaryIndicator": "PRIMARY",
                    "MatchQuality": {
                      "MatchValue": 4,
                      "MatchQualityAttribute": {
                        "AttributeValue": "FODERA"
                      }
                    }
                  },
                  "BusinessName": "FODERA",
                  "LegalBusinessName": "LGLFODERA"
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "06/04/2018",
                    "DateCreated": "09/30/2016",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "BusinessName": "FODERAb"
                },
                {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "10/01/2021",
                    "DateCreated": "06/13/2002",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "BusinessName": "FODERAa",
                  "LegalBusinessName": "LGLFODERA",
                  "SICCode": 1731,
                  "SICDescription": "Electrical Work",
                  "NAICSCode": 238210,
                  "NAICSDescription": "Electrical Contractors",
                  "TradeLinkInfo": [
                    {
                      "AccountReference": 1000009866,
                      "ReportedDate": "10/01/2021"
                    },
                    {
                      "AccountReference": 1000009867,
                      "ReportedDate": "10/01/2021"
                    }
                  ]
                }
              ]
            },
            "PrincipalTrait": [
              {
                "TraitActivity": {
                  "InformationSource": "",
                  "ReportedDate": "05/31/2020",
                  "DateCreated": "04/21/2005",
                  "PrimaryIndicator": "PRIMARY"
                },
                "Folder": {
                  "FolderActivity": {
                    "FileActivityDate": "06/17/2020",
                    "FileCreationDate": "04/21/2005"
                  },
                  "IdTrait": {
                    "PersonNameTrait": [
                      {
                        "TraitActivity": {
                          "InformationSource": "",
                          "ReportedDate": "05/31/2020",
                          "DateCreated": "01/20/2006",
                          "PrimaryIndicator": "PRIMARY"
                        },
                        "FirstName": "JIESHI",
                        "LastName": "LADERA"
                      },
                      {
                        "TraitActivity": {
                          "InformationSource": "",
                          "ReportedDate": "03/31/2020",
                          "DateCreated": "04/21/2005",
                          "PrimaryIndicator": "ADDITIONAL"
                        },
                        "FirstName": "JIESHI",
                        "MiddleName": "F",
                        "LastName": "LADERA"
                      }
                    ],
                    "AddressTrait": {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "05/31/2020",
                        "DateCreated": "04/21/2005",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "AddressLine1": "957445 IGNATOV MD PA RD",
                      "City": "MECHANICSVLLE",
                      "State": "VA",
                      "Country": "USA",
                      "PostalCode": "23111-6428",
                      "StandardizationStatus": "Standardized",
                      "TelephoneTrait": {
                        "TelephoneNumber": 1111124823
                      }
                    },
                    "IdNumberTrait": {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "05/31/2020",
                        "DateCreated": "10/20/2005",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "IdNumber": "XXXXXXXX8",
                      "IdNumberIndicator": "SSN"
                    }
                  }
                },
                "PrincipalInfoSource": [
                  {
                    "IsGuarantor": "N",
                    "AccountReference": 1000009866,
                    "PreviousAccountReference": 1000009866
                  },
                  {
                    "IsGuarantor": "Y",
                    "AccountReference": 1000009867
                  }
                ]
              },
              {
                "TraitActivity": {
                  "InformationSource": "",
                  "ReportedDate": "04/03/2020",
                  "DateCreated": "03/06/2018",
                  "PrimaryIndicator": "ADDITIONAL"
                },
                "Folder": {
                  "FolderActivity": {
                    "FileActivityDate": "04/06/2020",
                    "FileCreationDate": "03/06/2018"
                  },
                  "IdTrait": {
                    "PersonNameTrait": {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "04/03/2020",
                        "DateCreated": "03/06/2018",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "FirstName": "JIESHI",
                      "MiddleName": "F",
                      "LastName": "LADERA"
                    },
                    "AddressTrait": {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "04/03/2020",
                        "DateCreated": "03/06/2018",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "AddressLine1": "957445 IGNATOV MD PA RD",
                      "City": "MECHANICSVLLE",
                      "State": "VA",
                      "Country": "USA",
                      "PostalCode": "23111-6428",
                      "StandardizationStatus": "Standardized"
                    },
                    "IdNumberTrait": {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "04/03/2020",
                        "DateCreated": "03/06/2018",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "IdNumber": "XXXXXXXX1",
                      "IdNumberIndicator": "Tax ID"
                    }
                  }
                },
                "PrincipalInfoSource": {
                  "IsGuarantor": "N",
                  "AccountReference": 1000009866
                }
              }
            ],
            "FirmographicsTrait": {
              "CurrentFirm": {
                "TraitActivity": {
                  "InformationSource": "",
                  "ReportedDate": "04/04/2020",
                  "DateCreated": "05/21/2020",
                  "PrimaryIndicator": "PRIMARY"
                },
                "SICCode": 1731,
                "NAICSCode": 238210,
                "LiabilityIndicator": "Corporation",
                "YearStarted": 1991,
                "NumberOfEmployees": "2 to 4",
                "AnnualSalesRange": "$1 - $249,999",
                "SICDescription": "Electrical Work",
                "NAICSDescription": "Electrical Contractors",
                "YearsInBusiness": 30
              }
            },
            "TradeInfo": [
              {
                "CurrentTrade": {
                  "FiAcctInd": "Y",
                  "NonFiAcctInd": "N",
                  "ClosedInd": "N",
                  "OpenInd": "Y",
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "10/01/2021",
                    "DateCreated": "10/14/2021",
                    "PrimaryIndicator": "PRIMARY"
                  },
                  "AcctOpenedDate": "07/14/1999",
                  "AccountReference": 1000009866,
                  "AccountIndicator": "Commercial card",
                  "SecuredAccountIndicator": "Unsecured",
                  "GovtGuarantee": 0,
                  "ActiveAccount": "Y",
                  "RepaymentFrequency": "Monthly",
                  "CurrentCreditLimit": 18000,
                  "HiCreditOrOrigLoanAmount": 15640,
                  "BalanceAmount": 6268,
                  "ScheduledPaymentAmount": 62,
                  "PastDueAmount": 0,
                  "AmtPastDueCycle1": 0,
                  "AmtPastDueCycle2": 0,
                  "AmtPastDueCycle3": 0,
                  "AmtPastDueCycle4": 0,
                  "AmtPastDueCycle5": 0,
                  "CountPaymentOnTime": 24,
                  "Count30DayPastDue": 0,
                  "Count60DayPastDue": 0,
                  "Count90DayPastDue": 0,
                  "Count120DayPastDue": 0,
                  "CountOver120DayPastDue": 0,
                  "PaymentHistoryPeriod": 24,
                  "CountNoOfGuarantors": 0,
                  "LastPaymentDate": "03/12/2020",
                  "AgingStatus": "Current",
                  "PaymentHistoryProfile": "B0B0B0BB000B00BBBBB00000000000000000000000000000000000000000",
                  "CurrentBalance": 6268,
                  "OverallStatus": "Current"
                },
                "TradeHistory": [
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": 0,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "08/01/2021"
                    },
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": 0,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "06/01/2021"
                    },
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": 0,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "03/04/2021"
                    },
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": 0,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "02/03/2021"
                    },
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": 0,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "01/02/2021"
                    },
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "GovtGuarantee": 0,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "11/01/2020"
                    },
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "GovtGuarantee": 0,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "10/01/2020"
                    },
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": "N",
                    "GuarantorsOnAccount": "N",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 6268,
                    "ScheduledPaymentAmount": 62,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "03/12/2020",
                    "TraitActivity": {
                      "ReportedDate": "04/03/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 6268,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": "N",
                    "GuarantorsOnAccount": "N",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 2400,
                    "ScheduledPaymentAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "02/15/2020",
                    "TraitActivity": {
                      "ReportedDate": "03/03/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 2400,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": "N",
                    "GuarantorsOnAccount": "N",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 4259,
                    "ScheduledPaymentAmount": 42,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "01/16/2020",
                    "TraitActivity": {
                      "ReportedDate": "02/03/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 4259,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": "N",
                    "GuarantorsOnAccount": "N",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 9737,
                    "ScheduledPaymentAmount": 97,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "12/16/2019",
                    "TraitActivity": {
                      "ReportedDate": "01/03/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 9737,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "07/14/1999",
                    "AccountReference": 1000009866,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "GovtGuarantee": "N",
                    "GuarantorsOnAccount": "N",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 18000,
                    "HiCreditOrOrigLoanAmount": 15640,
                    "BalanceAmount": 4716,
                    "ScheduledPaymentAmount": 47,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "AmtPastDueCycle4": 0,
                    "AmtPastDueCycle5": 0,
                    "CountPaymentOnTime": 24,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 24,
                    "LastPaymentDate": "11/14/2019",
                    "TraitActivity": {
                      "ReportedDate": "12/03/2019"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 4716,
                    "OverallStatus": "Current"
                  }
                ]
              },
              {
                "CurrentTrade": {
                  "FiAcctInd": "Y",
                  "NonFiAcctInd": "N",
                  "ClosedInd": "N",
                  "OpenInd": "Y",
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "10/01/2021",
                    "DateCreated": "10/14/2021",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "AcctOpenedDate": "12/19/1991",
                  "AccountReference": 1000009867,
                  "AccountIndicator": "Commercial card",
                  "SecuredAccountIndicator": "Unsecured",
                  "ActiveAccount": "Y",
                  "RepaymentFrequency": "Monthly",
                  "CurrentCreditLimit": 0,
                  "HiCreditOrOrigLoanAmount": 0,
                  "BalanceAmount": 0,
                  "PastDueAmount": 0,
                  "CountPaymentOnTime": 0,
                  "Count30DayPastDue": 0,
                  "Count60DayPastDue": 0,
                  "Count90DayPastDue": 0,
                  "Count120DayPastDue": 0,
                  "CountOver120DayPastDue": 0,
                  "PaymentHistoryPeriod": 0,
                  "CountNoOfGuarantors": 1,
                  "AgingStatus": "Current",
                  "HighCreditDate": "01/17/2014",
                  "PaymentHistoryProfile": "B0B0B0BB000B00BBBB000000000000000000000000000000000000000000",
                  "CurrentBalance": 0,
                  "OverallStatus": "Current"
                },
                "TradeHistory": [
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "TraitActivity": {
                      "ReportedDate": "08/01/2021"
                    },
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "TraitActivity": {
                      "ReportedDate": "06/01/2021"
                    },
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "TraitActivity": {
                      "ReportedDate": "03/04/2021"
                    },
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "TraitActivity": {
                      "ReportedDate": "02/03/2021"
                    },
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "TraitActivity": {
                      "ReportedDate": "01/02/2021"
                    },
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "TraitActivity": {
                      "ReportedDate": "11/01/2020"
                    },
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "TraitActivity": {
                      "ReportedDate": "10/01/2020"
                    },
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "d_highRiskIndicators": "E1",
                    "TraitActivity": {
                      "ReportedDate": "05/31/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "d_highRiskIndicators": "E1",
                    "TraitActivity": {
                      "ReportedDate": "04/30/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "d_highRiskIndicators": "E1",
                    "TraitActivity": {
                      "ReportedDate": "03/31/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "d_highRiskIndicators": "E1",
                    "TraitActivity": {
                      "ReportedDate": "02/29/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "d_highRiskIndicators": "E1",
                    "TraitActivity": {
                      "ReportedDate": "01/31/2020"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  },
                  {
                    "AcctOpenedDate": "12/19/1991",
                    "AccountReference": 1000009867,
                    "AccountIndicator": "Commercial card",
                    "SecuredAccountIndicator": "Unsecured",
                    "ActiveAccount": "Y",
                    "RepaymentFrequency": "Monthly",
                    "CurrentCreditLimit": 0,
                    "BalanceAmount": 0,
                    "PastDueAmount": 0,
                    "CountPaymentOnTime": 0,
                    "Count30DayPastDue": 0,
                    "Count60DayPastDue": 0,
                    "Count90DayPastDue": 0,
                    "Count120DayPastDue": 0,
                    "CountOver120DayPastDue": 0,
                    "PaymentHistoryPeriod": 0,
                    "d_highRiskIndicators": "E1",
                    "TraitActivity": {
                      "ReportedDate": "12/31/2019"
                    },
                    "PaymentRating": "Current",
                    "CurrentBalance": 0,
                    "OverallStatus": "Current"
                  }
                ]
              },
              {
                "CurrentTrade": {
                  "FiAcctInd": "N",
                  "NonFiAcctInd": "Y",
                  "ClosedInd": "N",
                  "OpenInd": "Y",
                  "TraitActivity": {
                    "InformationSource": {
                      "IndustryCode": "Industry Code Masked",
                      "IndustryGroup": "Communications"
                    },
                    "ReportedDate": "10/01/2021",
                    "DateCreated": "10/14/2021",
                    "PrimaryIndicator": "ADDITIONAL"
                  },
                  "AccountReference": 1000009849,
                  "AccountIndicator": "Trade",
                  "ActiveAccount": "Y",
                  "HiCreditOrOrigLoanAmount": 24,
                  "BalanceAmount": 24,
                  "PastDueAmount": 0,
                  "AmtPastDueCycle1": 0,
                  "AmtPastDueCycle2": 0,
                  "AmtPastDueCycle3": 0,
                  "CountNoOfGuarantors": 0,
                  "AgingStatus": "Current",
                  "PaymentHistoryProfile": "B0B0B0BB000B00BBB0B0BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
                  "CurrentBalance": 24,
                  "OverallStatus": "Current"
                },
                "TradeHistory": [
                  {
                    "AccountReference": 1000009849,
                    "AccountIndicator": "Trade",
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "08/01/2021"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "AccountIndicator": "Trade",
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "06/01/2021"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "AccountIndicator": "Trade",
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "03/04/2021"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "AccountIndicator": "Trade",
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "02/03/2021"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "AccountIndicator": "Trade",
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "01/02/2021"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "11/01/2020"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "10/01/2020"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "AccountIndicator": "Trade",
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "06/28/2020"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  },
                  {
                    "AccountReference": 1000009849,
                    "AccountIndicator": "Trade",
                    "BalanceAmount": 24,
                    "PastDueAmount": 0,
                    "AmtPastDueCycle1": 0,
                    "AmtPastDueCycle2": 0,
                    "AmtPastDueCycle3": 0,
                    "TraitActivity": {
                      "ReportedDate": "04/28/2020"
                    },
                    "CurrentBalance": 24,
                    "OverallStatus": "Current"
                  }
                ]
              }
            ],
            "Inquiries": [
              {
                "InquiryDate": "03/02/2020",
                "Industry": "Financial"
              },
              {
                "InquiryDate": "02/01/2021",
                "Industry": "Financial"
              },
              {
                "InquiryDate": "05/13/2021",
                "Industry": "Financial"
              }
            ],
            "SOSTrait": {
              "TraitActivity": {
                "InformationSource": "",
                "ReportedDate": "01/28/2020",
                "DateCreated": "03/18/2009",
                "PrimaryIndicator": "PRIMARY"
              },
              "IdTrait": {
                "AddressTrait": {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "01/28/2020",
                    "DateCreated": "03/18/2009",
                    "PrimaryIndicator": "PRIMARY"
                  },
                  "AddressLine1": "957445 IGNATOV MD PA RD",
                  "City": "MECHANICSVILLE",
                  "State": "VA",
                  "Country": "USA",
                  "PostalCode": "23111-6428",
                  "AddressType": "BUSINESS_PREMISE",
                  "StandardizationStatus": "Standardized"
                },
                "CompanyNameTrait": {
                  "TraitActivity": {
                    "InformationSource": "",
                    "ReportedDate": "01/28/2020",
                    "DateCreated": "03/18/2009",
                    "PrimaryIndicator": "PRIMARY"
                  },
                  "BusinessName": "FODERA",
                  "LegalBusinessName": "LGLFODERA"
                }
              },
              "CurrentSOSDataTrait": {
                "FileDataDate": "01/28/2020",
                "CorpStatusCode": "ACTIVE",
                "RegistryNumber": "S1068677",
                "IncorporationDate": "10/17/2003",
                "IncorporationState": "VA",
                "TraitActivity": {
                  "InformationSource": "",
                  "ReportedDate": "01/28/2020",
                  "DateCreated": "03/18/2009",
                  "PrimaryIndicator": "PRIMARY"
                }
              }
            },
            "Site": [
              {
                "EfxId": 570551439,
                "FolderActivity": {
                  "FileActivityDate": "02/15/2019",
                  "FileCreationDate": "02/11/2019",
                  "InquiredIndicator": "INQUIRED"
                },
                "TraitActivity": {
                  "MatchQuality": {
                    "MatchValue": 8
                  }
                },
                "IdTrait": {
                  "AddressTrait": {
                    "TraitActivity": {
                      "InformationSource": "",
                      "ReportedDate": "01/19/2019",
                      "DateCreated": "02/11/2019",
                      "PrimaryIndicator": "PRIMARY",
                      "MatchQuality": {
                        "MatchQualityAttribute": [
                          {
                            "AttributeValue": "MECHANICSVILLE,VA,23111",
                            "MatchValue": 4
                          },
                          {
                            "AttributeValue": "640132 3101 RD",
                            "MatchValue": 1
                          }
                        ]
                      }
                    },
                    "AddressLine1": "640132 3101 RD",
                    "City": "MECHANICSVILLE",
                    "State": "VA",
                    "Country": "UNITED STATES OF AMERICA",
                    "PostalCode": "23111-6428",
                    "AddressType": "BUSINESS_PREMISE",
                    "StandardizationStatus": "Standardized",
                    "TelephoneTrait": {
                      "TelephoneNumber": 1111124824
                    },
                    "CountryCode": 840
                  },
                  "CompanyNameTrait": {
                    "TraitActivity": {
                      "InformationSource": "",
                      "ReportedDate": "01/19/2019",
                      "DateCreated": "02/11/2019",
                      "PrimaryIndicator": "PRIMARY",
                      "MatchQuality": {
                        "MatchValue": 4,
                        "MatchQualityAttribute": {
                          "AttributeValue": "FODERA"
                        }
                      }
                    },
                    "BusinessName": "FODERA",
                    "LegalBusinessName": "LGLFODERA"
                  }
                },
                "FirmographicsTrait": {
                  "CurrentFirm": {
                    "TraitActivity": {
                      "InformationSource": "",
                      "ReportedDate": "01/19/2019",
                      "DateCreated": "02/11/2019",
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "LiabilityIndicator": "Limited Liability Company"
                  }
                }
              },
              {
                "EfxId": 570551416,
                "FolderActivity": {
                  "FileActivityDate": "10/14/2021",
                  "FileCreationDate": "06/13/2002",
                  "ParentIndicator": "PARENT"
                },
                "IdTrait": {
                  "AddressTrait": [
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "10/01/2021",
                        "DateCreated": "06/13/2002",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "AddressLine1": "C3202 ROYAL GLEN DDR RD",
                      "City": "MECHANICSVLLE",
                      "State": "VA",
                      "Country": "USA",
                      "PostalCode": 23111,
                      "StandardizationStatus": "Standardized",
                      "TradeLinkInfo": [
                        {
                          "AccountReference": 1000009866,
                          "ReportedDate": "10/01/2021"
                        },
                        {
                          "AccountReference": 1000009867,
                          "ReportedDate": "10/01/2021"
                        },
                        {
                          "AccountReference": 1000009849,
                          "ReportedDate": "10/01/2021"
                        }
                      ]
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "01/28/2020",
                        "DateCreated": "03/18/2009",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "AddressLine1": "957445 IGNATOV MD PA RD",
                      "City": "MECHANICSVILLE",
                      "State": "VA",
                      "Country": "USA",
                      "PostalCode": "23111-6428",
                      "AddressType": "BUSINESS_PREMISE",
                      "StandardizationStatus": "Standardized"
                    }
                  ],
                  "IdNumberTrait": [
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "04/16/2019",
                        "DateCreated": "04/21/2005",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "IdNumber": "XXXXX5838",
                      "IdNumberIndicator": "Tax ID",
                      "TradeLinkInfo": [
                        {
                          "AccountReference": 1000009867,
                          "ReportedDate": "04/16/2019"
                        },
                        {
                          "AccountReference": 1000009866,
                          "ReportedDate": "05/02/2018"
                        }
                      ]
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "06/04/2018",
                        "DateCreated": "06/13/2002",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "IdNumber": "XXXXX5840",
                      "IdNumberIndicator": "Tax ID"
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "04/03/2020",
                        "DateCreated": "03/06/2018",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "IdNumber": "XXXXX5841",
                      "IdNumberIndicator": "Tax ID",
                      "TradeLinkInfo": {
                        "AccountReference": 1000009866,
                        "ReportedDate": "04/03/2020"
                      }
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "04/28/2020",
                        "DateCreated": "07/03/2020",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "IdNumber": "XXXXX3456",
                      "TradeLinkInfo": {
                        "AccountReference": 1000009849,
                        "ReportedDate": "04/28/2020"
                      }
                    }
                  ],
                  "CompanyNameTrait": [
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "10/01/2021",
                        "DateCreated": "01/20/2006",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "BusinessName": "FODERA",
                      "TradeLinkInfo": {
                        "AccountReference": 1000009849,
                        "ReportedDate": "10/01/2021"
                      }
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "06/04/2018",
                        "DateCreated": "09/30/2016",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "BusinessName": "FODERAb"
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "12/05/2016",
                        "DateCreated": "06/05/2008",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "BusinessName": "FODERA",
                      "DoingBusinessAs": "DBAFODERA"
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "10/01/2021",
                        "DateCreated": "06/13/2002",
                        "PrimaryIndicator": "ADDITIONAL"
                      },
                      "BusinessName": "FODERAa",
                      "LegalBusinessName": "LGLFODERA",
                      "SICCode": 1731,
                      "SICDescription": "Electrical Work",
                      "NAICSCode": 238210,
                      "NAICSDescription": "Electrical Contractors",
                      "TradeLinkInfo": [
                        {
                          "AccountReference": 1000009866,
                          "ReportedDate": "10/01/2021"
                        },
                        {
                          "AccountReference": 1000009867,
                          "ReportedDate": "10/01/2021"
                        }
                      ]
                    },
                    {
                      "TraitActivity": {
                        "InformationSource": "",
                        "ReportedDate": "01/28/2020",
                        "DateCreated": "03/18/2009",
                        "PrimaryIndicator": "PRIMARY"
                      },
                      "BusinessName": "FODERA",
                      "SICCode": 1731,
                      "SICDescription": "Electrical Work",
                      "NAICSCode": 238210,
                      "NAICSDescription": "Electrical Contractors",
                      "LegalBusinessName": "LGLFODERA"
                    }
                  ]
                },
                "PrincipalTrait": [
                  {
                    "TraitActivity": {
                      "InformationSource": "",
                      "ReportedDate": "05/31/2020",
                      "DateCreated": "04/21/2005",
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "Folder": {
                      "FolderActivity": {
                        "FileActivityDate": "06/17/2020",
                        "FileCreationDate": "04/21/2005"
                      },
                      "IdTrait": {
                        "PersonNameTrait": [
                          {
                            "TraitActivity": {
                              "InformationSource": "",
                              "ReportedDate": "05/31/2020",
                              "DateCreated": "01/20/2006",
                              "PrimaryIndicator": "PRIMARY"
                            },
                            "FirstName": "JIESHI",
                            "LastName": "LADERA"
                          },
                          {
                            "TraitActivity": {
                              "InformationSource": "",
                              "ReportedDate": "03/31/2020",
                              "DateCreated": "04/21/2005",
                              "PrimaryIndicator": "ADDITIONAL"
                            },
                            "FirstName": "JIESHI",
                            "MiddleName": "F",
                            "LastName": "LADERA"
                          }
                        ],
                        "AddressTrait": {
                          "TraitActivity": {
                            "InformationSource": "",
                            "ReportedDate": "05/31/2020",
                            "DateCreated": "04/21/2005",
                            "PrimaryIndicator": "PRIMARY"
                          },
                          "AddressLine1": "957445 IGNATOV MD PA RD",
                          "City": "MECHANICSVLLE",
                          "State": "VA",
                          "Country": "USA",
                          "PostalCode": "23111-6428",
                          "StandardizationStatus": "Standardized",
                          "TelephoneTrait": {
                            "TelephoneNumber": 1111124823
                          }
                        },
                        "IdNumberTrait": {
                          "TraitActivity": {
                            "InformationSource": "",
                            "ReportedDate": "05/31/2020",
                            "DateCreated": "10/20/2005",
                            "PrimaryIndicator": "PRIMARY"
                          },
                          "IdNumber": "XXXXXXXX8",
                          "IdNumberIndicator": "SSN"
                        }
                      }
                    },
                    "PrincipalInfoSource": [
                      {
                        "IsGuarantor": "N",
                        "AccountReference": 1000009866,
                        "PreviousAccountReference": 1000009866
                      },
                      {
                        "IsGuarantor": "Y",
                        "AccountReference": 1000009867
                      }
                    ]
                  },
                  {
                    "TraitActivity": {
                      "InformationSource": "",
                      "ReportedDate": "04/03/2020",
                      "DateCreated": "03/06/2018",
                      "PrimaryIndicator": "ADDITIONAL"
                    },
                    "Folder": {
                      "FolderActivity": {
                        "FileActivityDate": "04/06/2020",
                        "FileCreationDate": "03/06/2018"
                      },
                      "IdTrait": {
                        "PersonNameTrait": {
                          "TraitActivity": {
                            "InformationSource": "",
                            "ReportedDate": "04/03/2020",
                            "DateCreated": "03/06/2018",
                            "PrimaryIndicator": "PRIMARY"
                          },
                          "FirstName": "JIESHI",
                          "MiddleName": "F",
                          "LastName": "LADERA"
                        },
                        "AddressTrait": {
                          "TraitActivity": {
                            "InformationSource": "",
                            "ReportedDate": "04/03/2020",
                            "DateCreated": "03/06/2018",
                            "PrimaryIndicator": "PRIMARY"
                          },
                          "AddressLine1": "957445 IGNATOV MD PA RD",
                          "City": "MECHANICSVLLE",
                          "State": "VA",
                          "Country": "USA",
                          "PostalCode": "23111-6428",
                          "StandardizationStatus": "Standardized"
                        },
                        "IdNumberTrait": {
                          "TraitActivity": {
                            "InformationSource": "",
                            "ReportedDate": "04/03/2020",
                            "DateCreated": "03/06/2018",
                            "PrimaryIndicator": "PRIMARY"
                          },
                          "IdNumber": "XXXXXXXX1",
                          "IdNumberIndicator": "Tax ID"
                        }
                      }
                    },
                    "PrincipalInfoSource": {
                      "IsGuarantor": "N",
                      "AccountReference": 1000009866
                    }
                  }
                ],
                "FirmographicsTrait": {
                  "CurrentFirm": {
                    "TraitActivity": {
                      "InformationSource": "",
                      "ReportedDate": "04/04/2020",
                      "DateCreated": "05/21/2020",
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "SICCode": 1731,
                    "NAICSCode": 238210,
                    "LiabilityIndicator": "Corporation",
                    "YearStarted": 1991,
                    "NumberOfEmployees": "2 to 4",
                    "AnnualSalesRange": "$1 - $249,999",
                    "SICDescription": "Electrical Work",
                    "NAICSDescription": "Electrical Contractors",
                    "YearsInBusiness": 30
                  }
                }
              },
              {
                "EfxId": 570551416,
                "FolderActivity": "",
                "HierarchyProperties": {
                  "BusinessLevel": "Headquarters",
                  "HeadquartersInd": "Y",
                  "HierarchyLevel": 1,
                  "FamilySequence": 1
                },
                "IdTrait": {
                  "AddressTrait": {
                    "TraitActivity": {
                      "InformationSource": {
                        "IndustryCode": "Industry Code Masked"
                      },
                      "DateCreated": "12/21/2021",
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "AddressLine1": "957445 IGNATOV MD PA RD",
                    "City": "MECHANICSVILLE",
                    "State": "VA",
                    "Country": "UNITED STATES OF AMERICA",
                    "TelephoneTrait": {
                      "TelephoneNumber": 1111124823
                    }
                  },
                  "CompanyNameTrait": {
                    "TraitActivity": {
                      "InformationSource": {
                        "IndustryCode": "Industry Code Masked"
                      },
                      "DateCreated": "12/21/2021",
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "BusinessName": "FODERA",
                    "SICCode": 1731,
                    "SICDescription": "Electrical Work"
                  }
                },
                "FirmographicsTrait": {
                  "CurrentFirm": {
                    "TraitActivity": {
                      "InformationSource": {
                        "IndustryCode": "Industry Code Masked"
                      },
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "SICCode": 1731,
                    "NAICSCode": 238210,
                    "SICDescription": "Electrical Work",
                    "NAICSDescription": "Electrical Contractors"
                  }
                }
              },
              {
                "EfxId": 570551439,
                "FolderActivity": "",
                "HierarchyProperties": {
                  "BusinessLevel": "Branch",
                  "ReportingType": "BRANCH",
                  "ParentOrLegalEntityEfxId": 570551416,
                  "HierarchyLevel": 1,
                  "FamilySequence": 2,
                  "InquiredIndicator": 1
                },
                "IdTrait": {
                  "AddressTrait": {
                    "TraitActivity": {
                      "InformationSource": {
                        "IndustryCode": "Industry Code Masked"
                      },
                      "DateCreated": "12/21/2021",
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "AddressLine1": "640132 3101 RD",
                    "City": "MECHANICSVILLE",
                    "State": "VA",
                    "Country": "UNITED STATES OF AMERICA",
                    "TelephoneTrait": {
                      "TelephoneNumber": 1111124824
                    },
                    "CountryCode": 840
                  },
                  "CompanyNameTrait": {
                    "TraitActivity": {
                      "InformationSource": {
                        "IndustryCode": "Industry Code Masked"
                      },
                      "DateCreated": "12/21/2021",
                      "PrimaryIndicator": "PRIMARY"
                    },
                    "BusinessName": "FODERA"
                  }
                }
              }
            ]
          }
        }
      }
    }
    return setreport2;
}
get loanProducts(){


    let loanproducts=[
      {
"Product_ID": "1",
        "Name": "Solar+5.599",
"Type": "loan",
"Months": "60",
"Years": "5",
"Min_Loan_Amount": "$25,000.00",
"Max_Loan_Amount": "$1,000,000.00",
"ACH_rate": "5.99%",
"Non_ACH_rate": "6.49%",
"ACH_discount": "0.50%",
"Dealer_Fee": "0%",
"Origination_Fee": "3%",
"Prepayment": "Yes%",
"percentage_of_Prepayment": "26.00%",
"Prepay_Months": "18",
"Down_Payment": "0",
"Status": "Active"
      },
      {
        "Product_ID": "2",
        "Name": "Solar+10.649",
"Type": "loan",
"Months": "120",
"Years": "10",
"Min_Loan_Amount": "$25,000.00",
"Max_Loan_Amount": "$1,000,000.00",
"ACH_rate": "6.49%",
"Non_ACH_rate": "6.99%",
"ACH_discount": "0.50%",
"Dealer_Fee": "0%",
"Origination_Fee": "3%",
"Prepayment": "yes",
"percentage_of_Prepayment": "26.00%",
"Prepay_Months": "18",
"Down_Payment": "0",
"Status": "res"
      },
{
        "Product_ID": "3",
        "Name": "Solar+10.649",
"Type": "loan",
"Months": "180",
"Years": "15",
"Min_Loan_Amount": "$25,000.00",
"Max_Loan_Amount": "$1,000,000.00",
"ACH_rate": "7.49%",
"Non_ACH_rate": "7.99%",
"ACH_discount": "0.50%",
"Dealer_Fee": "0%",
"Origination_Fee": "3%",
"Prepayment": "yes",
"percentage_of_Prepayment": "26.00%",
"Prepay_Months": "18",
"Down_Payment": "0",
"Status": "res"
      },
{
        "Product_ID": "4",
        "Name": "Solar+10.649",
"Type": "loan",
"Months": "60",
"Years": "5",
"Min_Loan_Amount": "$25,000.00",
"Max_Loan_Amount": "$1,000,000.00",
"ACH_rate": "3.99%",
"Non_ACH_rate": "4.49%",
"ACH_discount": "0.50%",
"Dealer_Fee": "10%",
"Origination_Fee": "0%",
"Prepayment": "yes",
"percentage_of_Prepayment": "26.00%",
"Prepay_Months": "18",
"Down_Payment": "0",
"Status": "res"
      },
{
        "Product_ID": "5",
        "Name": "Solar+10.649",
"Type": "loan",
"Months": "120",
"Years": "10",
"Min_Loan_Amount": "$25,000.00",
"Max_Loan_Amount": "$1,000,000.00",
"ACH_rate": "4.49%",
"Non_ACH_rate": "4.99%",
"ACH_discount": "0.50%",
"Dealer_Fee": "10%",
"Origination_Fee": "0%",
"Prepayment": "yes",
"percentage_of_Prepayment": "26.00%",
"Prepay_Months": "18",
"Down_Payment": "0",
"Status": "res"
      },
{
        "Product_ID": "6",
        "Name": "Solar+10.649",
"Type": "loan",
"Months": "180",
"Years": "15",
"Min_Loan_Amount": "$25,000.00",
"Max_Loan_Amount": "$1,000,000.00",
"ACH_rate": "5.49%",
"Non_ACH_rate": "5.99%",
"ACH_discount": "0.50%",
"Dealer_Fee": "10%",
"Origination_Fee": "0%",
"Prepayment": "yes",
"percentage_of_Prepayment": "26.00%",
"Prepay_Months": "18",
"Down_Payment": "0",
"Status": "res"
      },
     
]
  return loanproducts
}

get PSPS4117(){
  let PSPS4117_val=[
    {
     "Code": 6000,
     "Value": "Monthly Scheduled Payment (FFF)"
    },
    {
     "Code": 6028,
     "Value": "Personal Monthly Income"
    },
    {
     "Code": 6030,
     "Value": "Scheduled Monthly Payment (R&D Lab)"
    },
    {
     "Code": 6031,
     "Value": "Monthly Current Debt Payment "
    },
    {
     "Code": 6032,
     "Value": "Monthly Disposable Income w\/Scheduled Payment (R&D Lab)"
    },
    {
     "Code": 6033,
     "Value": "Monthly Disposable Income w\/Current Debt "
    },
    {
     "Code": 6036,
     "Value": "Debt to Income Ratio w\/Scheduled Payment (R&D Lab)"
    },
    {
     "Code": 6037,
     "Value": "Debt to Income Ratio w\/Current Debt (R&D Lab)"
    },
    {
     "Code": 6003,
     "Value": "Collection Amount"
    },
    {
     "Code": 6002,
     "Value": "Major Derogatory Amount"
    },
    {
     "Code": 6013,
     "Value": "Child\/Family Support Scheduled Payment Amount"
    }
   ]

  return PSPS4117_val
}
get PSPS4116(){
  let PSPS4116_val=[
    {
     "Code": 6000,
     "Value": "Monthly Scheduled Payment (FFF)"
    },
    {
     "Code": 6017,
     "Value": "First Mortgage Scheduled Monthly Payment"
    },
    {
     "Code": 6011,
     "Value": "Auto Scheduled Monthly Payment"
    },
    {
     "Code": 6016,
     "Value": "Other Installment Scheduled Monthly Payment"
    },
    {
     "Code": 6012,
     "Value": "Bankcard Scheduled Monthly Payment"
    },
    {
     "Code": 6018,
     "Value": "Other Revolving Scheduled Monthly Payment"
    },
    {
     "Code": 6014,
     "Value": "Home Equity Line of Credit Scheduled Monthly Payment"
    },
    {
     "Code": 6015,
     "Value": "Home Equity Loan Scheduled Monthly Payment"
    },
    {
     "Code": 6009,
     "Value": "First Mortgage Monthly Current Debt Payment"
    },
    {
     "Code": 6004,
     "Value": "Auto Monthly Current Debt Payment"
    },
    {
     "Code": 6008,
     "Value": "Other Installment Monthly Current Debt Payment"
    },
    {
     "Code": 6005,
     "Value": "Bankcard Monthly Current Debt Payment"
    },
    {
     "Code": 6010,
     "Value": "Other Revolving Monthly Current Debt Payment"
    },
    {
     "Code": 6006,
     "Value": "Home Equity Line of Credit Monthly Current Debt Payment"
    },
    {
     "Code": 6007,
     "Value": "Home Equity Loan Monthly Current Debt Payment"
    },
    {
     "Code": 6003,
     "Value": "Collection Amount"
    },
    {
     "Code": 6002,
     "Value": "Major Derogatory Amount"
    },
    {
     "Code": 6013,
     "Value": "Child\/Family Support Scheduled Payment Amount"
    },
    {
     "Code": 6028,
     "Value": "Personal Monthly Income"
    },
    {
     "Code": 6030,
     "Value": "Scheduled Monthly Payment (R&D Lab)"
    },
    {
     "Code": 6031,
     "Value": "Monthly Current Debt Payment "
    },
    {
     "Code": 6032,
     "Value": "Monthly Disposable Income w\/Scheduled Payment (R&D Lab)"
    },
    {
     "Code": 6033,
     "Value": "Monthly Disposable Income w\/Current Debt "
    },
    {
     "Code": 6036,
     "Value": "Debt to Income Ratio w\/Scheduled Payment (R&D Lab)"
    },
    {
     "Code": 6037,
     "Value": "Debt to Income Ratio w\/Current Debt (R&D Lab)"
    }
   ]

  return PSPS4116_val
}
get PSPS4118(){
  let PSPS4118_val=[
    {
     "Code": 6000,
     "Value": "Monthly Scheduled Payment (FFF)"
    },
    {
     "Code": 6030,
     "Value": "Scheduled Monthly Payment (R&D Lab)"
    },
    {
     "Code": 6031,
     "Value": "Monthly Current Debt Payment "
    },
    {
     "Code": 6003,
     "Value": "Collection Amount"
    },
    {
     "Code": 6002,
     "Value": "Major Derogatory Amount"
    },
    {
     "Code": 6013,
     "Value": "Child\/Family Support Scheduled Payment Amount"
    }
   ]

  return PSPS4118_val
}
get PSPS4119(){
  let PSPS4119_val=[
    {
     "Code": 6030,
     "Value": "Scheduled Monthly Payment (R&D Lab)"
    }
   ]
   return PSPS4119_val
}
get PSPS4128(){
  let PSPS4128_val=[
    {
     "Code": 6000,
     "Value": "Monthly Scheduled Payment (FFF)"
    }
   ]
   return PSPS4128_val
}
get PSPS4129(){

	let PSPS4129_val=[
	{
  "code": 6000,
  "value": "Monthly Scheduled Payment (FFF)"
 },
 {
  "code": 6001,
  "value": "Monthly Scheduled Payment (AMS 4.0)"
 },
 {
  "code": 6002,
  "value": "Major Derogatory Amount"
 },
 {
  "code": 6003,
  "value": "Collection Amount"
 },
 {
  "code": 6004,
  "value": "Auto Monthly Current Debt Payment"
 },
 {
  "code": 6005,
  "value": "Bankcard Monthly Current Debt Payment"
 },
 {
  "code": 6006,
  "value": "Home Equity Line of Credit Monthly Current Debt Payment"
 },
 {
  "code": 6007,
  "value": "Home Equity Loan Monthly Current Debt Payment"
 },
 {
  "code": 6008,
  "value": "Other Installment Monthly Current Debt Payment"
 },
 {
  "code": 6009,
  "value": "First Mortgage Monthly Current Debt Payment"
 },
 {
  "code": 6010,
  "value": "Other Revolving Monthly Current Debt Payment"
 },
 {
  "code": 6011,
  "value": "Auto Scheduled Monthly Payment"
 },
 {
  "code": 6012,
  "value": "Bankcard Scheduled Monthly Payment"
 },
 {
  "code": 6013,
  "value": "Child\/Family Support Scheduled Payment Amount"
 },
 {
  "code": 6014,
  "value": "Home Equity Line of Credit Scheduled Monthly Payment"
 },
 {
  "code": 6015,
  "value": "Home Equity Loan Scheduled Monthly Payment"
 },
 {
  "code": 6016,
  "value": "Other Installment Scheduled Monthly Payment"
 },
 {
  "code": 6017,
  "value": "First Mortgage Scheduled Monthly Payment"
 },
 {
  "code": 6018,
  "value": "Other Revolving Scheduled Monthly Payment"
 },
 {
  "code": 6019,
  "value": "Other Revolving Open to Buy"
 },
 {
  "code": 6020,
  "value": "Other Installment Open to Buy"
 },
 {
  "code": 6021,
  "value": "Auto Open to Buy"
 },
 {
  "code": 6022,
  "value": "Bankcard Open to Buy"
 },
 {
  "code": 6023,
  "value": "First Mortgage Open to Buy"
 },
 {
  "code": 6024,
  "value": "First Mortgage Balance"
 },
 {
  "code": 6025,
  "value": "First Mortgage High Credit\/Credit Limit"
 },
 {
  "code": 6026,
  "value": "Home Equity Loan Open to Buy"
 },
 {
  "code": 6027,
  "value": "Home Equity Line of Credit Open to Buy"
 },
 {
  "code": 6028,
  "value": "Personal Monthly Income"
 },
 {
  "code": 6029,
  "value": "Equity in Home"
 },
 {
  "code": 6030,
  "value": "Scheduled Monthly Payment (R&D Lab)"
 },
 {
  "code": 6031,
  "value": "Monthly Current Debt Payment "
 },
 {
  "code": 6032,
  "value": "Monthly Disposable Income w\/Scheduled Payment (R&D Lab)"
 },
 {
  "code": 6033,
  "value": "Monthly Disposable Income w\/Current Debt "
 },
 {
  "code": 6034,
  "value": "Monthly Disposable Income w\/PIM & SCHED_PAYMT_AMT"
 },
 {
  "code": 6035,
  "value": "Monthly Disposable Income w\/PIM & SCH_PMT_AMT"
 },
 {
  "code": 6036,
  "value": "Debt to Income Ratio w\/Scheduled Payment (R&D Lab)"
 },
 {
  "code": 6037,
  "value": "Debt to Income Ratio w\/Current Debt (R&D Lab)"
 },
 {
  "code": 6038,
  "value": "Debt to Income Ratio w\/Monthly Scheduled Payment (FFF)"
 },
 {
  "code": 6039,
  "value": "Debt to Income Ratio w\/Monthly Schedule Payment (AMS 4.0)"
 },
 {
  "code": 6040,
  "value": "Home Equity High Credit\/Credit Limit"
 },
 {
  "code": 6045,
  "value": "Other Revolving Balance"
 },
 {
  "code": 6046,
  "value": "Other Revolving Credit Limit High Credit"
 },
 {
  "code": 6047,
  "value": "Other Revolving High Credit"
 },
 {
  "code": 6048,
  "value": "Other Installment Balance"
 },
 {
  "code": 6049,
  "value": "Other Installment Credit Limit High Credit"
 },
 {
  "code": 6050,
  "value": "Other Installment High Credit"
 },
 {
  "code": 6051,
  "value": "Auto Balance"
 },
 {
  "code": 6052,
  "value": "Auto Credit Limit High Credit"
 },
 {
  "code": 6053,
  "value": "Auto High Credit"
 },
 {
  "code": 6054,
  "value": "Bankcard Balance"
 },
 {
  "code": 6055,
  "value": "Bankcard  Credit Limit High Credit"
 },
 {
  "code": 6056,
  "value": "Bankcard  High Credit"
 },
 {
  "code": 6057,
  "value": "First Mortgage  High Credit"
 },
 {
  "code": 6058,
  "value": "Home Equity Loan Balance"
 },
 {
  "code": 6059,
  "value": "Home Equity Loan  Credit Limit High Credit"
 },
 {
  "code": 6060,
  "value": "Home Equity Loan  High Credit"
 },
 {
  "code": 6061,
  "value": "Home Equity Line of Credit Balance"
 },
 {
  "code": 6062,
  "value": "Home Equity Line of Credit Credit Limit High Credit"
 },
 {
  "code": 6063,
  "value": "Home Equity Line of Credit High Credit"
 },
 {
  "code": 6064,
  "value": "Home Equity Balance"
 },
 {
  "code": 6065,
  "value": "Home Equity Open to Buy"
 },
 {
  "code": 6066,
  "value": "Home Equity High Credit"
 },

]
	return PSPS4129_val
	
}

get commonEquifaxRules(){

  let data:any ={}

  let Rules=[
    {
      "Rules": "FICO is 700 or over",
      "RuleMessage": "FICO is 700 or over",
      "RuleStatus": "PASS"
    },
    {
      "Rules": "FICO is between 680-699 ($25-$100K)",
      "RuleMessage": "FICO is between 680-699 ($25-$100K)",
      "RuleStatus": "BY PASS"
    },
    {
      "Rules": "Modeled DTI from BPR is >= 60% without loan debt considered",
      "RuleMessage": "Modeled DTI from BPR is >= 60% without loan debt considered",
      "RuleStatus": "BY PASS"
    },
    {
      "Rules": "FICO is less than 680 (679 and below)",
      "RuleMessage": "FICO is less than 680 (679 and below)",
      "RuleStatus": "PASS"
    },
    {
      "Rules": "BPR indicates any bankruptcies in past 2 years",
      "RuleMessage": "BPR indicates any bankruptcies in past 2 years",
      "RuleStatus": "PASS"
    },
    {
      "Rules": "BPR indicates any judgements / liens in past 2 years",
      "RuleMessage": "BPR indicates any judgements / liens in past 2 years",
      "RuleStatus": "PASS"
    }
    
  ]


  let BankRules =[
    {
      "Rules": "Business Credit Score (CIDS) is less than 540",
      "RuleMessage": "Business Credit Score (CIDS) is less than 540",
      "RuleStatus": "PASS"
    },
    {
      "Rules": "Time in business based in inception date is less than 3 years",
      "RuleMessage": "Time in business based in inception date is less than 3 years",
      "RuleStatus": "PASS"
    },
    {
      "Rules": "BCIR indicates a bankruptcy in past 7 years",
      "RuleMessage": "BCIR indicates a bankruptcy in past 7 years",
      "RuleStatus": "PASS"
    },
    {
      "Rules": "BCIR indicates judgements / liens in past 2 years",
      "RuleMessage": "BCIR indicates judgements / liens in past 2 years",
      "RuleStatus": "PASS"
    },
    {
      "Rules": "BCIR Credit Score (CIDS) is NULL",
      "RuleMessage": "BCIR Credit Score (CIDS) is NULL",
      "RuleStatus": "PASS"
    }
  ]

  data.Rules=Rules;
  data.BankRules=BankRules


  return data
}



}
//intance
export var FinanceInatance = new FinanceMath();
export var CommonDataInatance = new AdminCommonData();
export var EquifaxInstance = new EquifaxCommonData();