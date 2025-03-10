// interface after merging the two interfaces into one.
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}


//Remove Props and Use BoxProps Directly
//This makes the code cleaner and removes unnecessary abstraction.
const WalletPage: React.FC<BoxProps> = (props) => {
  const { children, ...rest } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices = usePrices();

  // Optimization: Use an object instead of switch-case
  const getPriority = (blockchain: string): number => {
    const priorities: Record<string, number> = {
      Osmosis: 100,
      Ethereum: 50,
      Arbitrum: 30,
      Zilliqa: 20,
      Neo: 20,
    };
    return priorities[blockchain] ?? -99;
  };

  // Optimization: Filter and sort in one step
  const sortedBalances: WalletBalance[] = useMemo(() => {
    return balances
      .filter(
        (balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0
      )
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain)); // Descending order
  }, [balances]);

  return (
    <div {...rest}>
      {sortedBalances.map((balance: WalletBalance) => {
        const usdValue = prices[balance.currency]
          ? prices[balance.currency] * balance.amount
          : 0;
        return (
          <WalletRow
            key={balance.currency} // Use a unique key
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.amount.toFixed(2)}
          />
        );
      })}
    </div>
  );
};

export default WalletPage;
