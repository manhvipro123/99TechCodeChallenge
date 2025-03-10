//basically the WalletBalance and FormattedWalletBalance
//are the same, but the FormattedWalletBalance has an extra property called formatted.
//The formatted property is not an inherent attribute of the wallet balance; it is just a presentation detail.
//It is better to format the balance directly in the WalletRow component.
//And merge the two interfaces into one.
interface WalletBalance {
    currency: string;
    amount: number;
  }
  interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
  }
  

  //Props is just inheriting everything from BoxProps without adding any extra properties.
  interface Props extends BoxProps {
  
  }

  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
  
      const getPriority = (blockchain: any): number => { // Using any defeats the purpose of TypeScript.
        switch (blockchain) {
          case 'Osmosis':
            return 100
          case 'Ethereum':
            return 50
          case 'Arbitrum':
            return 30
          case 'Zilliqa':
            return 20
          case 'Neo':
            return 20
          default:
            return -99
        }
      }
  
    const sortedBalances = useMemo(() => {
      return balances.filter((balance: WalletBalance) => {
            const balancePriority = getPriority(balance.blockchain); // blockchain is not a property of WalletBalance,leading to a runtime error.
            if (lhsPriority > -99) { // lhsPriority is not declared, leading to a runtime error.
               if (balance.amount <= 0) { // It only allows balance.amount <= 0 but the lhsPriority > -99 check is irrelevant.
                 return true;
               }
            }
            return false
          }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
              const leftPriority = getPriority(lhs.blockchain);
            const rightPriority = getPriority(rhs.blockchain);
            if (leftPriority > rightPriority) {
              return -1;
            } else if (rightPriority > leftPriority) {
              return 1;
            }
            //Sorting does not always return a value (return 0 is missing).
      });
    }, [balances, prices]);
  
    //This array is unnecessary since formatting can be done directly inside WalletRow.
    const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
      return {
        ...balance,
        formatted: balance.amount.toFixed()
      }
    })
  
    const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
      // If prices[balance.currency] is undefined, multiplying it by amount will result in NaN.
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow 
          className={classes.row}
          key={index} // Anti-pattern: using index as key. 
          // Using index as a key can cause issues when reordering or updating lists
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      )
    })
  
    return (
      <div {...rest}>
        {rows}
      </div>
    )
  }