import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid2,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { fetchExchangeRates, PriceData } from "../services/api";

// Function to get token icon path from `public/tokens`
const getTokenIcon = (currency: string | null | undefined) => {
  return currency ? `/tokens/${currency}.svg` : "";
};

const CurrencySwapForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [swapHistory, setSwapHistory] = useState<
    {
      amount: string;
      fromCurrency: string;
      toCurrency: string;
      convertedAmount: string;
      timestamp: string;
    }[]
  >([]);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [lastSwappedAmount, setLastSwappedAmount] = useState<string | null>(null);
  const [lastFromCurrency, setLastFromCurrency] = useState<string | null>(null);
  const [lastToCurrency, setLastToCurrency] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<PriceData[] | null>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      amount: "",
      fromCurrency: "USD", // ✅ Đặt USD làm default từ currency
      toCurrency: "ETH", // ✅ Đặt EUR làm default to currency
    },
  });

  useEffect(() => {
    const getRates = async () => {
      const rates = await fetchExchangeRates();
      if (rates) {
        setExchangeRates(rates);
        const uniqueCurrencies = [
          ...new Set(rates.map((item) => item.currency)),
        ];
        setCurrencies(uniqueCurrencies);
      }
    };
    getRates();
  }, []);

  const onSubmit = (data: any) => {
    const { amount, fromCurrency, toCurrency } = data;

    if (fromCurrency === toCurrency) {
      console.error("Cannot swap the same currency!");
      return;
    }

    if (!exchangeRates) {
      console.error("Exchange rates not available!");
      return;
    }
    const fromRate = exchangeRates.find(
      (item) => item.currency === fromCurrency
    );
    const toRate = exchangeRates.find((item) => item.currency === toCurrency);

    if (!fromRate || !toRate) {
      console.error("Rates not found for selected currencies!");
      return;
    }

    setLoading(true);
    setConvertedAmount(null);

    setTimeout(() => {
      const rate = toRate.price / fromRate.price;
      const result = (parseFloat(amount) * rate).toFixed(3);
      console.log("Conversion result:", result);
      setConvertedAmount(result);
      setLastSwappedAmount(amount);
      setLastFromCurrency(fromCurrency);
      setLastToCurrency(toCurrency);
      setSwapHistory((prevHistory) => [
        {
          amount,
          fromCurrency,
          toCurrency,
          convertedAmount: result,
          timestamp: new Date().toLocaleString(),
        },
        ...prevHistory,
      ]);
      setLoading(false);
    }, 2000);
  };

  const fromCurrency = watch("fromCurrency");
  const toCurrency = watch("toCurrency");

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: 650,
          margin: "auto",
          mt: { xs: 3, md: 5 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Card
          sx={{ p: 3, boxShadow: 4, borderRadius: 3, backgroundColor: "#fff" }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
            >
              Currency Swap
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: "Please enter an amount",
                  min: { value: 1, message: "Amount must be greater than 0" },
                  pattern: {
                    value: /^[0-9]+(\.[0-9]+)?$/,
                    message: "Only numbers are allowed",
                  },
                }}
                render={({ field: { onChange, value, ...restField } }) => (
                  <TextField
                    {...restField}
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (/^\d*\.?\d*$/.test(newValue) || newValue === "") {
                        onChange(newValue);
                      }
                    }}
                    fullWidth
                    label="Amount"
                    variant="outlined"
                    error={!!errors.amount}
                    helperText={errors.amount ? errors.amount.message : ""}
                    sx={{ mb: 3 }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment: value ? (
                        <Button
                          onClick={() => onChange("")}
                          sx={{ minWidth: "auto", padding: 0, color: "#888" }}
                        >
                          ✖
                        </Button>
                      ) : null,
                    }}
                  />
                )}
              />

              <Grid2
                container
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  width: "100%",
                  maxWidth: 500,
                  margin: "auto",
                }}
              >
                {/* From Currency */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1,
                      fontWeight: "bold",
                      color: "#555",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    From
                  </Typography>
                  <Controller
                    name="fromCurrency"
                    control={control}
                    rules={{ required: "Please select a currency" }}
                    render={({ field }) => (
                      <FormControl
                        sx={{
                          width: "100%",
                          textAlign: "center",
                        }}
                        error={!!errors.fromCurrency}
                      >
                        <Select
                          {...field}
                          displayEmpty
                          sx={{
                            width: "100%",
                            minWidth: { xs: "auto", sm: "auto" },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between", // ✅ Ensure selected value aligns well
                            py: 1,
                            px: 2,
                          }}
                          renderValue={(selected) => {
                            const currency = selected as string; // ✅ Prevents empty values
                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                {currency !== "N/A" ? (
                                  <img
                                    src={getTokenIcon(currency)}
                                    alt={currency}
                                    width="28"
                                    height="28"
                                    style={{
                                      borderRadius: "50%",
                                      border: "1px solid #ddd",
                                      backgroundColor: "#fff",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"; // ✅ Hide broken images
                                    }}
                                  />
                                ) : (
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: "1rem",
                                      fontWeight: "500",
                                      color: "#888",
                                    }}
                                  >
                                    ❓
                                  </Typography>
                                )}
                                <Typography
                                  component="span"
                                  sx={{ fontSize: "1rem", fontWeight: "500" }}
                                >
                                  {currency.toUpperCase()}
                                </Typography>
                              </Box>
                            );
                          }}
                        >
                          {currencies.map((currency) => (
                            <MenuItem
                              key={currency}
                              value={currency}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <img
                                src={getTokenIcon(currency)}
                                alt={currency}
                                width="24"
                                height="24"
                                style={{
                                  borderRadius: "50%",
                                  border: "1px solid #ddd",
                                  backgroundColor: "#fff",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              {currency}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid2>

                {/* To Currency */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1,
                      fontWeight: "bold",
                      color: "#555",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    To
                  </Typography>
                  <Controller
                    name="toCurrency"
                    control={control}
                    rules={{ required: "Please select a currency" }}
                    render={({ field }) => (
                      <FormControl
                        sx={{
                          width: "100%",
                          textAlign: "center",
                        }}
                        error={!!errors.toCurrency}
                      >
                        <Select
                          {...field}
                          displayEmpty
                          sx={{
                            width: "100%",
                            minWidth: { xs: "auto", sm: "auto" },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between", // ✅ Ensure selected value aligns well
                            py: 1,
                            px: 2,
                          }}
                          renderValue={(selected) => {
                            const currency = selected as string; // ✅ Prevents empty values
                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                {currency !== "N/A" ? (
                                  <img
                                    src={getTokenIcon(currency)}
                                    alt={currency}
                                    width="28"
                                    height="28"
                                    style={{
                                      borderRadius: "50%",
                                      border: "1px solid #ddd",
                                      backgroundColor: "#fff",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"; // ✅ Hide broken images
                                    }}
                                  />
                                ) : (
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: "1rem",
                                      fontWeight: "500",
                                      color: "#888",
                                    }}
                                  >
                                    ❓
                                  </Typography>
                                )}
                                <Typography
                                  component="span"
                                  sx={{ fontSize: "1rem", fontWeight: "500" }}
                                >
                                  {currency.toUpperCase()}
                                </Typography>
                              </Box>
                            );
                          }}
                        >
                          {currencies.map((currency) => (
                            <MenuItem
                              key={currency}
                              value={currency}
                              disabled={currency === fromCurrency}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <img
                                src={getTokenIcon(currency)}
                                alt={currency}
                                width="24"
                                height="24"
                                style={{
                                  borderRadius: "50%",
                                  border: "1px solid #ddd",
                                  backgroundColor: "#fff",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              {currency}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid2>
              </Grid2>

              {/* Swap Button */}
              <CardActions
                sx={{
                  mt: 3,
                  mb: 0,
                  p: 0,
                  minWidth: 300,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                  disabled={!isValid || loading || fromCurrency === toCurrency}
                  sx={{ fontWeight: "bold", fontSize: "1rem", py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Swap"}
                </Button>
              </CardActions>

              {/* Show Conversion Result */}
              {convertedAmount !== null && (
                <Typography
                  variant="h6"
                  sx={{ mt: 3, textAlign: "center", fontWeight: "bold" }}
                >
              {lastSwappedAmount}{" "}
              {lastFromCurrency} = {convertedAmount}{" "}
              {lastToCurrency}
                </Typography>
              )}

              {/* Show Error if currencies are the same */}
              {fromCurrency &&
                toCurrency &&
                fromCurrency === toCurrency &&
                fromCurrency !== "" &&
                toCurrency !== "" && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    Cannot select the same currency!
                  </Typography>
                )}
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Swap History Table */}
      {swapHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Swap History
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
                  <th
                    style={{
                      padding: "10px",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    From
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    To
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Converted
                  </th>
                </tr>
              </thead>
              <tbody>
                {swapHistory.map((entry, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    <td style={{ padding: "8px" }}>{entry.timestamp}</td>
                    <td style={{ padding: "8px" }}>{entry.amount}</td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <img
                          src={getTokenIcon(entry.fromCurrency)}
                          alt={entry.fromCurrency}
                          width="20"
                          height="20"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        {entry.fromCurrency}
                      </Box>
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <img
                          src={getTokenIcon(entry.toCurrency)}
                          alt={entry.toCurrency}
                          width="20"
                          height="20"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        {entry.toCurrency}
                      </Box>
                    </td>
                    <td style={{ padding: "8px", fontWeight: "bold" }}>
                      {entry.convertedAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      )}
    </>
  );
};

export default CurrencySwapForm;
